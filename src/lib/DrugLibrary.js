const LIBRARY_URL='/egyptian-drugs.json';

function asArray(payload){
  if(Array.isArray(payload))return payload;
  if(Array.isArray(payload?.drugs))return payload.drugs;
  if(Array.isArray(payload?.medicines))return payload.medicines;
  if(payload&&typeof payload==='object')return Object.values(payload).filter(x=>x&&typeof x==='object');
  return [];
}

export function normalizeDrug(item={}){
  return {
    ...item,
    trade_name:item.trade_name||item.tradeName||item.name||item.brand_name||item.brand||'',
    scientific_name:item.scientific_name||item.scientificName||item.generic_name||item.generic||'',
    active_ingredient:item.active_ingredient||item.activeIngredient||item.active||item.composition||'',
    barcode:String(item.barcode||item.ean||item.gtin||item.code||'').trim(),
    manufacturer:item.manufacturer||item.company||item.pharmaceutical_company||'',
    dosage_form:item.dosage_form||item.dosageForm||item.form||'',
    strength:item.strength||item.concentration||'',
    package_size:item.package_size||item.pack||item.pack_size||''
  };
}

let promise;
export function loadDrugLibrary(){
  if(!promise)promise=fetch(LIBRARY_URL,{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error('تعذر تحميل مكتبة الأدوية المحلية');return r.json()}).then(asArray).then(items=>items.map(normalizeDrug));
  return promise;
}

export function findDrugByBarcode(items,barcode){
  const value=String(barcode||'').trim();
  if(!value)return null;
  return items.find(item=>String(item.barcode||'').trim()===value)||null;
}

export function searchDrugLibrary(items,query){
  const q=String(query||'').trim().toLowerCase();
  if(!q)return [];
  return items.filter(item=>[item.trade_name,item.scientific_name,item.active_ingredient,item.barcode].some(value=>String(value||'').toLowerCase().includes(q))).slice(0,8);
}
