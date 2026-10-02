import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
const TYPES=["emploi","stage","conseil","web","autre"],MAX=5*1024*1024;
const json=(body:unknown,status:number,h:Record<string,string>)=>new Response(JSON.stringify(body),{status,headers:{...h,"Content-Type":"application/json"}});
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 const allowed=(Deno.env.get("ALLOWED_ORIGINS")||"").split(",").map(s=>s.trim()).filter(Boolean);
 const permitted=!allowed.length||!!origin&&allowed.includes(origin);
 const h={"Access-Control-Allow-Origin":permitted?(origin||"*"):"","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Vary":"Origin"};
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:h});
 if(req.method!=="POST")return json({error:"method_not_allowed"},405,h);
 if(!permitted)return json({error:"origin"},403,h);
 if(Number(req.headers.get("content-length")||0)>MAX+65536)return json({error:"file_size"},413,h);
 let form:FormData;try{form=await req.formData();}catch{return json({error:"bad_request"},400,h);}
 const get=(k:string)=>String(form.get(k)||"").trim();
 const data={nom:get("nom"),prenom:get("prenom"),email:get("email"),entreprise:get("entreprise")||null,type_demande:get("type_demande"),message:get("message"),langue:get("langue")==="en"?"en":"fr",consentement:get("consentement")==="true"};
 if(!data.nom||!data.prenom||data.nom.length>100||data.prenom.length>100||data.email.length>200||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)||!TYPES.includes(data.type_demande)||data.message.length<10||data.message.length>5000||(data.entreprise?.length||0)>150||!data.consentement)return json({error:"validation"},400,h);
 const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
 let fichier_path:string|null=null,fichier_nom:string|null=null;
 const file=form.get("fichier");
 if(file instanceof File&&file.size){
  if(file.size>MAX)return json({error:"file_size"},400,h);
  const signature=String.fromCharCode(...new Uint8Array(await file.slice(0,5).arrayBuffer()));
  if(file.type!=="application/pdf"||signature!=="%PDF-")return json({error:"file_type"},400,h);
  fichier_nom=file.name.slice(0,150);fichier_path="messages/"+crypto.randomUUID()+".pdf";
  const upload=await sb.storage.from("pieces-jointes").upload(fichier_path,file,{contentType:"application/pdf"});
  if(upload.error)return json({error:"upload"},500,h);
 }
 const inserted=await sb.from("messages").insert({...data,fichier_path,fichier_nom});
 if(inserted.error){if(fichier_path)await sb.storage.from("pieces-jointes").remove([fichier_path]);return json({error:"insert"},500,h);}
 const key=Deno.env.get("RESEND_API_KEY");let notification="not_configured", notification_status:number|null=null;
 if(key){try{const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({from:Deno.env.get("NOTIFY_FROM")||"Portfolio <onboarding@resend.dev>",to:[Deno.env.get("NOTIFY_EMAIL")||"anaisbrochec@yahoo.fr"],reply_to:data.email,subject:"Portfolio · "+data.type_demande+" · "+data.prenom+" "+data.nom,text:data.prenom+" "+data.nom+" <"+data.email+">\n"+(data.entreprise||"")+"\n\n"+data.message+"\n\n"+(fichier_nom?"Pièce jointe : "+fichier_nom:"")+"\nÀ retrouver dans l’admin du portfolio."}),signal:AbortSignal.timeout(10000)});notification_status=response.status;notification=response.ok?"sent":"failed";if(!response.ok){const issue=await response.json().catch(()=>({}));console.error("Resend notification failed",response.status,issue.name,issue.message);}}catch{notification="failed";console.error("Resend notification unavailable");}}
 return json({ok:true,notification,notification_status},200,h);
});
