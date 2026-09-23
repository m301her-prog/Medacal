import {OfflineStore,isOfflineError} from './OfflineStore';
const API_ORIGIN=(import.meta.env.VITE_API_ORIGIN||'https://medacal.vercel.app').replace(/\/$/,'');
export const API_ENDPOINTS=Object.freeze({chat:`${API_ORIGIN}/api/chat`,customers:`${API_ORIGIN}/api/customers`,dashboard:`${API_ORIGIN}/api/dashboard`,integrations:`${API_ORIGIN}/api/integrations`,medicines:`${API_ORIGIN}/api/medicines`,sales:`${API_ORIGIN}/api/sales`});
export class ApiError extends Error{constructor(message,status=0,details=null){super(message);this.name='ApiError';this.status=status;this.details=details}}
function headers(extra={}){return{Accept:'application/json','Content-Type':'application/json',...extra}}
async function request(url,{method='GET',body,signal,headers:extraHeaders}={}){let response;try{response=await fetch(url,{method,headers:headers(extraHeaders),body:body===undefined?undefined:JSON.stringify(body),signal,credentials:'omit'})}catch(error){throw new ApiError('تعذر الاتصال بخادم البيانات. تحقق من الإنترنت أو استخدم الوضع المحلي.',0,error)}const contentType=response.headers.get('content-type')||'';const raw=await response.text();let data;try{data=raw?JSON.parse(raw):{}}catch{if(contentType.includes('text/html')||raw.trim().startsWith('<!'))throw new ApiError(`رابط API أعاد صفحة HTML بدل JSON: ${url}`,response.status,raw.slice(0,160));throw new ApiError('استجابة غير صالحة من خادم البيانات.',response.status,raw.slice(0,160))}if(!response.ok||data.error)throw new ApiError(data.error||`فشل الطلب (${response.status})`,response.status,data);return data}
function localSale(sale){return{sale:{...sale,created_at:sale.created_at||new Date().toISOString(),offline:true},offline:true}}
const service={
 endpoints:API_ENDPOINTS,
 get:(resource,options)=>request(API_ENDPOINTS[resource]||resource,{method:'GET',...options}),
 post:(resource,body,options)=>request(API_ENDPOINTS[resource]||resource,{method:'POST',body,...options}),
 put:(resource,body,options)=>request(API_ENDPOINTS[resource]||resource,{method:'PUT',body,...options}),
 delete:(resource,query='',options)=>request(`${API_ENDPOINTS[resource]||resource}${query?`?${new URLSearchParams(query)}`:''}`,{method:'DELETE',...options}),
 chat:(message,history=[],options)=>request(API_ENDPOINTS.chat,{method:'POST',body:{message,history},...options}),
 async listMedicines(query='',options){try{const data=await request(`${API_ENDPOINTS.medicines}${query?`?q=${encodeURIComponent(query)}`:''}`,{method:'GET',...options});if(!query)await OfflineStore.saveMedicines(data.items||[]);return data}catch(error){const items=(await OfflineStore.getMedicines()).filter(x=>!query||JSON.stringify(x).toLowerCase().includes(query.toLowerCase()));if(items.length||isOfflineError(error))return{items,offline:true};throw error}},
 async createMedicine(medicine,options){try{const data=await request(API_ENDPOINTS.medicines,{method:'POST',body:medicine,...options});const items=await OfflineStore.getMedicines();await OfflineStore.saveMedicines([data.item||medicine,...items]);return data}catch(error){if(!isOfflineError(error))throw error;const item={...medicine,id:medicine.id||`offline-${Date.now()}`,offline:true};await OfflineStore.saveMedicines([item,...await OfflineStore.getMedicines()]);await OfflineStore.enqueue({method:'POST',resource:'medicines',body:medicine});return{item,offline:true}}},
 async removeMedicine(id,options){try{const data=await request(API_ENDPOINTS.medicines,{method:'DELETE',body:{id},...options});await OfflineStore.saveMedicines((await OfflineStore.getMedicines()).filter(x=>x.id!==id));return data}catch(error){if(!isOfflineError(error))throw error;await OfflineStore.saveMedicines((await OfflineStore.getMedicines()).filter(x=>x.id!==id));await OfflineStore.enqueue({method:'DELETE',resource:'medicines',body:{id}});return{offline:true}}},
 listCustomers:(options)=>request(API_ENDPOINTS.customers,{method:'GET',...options}),
 listSales:(options)=>request(API_ENDPOINTS.sales,{method:'GET',...options}),
 async createSale(sale,options){try{return await request(API_ENDPOINTS.sales,{method:'POST',body:sale,...options})}catch(error){if(!isOfflineError(error))throw error;await OfflineStore.enqueue({method:'POST',resource:'sales',body:sale});return localSale(sale)}},
 dashboard:(options)=>request(API_ENDPOINTS.dashboard,{method:'GET',...options}),
 integration:(payload,options)=>request(API_ENDPOINTS.integrations,{method:'POST',body:payload,...options}),
 async syncOfflineQueue(){const queue=await OfflineStore.getQueue();if(!queue.length||!navigator.onLine)return{synced:0,pending:queue.length};const pending=[];let synced=0;for(const operation of queue){try{await request(API_ENDPOINTS[operation.resource],{method:operation.method,body:operation.body});synced++}catch(error){pending.push(operation);if(isOfflineError(error))break}}await OfflineStore.replaceQueue(pending);if(synced)await OfflineStore.markSynced();return{synced,pending:pending.length}},
};
export default service;
