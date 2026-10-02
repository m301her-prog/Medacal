import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {App as CapacitorApp} from '@capacitor/app';
import {Network} from '@capacitor/network';
import App from './App';
import api from './lib/ApiService';
import {notifyLowStock,requestLowStockNotifications} from './lib/LowStockNotifications';
import {notifyExpiry} from './lib/ExpiryAlerts';
import './index.css';

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));

async function refreshOfflineState(){
  try{
    await api.syncOfflineQueue();
    const data=await api.listMedicines();
    await notifyLowStock(data.items||[]);
    await notifyExpiry(data.items||[]);
  }catch(error){console.warn('offline sync:',error)}
}

// Android asks once for notification permission, then synchronizes queued writes on reconnect.
requestLowStockNotifications().catch(()=>{});
refreshOfflineState();
Network.addListener('networkStatusChange',status=>{if(status.connected)refreshOfflineState()}).catch(()=>{});
window.addEventListener('online',refreshOfflineState);

CapacitorApp.addListener('backButton',({canGoBack})=>{if(window.__formatechMenuOpen){window.dispatchEvent(new CustomEvent('formatech:close-menu'));return}const modal=document.querySelector('.scanner-modal');if(modal){modal.querySelector('.scanner-close')?.click();return}const onHome=window.location.pathname==='/'||window.location.pathname==='';if(canGoBack&&!onHome&&window.history.length>1)window.history.back();else if(onHome)CapacitorApp.exitApp()}).catch(()=>{});
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
