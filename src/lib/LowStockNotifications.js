import {registerPlugin} from '@capacitor/core';
import {Capacitor} from '@capacitor/core';

const LowStockNative = registerPlugin('LowStockNotifications');

export async function requestLowStockNotifications() {
  if (!Capacitor.isNativePlatform()) return {granted: 'browser' in window && 'Notification' in window ? Notification.permission : 'unsupported'};
  return LowStockNative.requestPermission();
}

export async function notifyLowStock(items = []) {
  const low = items.filter(item => Number(item.stock_quantity ?? item.stock ?? 0) <= Number(item.min_stock_alert ?? 5));
  if (!low.length) return {sent: false, count: 0};
  const names = low.slice(0, 3).map(item => item.trade_name || item.name || 'دواء').join('، ');
  if (Capacitor.isNativePlatform()) return LowStockNative.notify({count: low.length, names});
  if ('Notification' in window && Notification.permission === 'granted') new Notification('تنبيه مخزون فرما تيك', {body: `${low.length} أصناف تحت الحد الأدنى: ${names}`});
  return {sent: true, count: low.length};
}
