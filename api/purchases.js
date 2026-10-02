import {json,method,sql} from './_lib.js';
export default async function handler(req,res){
  if(!method(req,res,['GET','POST']))return;
  try{
    if(!sql)return json(res,{purchases:[],configured:false});
    if(req.method==='GET'){
      const purchases=await sql`SELECT po.*,s.name AS supplier_name,s.phone AS supplier_phone,s.company_name,COALESCE(json_agg(json_build_object('medicine_id',poi.medicine_id,'quantity',poi.quantity,'cost_price',poi.cost_price,'name',m.trade_name) ORDER BY m.trade_name) FILTER (WHERE poi.id IS NOT NULL),'[]') AS items FROM purchase_orders po LEFT JOIN suppliers s ON s.id=po.supplier_id LEFT JOIN purchase_order_items poi ON poi.order_id=po.id LEFT JOIN medicines m ON m.id=poi.medicine_id GROUP BY po.id,s.name,s.phone,s.company_name ORDER BY po.created_at DESC LIMIT 100`;
      return json(res,{purchases});
    }
    const body=req.body||{};const items=body.items||[];const total=items.reduce((sum,item)=>sum+Number(item.quantity||0)*Number(item.cost_price||0),0);
    const rows=await sql`INSERT INTO purchase_orders(supplier_id,total_cost,status) VALUES(${body.supplier_id||null},${total},${body.status||'received'}) RETURNING *`;
    for(const item of items){await sql`INSERT INTO purchase_order_items(order_id,medicine_id,quantity,cost_price) VALUES(${rows[0].id},${item.medicine_id},${item.quantity},${item.cost_price||0})`;if(body.status==='received'||!body.status)await sql`UPDATE medicines SET stock_quantity=stock_quantity+${item.quantity},cost_price=${item.cost_price||0} WHERE id=${item.medicine_id}`;}
    return json(res,{purchase:rows[0]},201);
  }catch(e){return json(res,{error:e.message},500)}
}
