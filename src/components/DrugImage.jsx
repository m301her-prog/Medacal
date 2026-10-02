import {useEffect,useRef,useState} from 'react';
import {Image as ImageIcon,LoaderCircle} from 'lucide-react';
import {getWikipediaImage} from '../lib/WikipediaImage';

export default function DrugImage({drug,className=''}){
 const ref=useRef(null);const [active,setActive]=useState(false);const [image,setImage]=useState(null);const [loading,setLoading]=useState(false);const [failed,setFailed]=useState(false);
 useEffect(()=>{const node=ref.current;if(!node)return;const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){setActive(true);observer.disconnect()}},{rootMargin:'180px'});observer.observe(node);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!active||image||loading||failed)return;const controller=new AbortController();setLoading(true);getWikipediaImage(drug,controller.signal).then(result=>{if(result)setImage(result);else setFailed(true)}).catch(()=>setFailed(true)).finally(()=>setLoading(false));return()=>controller.abort()},[active,drug,image,loading,failed]);
 return <div ref={ref} className={`drug-image ${className}`} title={image?`صورة من Wikipedia: ${image.title}`:'لا توجد صورة متاحة'}>{image&&!failed?<img src={image.url} alt={drug.trade_name||drug.name||'دواء'} loading="lazy" onError={()=>setFailed(true)}/>:loading?<LoaderCircle className="spin" size={16}/>:<ImageIcon size={18}/>}</div>
}
