import {useEffect,useRef,useState} from 'react';
import {Image as ImageIcon,LoaderCircle} from 'lucide-react';
import {getWikipediaImage} from '../lib/WikipediaImage';

export default function DrugImage({drug,className=''}){
 const ref=useRef(null);const [active,setActive]=useState(false);const [image,setImage]=useState(null);const [loading,setLoading]=useState(false);
 useEffect(()=>{const node=ref.current;if(!node)return;const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){setActive(true);observer.disconnect()}},{rootMargin:'180px'});observer.observe(node);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!active||image||loading)return;const controller=new AbortController();setLoading(true);getWikipediaImage(drug,controller.signal).then(setImage).catch(()=>{}).finally(()=>setLoading(false));return()=>controller.abort()},[active,drug,image,loading]);
 return <div ref={ref} className={`drug-image ${className}`} title={image?`صورة من Wikipedia: ${image.title}`:'لا توجد صورة متاحة'}>{image?<img src={image.url} alt={drug.trade_name||drug.name||'دواء'} loading="lazy"/>:loading?<LoaderCircle className="spin" size={16}/>:<ImageIcon size={18}/>}</div>
}
