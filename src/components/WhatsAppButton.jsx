import {MessageCircle} from 'lucide-react';

export default function WhatsAppButton({phone,message,label='واتساب',compact=false,title,askForPhone=false}){
 function send(){let value=phone;if(!value&&askForPhone)value=window.prompt('أدخل رقم واتساب بصيغة دولية مثل 2010xxxxxxxx');const raw=String(value||'').replace(/[^\d+]/g,'').replace(/^\+/,'');if(!raw){window.alert('أضف رقم هاتف بصيغة دولية أولاً.');return}window.open(`https://wa.me/${raw}?text=${encodeURIComponent(message||'مرحباً')}`,'_blank','noopener,noreferrer')}
 return <button type="button" className={compact?'icon-button whatsapp-button':'outline-button whatsapp-button'} title={title||label} onClick={send}><MessageCircle size={compact?16:15}/>{!compact&&label}</button>
}
