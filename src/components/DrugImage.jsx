import {Image as ImageIcon} from 'lucide-react';

export default function DrugImage({drug,className=''}){
  const image=drug?.image_data||drug?.image_url||'';
  return <div className={`drug-image ${className}`} title={image?'صورة المنتج من الجهاز':'لم تُرفع صورة لهذا المنتج'}>{image?<img src={image} alt={drug?.trade_name||drug?.name||'دواء'} loading="lazy" onError={e=>{e.currentTarget.style.display='none'}}/>:<ImageIcon size={18}/>}</div>;
}
