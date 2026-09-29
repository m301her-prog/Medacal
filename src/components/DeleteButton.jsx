import {LoaderCircle,Trash2} from 'lucide-react';

export default function DeleteButton({label='حذف',confirmMessage='هل تريد حذف هذا العنصر؟',onDelete,disabled=false,compact=false}){
  const handleClick=async()=>{
    if(disabled||!window.confirm(confirmMessage))return;
    await onDelete();
  };
  return <button className={`delete-button ${compact?'compact':''}`} type="button" onClick={handleClick} disabled={disabled} title={label} aria-label={label}>
    {disabled?<LoaderCircle className="spin" size={compact?14:16}/>:<Trash2 size={compact?14:16}/>} {!compact&&label}
  </button>;
}
