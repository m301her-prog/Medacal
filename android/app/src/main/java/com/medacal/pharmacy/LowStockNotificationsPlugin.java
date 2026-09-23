package com.medacal.pharmacy;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "LowStockNotifications", permissions = {
    @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
})
public class LowStockNotificationsPlugin extends Plugin {
    private static final String CHANNEL_ID = "formatech-low-stock";
    private static final int PERMISSION_REQUEST = 4112;

    @Override
    public void load() {
        super.load();
        NotificationManager manager = (NotificationManager) getContext().getSystemService(NotificationManager.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "تنبيهات المخزون", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("تنبيه عند وصول صنف إلى الحد الأدنى");
            manager.createNotificationChannel(channel);
        }
    }

    @com.getcapacitor.PluginMethod
    public void requestPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && ActivityCompat.checkSelfPermission(getActivity(), Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissionForAlias("notifications", call, "notifications");
            return;
        }
        JSObject result = new JSObject(); result.put("granted", true); call.resolve(result);
    }

    @com.getcapacitor.PluginMethod
    public void notify(PluginCall call) {
        int count = call.getInt("count", 0);
        String names = call.getString("names", "أصناف دوائية");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && ActivityCompat.checkSelfPermission(getActivity(), Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            call.reject("لم يتم السماح بإشعارات Android"); return;
        }
        NotificationCompat.Builder builder = new NotificationCompat.Builder(getContext(), CHANNEL_ID)
            .setSmallIcon(com.medacal.pharmacy.R.mipmap.ic_launcher)
            .setContentTitle("تنبيه مخزون فرما تيك")
            .setContentText(count + " أصناف تحت الحد الأدنى: " + names)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(count + " أصناف تحت الحد الأدنى للمخزون: " + names))
            .setPriority(NotificationCompat.PRIORITY_HIGH).setAutoCancel(true);
        NotificationManagerCompat.from(getContext()).notify(9001, builder.build());
        JSObject result = new JSObject(); result.put("sent", true); result.put("count", count); call.resolve(result);
    }
}
