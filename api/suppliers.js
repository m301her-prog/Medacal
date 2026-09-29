import {json,method,sql} from './_lib.js';
export default async function handler(req,res){
  if(!method(req,res,['GET','POST','DELETE']))return;
  try{
    if(!sql){if(req.method==='GET')return json(res,{suppliers:[],purchases:[],configured:false});return json(res,{error:'قاعدة البيانات غير مهيأة'},503);}
    if(req.method==='GET'){
      const suppliers=await sql`SELECT s.*,COUNT(po.id)::int AS orders FROM suppliers s LEFT JOIN purchase_orders po ON po.supplier_id=s.id GROUP BY s.id ORDER BY s.created_at DESC`;
      const purchases=await sql`SELECT po.*,s.name AS supplier_name FROM purchase_orders po LEFT JOIN suppliers s ON s.id=po.supplier_id ORDER BY po.created_at DESC LIMIT 100`;
      return json(res,{suppliers,purchases});
    }
    if(req.method==='DELETE'){const id=req.body?.id||req.query?.id;if(!id)return json(res,{error:'معرف المورد مطلوب'},400);await sql`DELETE FROM suppliers WHERE id=${id}`;return json(res,{ok:true,id});}
    const body=req.body||{};
    const row=await sql`INSERT INTO suppliers(name,phone,company_name,balance_due) VALUES(${body.name},${body.phone||null},${body.company_name||body.company||null},${body.balance_due||0}) RETURNING *`;
    return json(res,{supplier:row[0]},201);
  }catch(e){return json(res,{error:e.message},500)}
}
