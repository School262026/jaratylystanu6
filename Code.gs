/* Google Apps Script: нәтижелерді Google Sheets-ке сақтайды.
   Орнату: жаңа Google Sheet ашып → Кеңейтімдер → Apps Script → осы кодты қойып →
   Жоба параметрлері → Script properties: TEACHER_PASS = (мұғалім құпиясөзі) →
   Deploy → Web app (Execute as: Me, Access: Anyone) → URL-ді app.js ішіндегі API-ге қою. */
const HEAD=["id","ts","name","cls","type","para","score","max","pct","grade","status","comment","dur","ans"];
function sh_(){const s=SpreadsheetApp.getActiveSpreadsheet();let t=s.getSheetByName("results");if(!t){t=s.insertSheet("results");t.appendRow(HEAD)}return t}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function rows_(){const t=sh_(),v=t.getDataRange().getValues();v.shift();
  return v.map(r=>{const o={};HEAD.forEach((h,i)=>o[h]=r[i]);try{o.ans=o.ans?JSON.parse(o.ans):undefined}catch(e){}if(o.grade==="")o.grade=null;if(o.pct==="")delete o.pct;return o})}
function isT_(p){return p&&p===PropertiesService.getScriptProperties().getProperty("TEACHER_PASS")}
function doPost(e){
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const b=JSON.parse(e.postData.contents),t=sh_();
    if(b.action==="submit"){const r=b.record;
      if(!r||!r.id||!r.name||!r.cls)return out_({ok:false});
      const ids=t.getRange(2,1,Math.max(t.getLastRow()-1,1),1).getValues().flat();
      const row=HEAD.map(h=>h==="ans"?(r.ans?JSON.stringify(r.ans):""):(r[h]===undefined||r[h]===null?"":r[h]));
      if(ids.indexOf(r.id)<0)t.appendRow(row);
      return out_({ok:true})}
    if(b.action==="mine"){return out_({ok:true,rows:rows_().filter(r=>r.name===b.name&&r.cls===b.cls)})}
    if(b.action==="list"){return isT_(b.pass)?out_({ok:true,rows:rows_()}):out_({ok:false})}
    if(b.action==="grade"){if(!isT_(b.pass))return out_({ok:false});
      const ids=t.getRange(2,1,Math.max(t.getLastRow()-1,1),1).getValues().flat(),i=ids.indexOf(b.id);
      if(i<0)return out_({ok:false});
      t.getRange(i+2,HEAD.indexOf("grade")+1).setValue(b.grade);
      t.getRange(i+2,HEAD.indexOf("status")+1).setValue("graded");
      t.getRange(i+2,HEAD.indexOf("comment")+1).setValue(b.comment||"");
      return out_({ok:true})}
    return out_({ok:false});
  }finally{lock.releaseLock()}
}
