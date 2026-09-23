package com.medacal.pharmacy.thermal;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Build;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.PluginMethod;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(
    name = "ThermalPrinter",
    permissions = {
        @Permission(alias = "bluetooth", strings = {
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_CONNECT
        })
    }
)
public class ThermalPrinterPlugin extends Plugin {
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private BluetoothSocket socket;
    private OutputStream output;
    private int paperWidth = 58;

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) { call.resolve(); return; }
        if (hasBluetoothPermissions()) { call.resolve(); return; }
        requestPermissionForAlias("bluetooth", call, "permissionsCallback");
    }

    @PermissionCallback
    public void permissionsCallback(PluginCall call) {
        if (hasBluetoothPermissions()) call.resolve();
        else call.reject("لم يتم السماح بأذونات Bluetooth.");
    }

    @PluginMethod
    public void listPairedPrinters(PluginCall call) {
        if (!ensurePermission(call)) return;
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) { call.reject("هذا الجهاز لا يدعم Bluetooth."); return; }
        try {
            JSArray printers = new JSArray();
            Set<BluetoothDevice> bonded = adapter.getBondedDevices();
            for (BluetoothDevice device : bonded) {
                JSObject item = new JSObject();
                item.put("name", device.getName() == null ? "طابعة Bluetooth" : device.getName());
                item.put("address", device.getAddress());
                item.put("bonded", true);
                printers.put(item);
            }
            JSObject result = new JSObject(); result.put("printers", printers); call.resolve(result);
        } catch (SecurityException e) { call.reject("أذونات Bluetooth غير متاحة.", e); }
    }

    @PluginMethod
    public void connect(PluginCall call) {
        if (!ensurePermission(call)) return;
        String address = call.getString("address", "");
        if (address.isEmpty()) { call.reject("عنوان الطابعة مطلوب."); return; }
        executor.execute(() -> {
            try {
                BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
                BluetoothDevice device = adapter.getRemoteDevice(address);
                closeConnection();
                adapter.cancelDiscovery();
                socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
                socket.connect();
                output = socket.getOutputStream();
                JSObject result = new JSObject(); result.put("connected", true); result.put("address", address); call.resolve(result);
            } catch (Exception e) { closeConnection(); call.reject("تعذر الاتصال بالطابعة: " + e.getMessage(), e); }
        });
    }

    @PluginMethod
    public void disconnect(PluginCall call) { closeConnection(); call.resolve(); }

    @PluginMethod
    public void print(PluginCall call) {
        String size = call.getString("paperSize", "58mm");
        paperWidth = "80mm".equals(size) ? 80 : 58;
        if (output == null || socket == null || !socket.isConnected()) { call.reject("لا توجد طابعة متصلة."); return; }
        String text = call.getString("text", "");
        boolean cut = call.getBoolean("cut", true);
        boolean bold = call.getBoolean("bold", false);
        printText(call, text, cut, bold);
    }

    private void printText(PluginCall call, String text, boolean cut, boolean bold) {
        executor.execute(() -> {
            try {
                ByteArrayOutputStream data = new ByteArrayOutputStream();
                data.write(new byte[]{0x1B, 0x40}); // initialize
                data.write(new byte[]{0x1B, 0x61, 0x01}); // center
                if (bold) data.write(new byte[]{0x1B, 0x45, 0x01});
                data.write(bitmapCommand(renderArabicText(text, paperWidth)));
                data.write(new byte[]{0x1B, 0x45, 0x00});
                data.write(new byte[]{0x1B, 0x64, 0x04}); // feed
                if (cut) data.write(new byte[]{0x1D, 0x56, 0x00});
                output.write(data.toByteArray()); output.flush();
                JSObject result = new JSObject(); result.put("printed", true); result.put("paperSize", paperWidth + "mm"); call.resolve(result);
            } catch (Exception e) { call.reject("فشلت الطباعة: " + e.getMessage(), e); }
        });
    }

    @PluginMethod
    public void printReceipt(PluginCall call) {
        String invoice = call.getString("invoiceNumber", "INV");
        String date = call.getString("date", "");
        String payment = call.getString("payment", "cash");
        String total = call.getString("total", "0.00");
        String header = call.getString("header", "فرما تيك\nنظام إدارة الصيدلية");
        String footer = call.getString("footer", "شكراً لتعاملكم معنا");
        StringBuilder receipt = new StringBuilder();
        receipt.append(header).append("\n\n");
        receipt.append("فاتورة بيع: ").append(invoice).append("\n");
        if (!date.isEmpty()) receipt.append("التاريخ: ").append(date).append("\n");
        receipt.append("طريقة الدفع: ").append(payment).append("\n");
        receipt.append("------------------------------\n");
        JSArray items = call.getArray("items");
        if (items != null) for (int i = 0; i < items.length(); i++) {
            try { JSObject item = JSObject.fromJSONObject(items.getJSONObject(i)); receipt.append(item.optString("name", "دواء")).append("  ").append(item.optInt("quantity", 1)).append("  ").append(item.optString("total", "0.00")).append("\n"); } catch (Exception ignored) {}
        }
        receipt.append("------------------------------\n");
        receipt.append("الإجمالي: ").append(total).append(" ر.س\n\n").append(footer).append("\n");
        paperWidth = "80mm".equals(call.getString("paperSize", "58mm")) ? 80 : 58;
        if (output == null || socket == null || !socket.isConnected()) { call.reject("لا توجد طابعة متصلة."); return; }
        printText(call, receipt.toString(), call.getBoolean("cut", true), false);
    }

    // Converts Arabic and mixed-direction text to a bitmap so printers without Arabic code pages print it correctly.
    private Bitmap renderArabicText(String text, int widthMm) {
        int width = widthMm == 80 ? 576 : 384;
        TextPaint paint = new TextPaint(Paint.ANTI_ALIAS_FLAG | Paint.SUBPIXEL_TEXT_FLAG);
        paint.setColor(Color.BLACK); paint.setTextSize(widthMm == 80 ? 26 : 23); paint.setTypeface(Typeface.create("sans", Typeface.NORMAL));
        StaticLayout layout = new StaticLayout(text, paint, width - 24, Layout.Alignment.ALIGN_CENTER, 1.0f, 6f, false);
        Bitmap bitmap = Bitmap.createBitmap(width, Math.max(layout.getHeight() + 12, 24), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap); canvas.drawColor(Color.WHITE); canvas.translate(12, 6); layout.draw(canvas); return bitmap;
    }

    private byte[] bitmapCommand(Bitmap bitmap) throws IOException {
        int widthBytes = (bitmap.getWidth() + 7) / 8;
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write(new byte[]{0x1D, 0x76, 0x30, 0x00, (byte)(widthBytes & 0xFF), (byte)((widthBytes >> 8) & 0xFF), (byte)(bitmap.getHeight() & 0xFF), (byte)((bitmap.getHeight() >> 8) & 0xFF)});
        for (int y = 0; y < bitmap.getHeight(); y++) for (int xByte = 0; xByte < widthBytes; xByte++) { int value = 0; for (int bit = 0; bit < 8; bit++) { int x = xByte * 8 + bit; if (x < bitmap.getWidth() && Color.red(bitmap.getPixel(x, y)) < 160) value |= (0x80 >> bit); } out.write(value); }
        return out.toByteArray();
    }

    private boolean ensurePermission(PluginCall call) { if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !hasBluetoothPermissions()) { call.reject("أذونات Bluetooth مطلوبة. استدعِ requestPermissions أولاً."); return false; } return true; }
    private boolean hasBluetoothPermissions() { return Build.VERSION.SDK_INT < Build.VERSION_CODES.S || (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED); }
    private void closeConnection() { try { if (output != null) output.close(); } catch (Exception ignored) {} try { if (socket != null) socket.close(); } catch (Exception ignored) {} output = null; socket = null; }
    @Override public void handleOnDestroy() { closeConnection(); executor.shutdownNow(); super.handleOnDestroy(); }
}
