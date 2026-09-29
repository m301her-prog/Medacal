import api from './ApiService';
import {OfflineStore} from './OfflineStore';

const LOCAL_INVOICES = 'formatech.invoices';

function readLocal(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}}
function writeLocal(key,value){localStorage.setItem(key,JSON.stringify(value))}

export const DeleteService = {
  async medicine(id){
    const result=await api.removeMedicine(id);
    return { ...result, local:true, resource:'medicines', id };
  },
  async customer(id){
    const result=await api.deleteResource('customers',id);
    const customers=await OfflineStore.getCustomers();
    await OfflineStore.saveCustomers(customers.filter(item=>String(item.id)!==String(id)));
    return { ...result, local:true, resource:'customers', id };
  },
  async invoice(invoice){
    const id=invoice.id||invoice.invoice_number;
    const result=await api.deleteResource('sales',id,{body:{id,invoice_number:invoice.invoice_number}});
    writeLocal(LOCAL_INVOICES,readLocal(LOCAL_INVOICES).filter(item=>item.invoice_number!==invoice.invoice_number));
    return { ...result, local:true, resource:'sales', id };
  },
};

export function removeLocalInvoice(invoiceNumber){
  writeLocal(LOCAL_INVOICES,readLocal(LOCAL_INVOICES).filter(item=>item.invoice_number!==invoiceNumber));
}

export default DeleteService;
