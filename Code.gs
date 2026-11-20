/* Google Apps Script: нәтижелер, оқушы аккаунттары, сынып кодтары, ашық тақырыптар.
   Орнату: Sheet → Кеңейтімдер → Apps Script → осы кодты қою → Script properties: TEACHER_PASS (мұғалім құпиясөзі) →
   Deploy → Manage deployments → ✏️ → Version: New version → Deploy (URL өзгермейді).
   Парақтар "results" және "users" өздігінен құрылады. Сынып кодтары мен ашық тақырыптар мұғалім панелінен басқарылады. */
const HEAD=["id","ts","name","cls","type","para","score","max","pct","grade","status","comment","dur","ans"];
const UHEAD=["key","name","cls","salt","hash","ts"];
const MAXFAIL=8;
function sheet_(n,h){const s=SpreadsheetApp.getActiveSpreadsheet();let t=s.getSheetByName(n);if(!t){t=s.insertSheet(n);t.appendRow(h)}return t}
const sh_=()=>sheet_("results",HEAD), ush_=()=>sheet_("users",UHEAD);
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function P_(){return PropertiesService.getScriptProperties()}
function isT_(p){return !!p&&p===P_().getProperty("TEACHER_PASS")}
function secret_(){let s=P_().getProperty("SECRET");if(!s){s=Utilities.getUuid()+Utilities.getUuid();P_().setProperty("SECRET",s)}return s}
function hex_(b){return b.map(x=>("0"+(x&255).toString(16)).slice(-2)).join("")}
function sha_(s){return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8))}
function tok_(key,hash){return hex_(Utilities.computeHmacSha256Signature(key+"|"+hash,secret_()))}
function norm_(s){return String(s||"").trim().replace(/\s+/g," ").toLowerCase()}
function gen_(){const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s}
const SEED={"6А":"Әбдімарат Алуа|Балтабек Нұрхат|Крикбай Абылай|Мағжанұлы Айсұлтан|Уалиханұлы Азиз|Шакирт Айғаным".split("|"),"6В":"Ахмадиева Аяулым|Бахыт Райян|Джакупова Аиша|Думанқызы Мариям|Жайлаубай Арслан|Жандарбек Бекарыс|Канкина Ханшайым|Қасым Кәусар|Мұрат Санжар|Мұхтар Мұхаммед Али|Мұхтар Мұхаммед Хани|Нурлыбек Райан|Нурманова Дана|Пайзулла Сұлтанғали|Рахымжанов Рамазан|Серәлі Сәния|Тулекенова Айлин|Тұрабай Ахмет|Тілекқабыл Рауан".split("|")};
function cfg_(){
  const p=P_().getProperty("CONFIG");let c=p?JSON.parse(p):null;
  if(!c){c={open:Array.from({length:20},(_,i)=>i+1),classes:{}};
    ["6А","6Ә","6Б","6В","6Г","6Д"].forEach(k=>c.classes[k]=gen_())}
  if(!c.roster){c.roster=SEED;P_().setProperty("CONFIG",JSON.stringify(c))}
  else if(!p)P_().setProperty("CONFIG",JSON.stringify(c));
  return c}
function fold_(s){const m={"ә":"а","ғ":"г","қ":"к","ң":"н","ө":"о","ұ":"у","ү":"у","һ":"х","і":"и","ы":"и","ё":"е","й":"и","ъ":"","ь":""};
  return String(s||"").toLowerCase().replace(/[әғқңөұүһіыёйъь]/g,c=>m[c]).replace(/[^a-zа-я0-9 ]/g," ").trim().split(/\s+/).filter(Boolean).sort().join(" ")}
/* тізім бойынша аты-жөнін тексеру: {ok,name} (тізім бос болса, жазғанын қабылдайды) */
function who_(cls,name){const n=String(name||"").trim().replace(/\s+/g," "),list=(cfg_().roster||{})[cls]||[];
  if(!list.length)return n.length>=3?{ok:true,name:n}:{ok:false};
  const k=fold_(n),f=list.filter(x=>fold_(x)===k)[0];return f?{ok:true,name:f}:{ok:false}}
function clsByCode_(code){const c=cfg_().classes,k=String(code||"").trim().toUpperCase();return Object.keys(c).filter(n=>String(c[n]).toUpperCase()===k)[0]||null}
function users_(){const v=ush_().getDataRange().getValues();v.shift();return v}
function findU_(key){const v=users_();for(let i=0;i<v.length;i++)if(v[i][0]===key)return {row:i+2,name:v[i][1],cls:v[i][2],salt:v[i][3],hash:v[i][4]};return null}
function rows_(){const t=sh_(),v=t.getDataRange().getValues();v.shift();
  return v.map(r=>{const o={};HEAD.forEach((h,i)=>o[h]=r[i]);try{o.ans=o.ans?JSON.parse(o.ans):undefined}catch(e){}if(o.grade==="")o.grade=null;if(o.pct==="")delete o.pct;return o})}
function failed_(key){return Number(CacheService.getScriptCache().get("f_"+key)||0)}
function addFail_(key){CacheService.getScriptCache().put("f_"+key,String(failed_(key)+1),600)}
function clearFail_(key){CacheService.getScriptCache().remove("f_"+key)}
/* сессия тексеру: name, cls, token */
function auth_(b){
  const key=norm_(b.name)+"|"+b.cls,u=findU_(key);
  if(!u||!b.token||b.token!==tok_(key,u.hash))return null;return u}
function doPost(e){
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const b=JSON.parse(e.postData.contents),a=b.action;
    if(a==="config")return out_({ok:true,open:cfg_().open});
    if(a==="check"){const cls=clsByCode_(b.code);if(!cls)return out_({ok:false,err:"code"});
      const w=who_(cls,b.name);if(!w.ok)return out_({ok:false,err:"roster"});
      return out_({ok:true,cls,name:w.name,exists:!!findU_(norm_(w.name)+"|"+cls)})}
    if(a==="register"){const cls=clsByCode_(b.code);if(!cls)return out_({ok:false,err:"code"});
      const w=who_(cls,b.name),pw=String(b.pass||"");
      if(!w.ok)return out_({ok:false,err:"roster"});if(pw.length<4)return out_({ok:false,err:"pass"});const n=w.name;
      const key=norm_(n)+"|"+cls;if(findU_(key))return out_({ok:false,err:"exists"});
      const salt=Utilities.getUuid(),hash=sha_(salt+pw);
      ush_().appendRow([key,n,cls,salt,hash,Date.now()]);
      return out_({ok:true,name:n,cls,token:tok_(key,hash)})}
    if(a==="login"){const cls=clsByCode_(b.code);if(!cls)return out_({ok:false,err:"code"});
      const w=who_(cls,b.name);if(!w.ok)return out_({ok:false,err:"roster"});
      const key=norm_(w.name)+"|"+cls;if(failed_(key)>=MAXFAIL)return out_({ok:false,err:"locked"});
      const u=findU_(key);if(!u||sha_(u.salt+String(b.pass||""))!==u.hash){addFail_(key);return out_({ok:false,err:"pass"})}
      clearFail_(key);return out_({ok:true,name:u.name,cls,token:tok_(key,u.hash)})}
    if(a==="submit"){const u=auth_(b);if(!u)return out_({ok:false,err:"auth"});
      const r=b.record;if(!r||!r.id)return out_({ok:false});
      if(r.type!=="map"&&cfg_().open.indexOf(Number(r.para))<0)return out_({ok:false,err:"closed"});
      r.name=u.name;r.cls=u.cls;
      const t=sh_(),ids=t.getRange(2,1,Math.max(t.getLastRow()-1,1),1).getValues().flat();
      const row=HEAD.map(h=>h==="ans"?(r.ans?JSON.stringify(r.ans):""):(r[h]===undefined||r[h]===null?"":r[h]));
      if(ids.indexOf(r.id)<0)t.appendRow(row);
      return out_({ok:true})}
    if(a==="mine"){const u=auth_(b);if(!u)return out_({ok:false,err:"auth"});
      return out_({ok:true,rows:rows_().filter(r=>r.name===u.name&&r.cls===u.cls)})}
    /* --- мұғалім --- */
    if(failed_("T")>=MAXFAIL)return out_({ok:false,err:"locked"});
    if(!isT_(b.pass)){addFail_("T");return out_({ok:false})}
    clearFail_("T");
    if(a==="list")return out_({ok:true,rows:rows_()});
    if(a==="tconfig"){const c=cfg_();return out_({ok:true,open:c.open,classes:c.classes,roster:c.roster||{},users:users_().map(r=>({name:r[1],cls:r[2],ts:r[5]}))})}
    if(a==="setcfg"){const c=cfg_();
      if(Array.isArray(b.open))c.open=b.open.map(Number).filter(n=>n>=1&&n<=60).sort((x,y)=>x-y);
      if(b.classes&&typeof b.classes==="object"){const cl={};Object.keys(b.classes).forEach(k=>{const v=String(b.classes[k]).trim().toUpperCase();if(k&&v)cl[k]=v});c.classes=cl}
      if(b.roster&&typeof b.roster==="object"){const r={};Object.keys(b.roster).forEach(k=>{r[k]=(b.roster[k]||[]).map(x=>String(x).trim().replace(/\s+/g," ")).filter(x=>x.length>=3)});c.roster=r}
      P_().setProperty("CONFIG",JSON.stringify(c));return out_({ok:true})}
    if(a==="delres"){const t=sh_(),v=t.getDataRange().getValues();let n=0;
      for(let i=v.length-1;i>=1;i--)if(v[i][HEAD.indexOf("name")]===b.name&&String(v[i][HEAD.indexOf("cls")])===String(b.cls)){t.deleteRow(i+1);n++}
      if(b.user){const u=findU_(norm_(b.name)+"|"+b.cls);if(u)ush_().deleteRow(u.row)}
      return out_({ok:true,deleted:n})}
    if(a==="resetpw"){const u=findU_(norm_(b.name)+"|"+b.cls);if(!u)return out_({ok:false});ush_().deleteRow(u.row);return out_({ok:true})}
    if(a==="grade"){const t=sh_(),ids=t.getRange(2,1,Math.max(t.getLastRow()-1,1),1).getValues().flat(),i=ids.indexOf(b.id);
      if(i<0)return out_({ok:false});
      t.getRange(i+2,HEAD.indexOf("grade")+1).setValue(b.grade);
      t.getRange(i+2,HEAD.indexOf("status")+1).setValue("graded");
      t.getRange(i+2,HEAD.indexOf("comment")+1).setValue(b.comment||"");
      return out_({ok:true})}
    return out_({ok:false});
  }finally{lock.releaseLock()}
}
