import {json,method,sql} from './_lib.js';
export default async function handler(req,res){
  if(!method(req,res,['GET','POST']))return;
  try{
    if(!sql)return json(res,{purchases:[],configured:false});
    if(req.method==='GET'){
      const purchases=await sql`SELECT po.*,s.name AS supplier_name,s.phone AS supplier_phone,s.company_name,COALESCE(json_agg(json_build_object('medicine_id',poi.medicine_id,'quantity',poi.quantity,'cost_price',poi.cost_price,'name',m.trade_name) ORDER BY m.trade_name) FILTER (WHERE poi.id IS NOT NULL),'[]') AS items FROM purchase_orders po LEFT JOIN suppliers s ON s.id=po.supplier_id LEFT JOIN purchase_order_items poi ON poi.order_id=po.id LEFT JOIN medicines m ON m.id=poi.medicine_id GROUP BY po.id,s.name,s.phone,s.company_name ORDER BY po.created_at DESC LIMIT 100`;
      return json(res,{purchases});
    }
    const body=req.body||{};const items=body.items||[];if(!items.length)return json(res,{error:'يجب إضافة دواء واحد على الأقل إلى الطلبية'},400);for(const item of items){if(!item.medicine_id||Number(item.quantity)<=0)return json(res,{error:'بيانات الدواء أو الكمية غير صحيحة'},400);const medicine=await sql`SELECT id FROM medicines WHERE id=${item.medicine_id}`;if(!medicine.length)return json(res,{error:'الدواء المحدد غير موجود في المخزون'},400)}const total=items.reduce((sum,item)=>sum+Number(item.quantity||0)*Number(item.cost_price||0),0);
    const status=body.status||'received';const rows=await sql`INSERT INTO purchase_orders(supplier_id,total_cost,status) VALUES(${body.supplier_id||null},${total},${status}) RETURNING *`;
    for(const item of items){await sql`INSERT INTO purchase_order_items(order_id,medicine_id,quantity,cost_price) VALUES(${rows[0].id},${item.medicine_id},${item.quantity},${item.cost_price||0})`;if(status==='received')await sql`UPDATE medicines SET stock_quantity=COALESCE(stock_quantity,0)+${item.quantity},cost_price=${item.cost_price||0} WHERE id=${item.medicine_id}`;}
    const invoiceItems=await sql`SELECT poi.medicine_id,poi.quantity,poi.cost_price,m.trade_name AS name FROM purchase_order_items poi JOIN medicines m ON m.id=poi.medicine_id WHERE poi.order_id=${rows[0].id} ORDER BY m.trade_name`;
    return json(res,{purchase:{...rows[0],items:invoiceItems}},201);
  }catch(e){return json(res,{error:e.message},500)}
}
