const LIBRARY_URL='/egyptian-drugs.json';
const BARCODE_MAP_KEY='formatech.drug-barcode-map';

function asArray(payload){
  if(Array.isArray(payload))return payload;
  if(Array.isArray(payload?.drugs))return payload.drugs;
  if(Array.isArray(payload?.medicines))return payload.medicines;
  if(payload&&typeof payload==='object')return Object.values(payload).filter(x=>x&&typeof x==='object');
  return [];
}
function key(value){return String(value||'').trim().toLocaleLowerCase('ar').replace(/[\u064B-\u065F]/g,'').replace(/\s+/g,' ')}
function readBarcodeMap(){try{return JSON.parse(localStorage.getItem(BARCODE_MAP_KEY)||'{}')}catch{return{}}}
function writeBarcodeMap(map){localStorage.setItem(BARCODE_MAP_KEY,JSON.stringify(map));return map}

export function normalizeDrug(item={}){
  return {...item,
    trade_name:item.trade_name||item.tradeName||item.name||item.brand_name||item.brand||item.commercial_name_ar||item.commercial_name_en||'',
    scientific_name:item.scientific_name||item.scientificName||item.generic_name||item.generic||'',
    active_ingredient:item.active_ingredient||item.activeIngredient||item.active||item.composition||item.scientific_name||'',
    barcode:String(item.barcode||item.ean||item.gtin||item.code||'').trim(),
    manufacturer:item.manufacturer||item.company||item.pharmaceutical_company||'',
    dosage_form:item.dosage_form||item.dosageForm||item.form||'',
    strength:item.strength||item.concentration||'',package_size:item.package_size||item.pack||item.pack_size||'',
    drug_class:item.drug_class||item.class||'',route:item.route||item.administration_route||'',library_price:item.price_egp??item.price??''
  };
}

export function applySavedBarcodes(items){
  const map=readBarcodeMap();
  return items.map(item=>{const barcode=map[key(item.id)]||map[key(item.trade_name)]||map[key(item.commercial_name_ar)]||map[key(item.commercial_name_en)]||map[key(item.scientific_name)];return barcode?{...item,barcode:String(barcode)}:item});
}

export function mergeBarcodeMappings(items,mappings){
  const map=readBarcodeMap();let matched=0;
  const normalized=Array.isArray(mappings)?mappings:Object.entries(mappings||{}).map(([name,barcode])=>({trade_name:name,barcode}));
  const output=items.map(item=>{
    const candidates=[item.id,item.trade_name,item.commercial_name_ar,item.commercial_name_en,item.scientific_name].map(key).filter(Boolean);
    const row=normalized.find(entry=>[entry.id,entry.trade_name,entry.commercial_name_ar,entry.commercial_name_en,entry.scientific_name,entry.name].map(key).some(value=>value&&candidates.includes(value)));
    if(!row?.barcode)return item;
    const barcode=String(row.barcode).trim();if(!/^\d{8,14}$/.test(barcode))return item;
    candidates.forEach(candidate=>{map[candidate]=barcode});matched++;return {...item,barcode};
  });
  writeBarcodeMap(map);return{items:output,matched,total:normalized.length};
}

export function exportDrugLibrary(items){
  const blob=new Blob([JSON.stringify(items,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='egyptian-drugs-with-barcodes.json';anchor.click();URL.revokeObjectURL(url);
}

let promise;
export function loadDrugLibrary(){
  if(!promise)promise=fetch(LIBRARY_URL,{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error('تعذر تحميل مكتبة الأدوية المحلية');return r.json()}).then(asArray).then(items=>applySavedBarcodes(items.map(normalizeDrug)));
  return promise;
}
export function findDrugByBarcode(items,barcode){const value=String(barcode||'').trim();if(!value)return null;return items.find(item=>String(item.barcode||'').trim()===value)||null}
export function searchDrugLibrary(items,query,limit=8){const q=String(query||'').trim().toLowerCase();if(!q)return [];const result=items.filter(item=>[item.trade_name,item.commercial_name_ar,item.commercial_name_en,item.scientific_name,item.active_ingredient,item.manufacturer,item.barcode].some(value=>String(value||'').toLowerCase().includes(q)));return Number.isFinite(limit)?result.slice(0,limit):result}
