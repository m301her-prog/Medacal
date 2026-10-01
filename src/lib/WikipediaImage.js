const CACHE_KEY='formatech.wikipedia-drug-images.v1';
const memory=new Map();
function readCache(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch{return{}}}
function writeCache(cache){try{localStorage.setItem(CACHE_KEY,JSON.stringify(cache))}catch{} }
function candidates(drug){return [...new Set([drug.trade_name,drug.commercial_name_ar,drug.arabic,drug.scientific_name,drug.active_ingredient,drug.active,drug.generic_name,drug.commercial_name_en].map(x=>String(x||'').trim()).filter(x=>x.length>2))]}
async function searchWiki(language,term,signal){const url=new URL(`https://${language}.wikipedia.org/w/api.php`);url.search=new URLSearchParams({action:'query',generator:'search',gsrsearch:term,gsrnamespace:'0',gsrlimit:'1',prop:'pageimages',piprop:'thumbnail',pithumbsize:'300',format:'json',origin:'*'});const response=await fetch(url,{signal});if(!response.ok)return null;const data=await response.json();const page=Object.values(data.query?.pages||{})[0];return page?.thumbnail?.source?{url:page.thumbnail.source,title:page.title,language}:null}
export async function getWikipediaImage(drug,signal){const key=String(drug.id||drug.barcode||drug.trade_name||drug.name||'').trim().toLowerCase();if(!key)return null;if(memory.has(key))return memory.get(key);const cache=readCache();if(cache[key]){memory.set(key,cache[key]);return cache[key]}
 for(const term of candidates(drug)){for(const language of ['ar','en']){try{const image=await searchWiki(language,term,signal);if(image){memory.set(key,image);cache[key]=image;const keys=Object.keys(cache);if(keys.length>500)delete cache[keys[0]];writeCache(cache);return image}}catch(error){if(error.name==='AbortError')throw error}}}
 memory.set(key,null);return null
}
