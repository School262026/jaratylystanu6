/* БЖБ / ТЖБ дайындық: тапсырмаларды орындап, автоматты тексеріп, ашық жауапты дескриптор бойынша өзін-өзі бағалау */
const jbNorm=s=>String(s||"").toLowerCase().replace(/[ё]/g,"е").replace(/[.,;:!?()«»"'`´\-–—_]/g," ").replace(/\s+/g," ").trim();
function jbMenu(){
  const group=(kind,title)=>`<h2>${title}</h2>`+Object.entries(JB).filter(([k,v])=>v.kind===kind).map(([k,v])=>`<a class="card" style="display:block;text-decoration:none;color:inherit" href="#/jb/${k}"><b>${esc(v.t)}</b> <span class="tag">${v.paras}</span><br><span class="mut">${esc(v.sec)} · ${v.time} минут · ${jbMax(v)} балл</span></a>`).join("");
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>📝 БЖБ / ТЖБ дайындық</h1><p class="mut">Бөлім бойынша (БЖБ) және тоқсан бойынша (ТЖБ) жиынтық бағалауға ұқсас тапсырмалар. Автоматты тексеріледі, ашық жауапты үлгі жауап пен дескриптор бойынша өзің бағалайсың.</p>`+group("БЖБ","Бөлім бойынша жиынтық бағалау (БЖБ)")+group("ТЖБ","Тоқсан бойынша жиынтық бағалау (ТЖБ)");
}
function jbMax(v){return Math.round(v.tasks.reduce((s,t)=>s+(t.k==="open"?t.desc.reduce((a,d)=>a+d[1],0):t.pts),0)*100)/100}
function jbPage(h){
  const id=h[1];if(!id||!JB[id])return jbMenu();
  const S=JB[id],MAX=jbMax(S);
  const sh={};S.tasks.forEach((t,i)=>{if(t.k==="match")sh[i]=shuffle(t.pairs.map(p=>p[1]))});
  let h2=`<a href="#/jb">← БЖБ / ТЖБ</a><h1>📝 ${esc(S.t)}</h1><div class="card"><b>${S.kind}</b> · ${esc(S.sec)} (${S.paras}) · ⏱ ${S.time} минут · <b>${MAX} балл</b><br><span class="mut">${S.goals.map(esc).join("<br>")}</span></div><div id="jbt"></div>
  <button class="btn" id="jck">✅ Тексеру</button><div id="jres"></div>`;
  app.innerHTML=h2;
  const root=$("#jbt");
  root.innerHTML=S.tasks.map((t,i)=>{let inner="";
    if(t.k==="fill")inner=`<input data-i="${i}" placeholder="Жауабың">`;
    else if(t.k==="num")inner=`<input data-i="${i}" inputmode="decimal" placeholder="Жауабың${t.unit?" ("+t.unit+")":""}">`;
    else if(t.k==="mcq")inner=t.o.map((o,k)=>`<label style="display:block;padding:6px 0"><input type="radio" name="t${i}" value="${k}" style="width:auto"> ${esc(o)}</label>`).join("");
    else if(t.k==="match")inner=t.pairs.map((p,k)=>`<div style="margin:6px 0"><b>${esc(p[0])}</b><select data-i="${i}" data-k="${k}"><option value="">— таңда —</option>${sh[i].map(o=>`<option>${esc(o)}</option>`).join("")}</select></div>`).join("");
    else if(t.k==="sort")inner=t.items.map((p,k)=>`<div style="margin:6px 0"><b>${esc(p[0])}</b><select data-i="${i}" data-k="${k}"><option value="">— таңда —</option>${t.cats.map((c,ci)=>`<option value="${ci}">${esc(c)}</option>`).join("")}</select></div>`).join("");
    else if(t.k==="open")inner=`<textarea data-i="${i}" placeholder="Жауабың..."></textarea>`;
    return`<div class="card" id="jt${i}"><b>${esc(t.q)}</b> <span class="tag">${t.k==="open"?t.desc.reduce((a,d)=>a+d[1],0):t.pts} балл</span>${inner}<div class="jfb"></div></div>`}).join("");
  let checked=false,self={};
  const val=i=>{const t=S.tasks[i];
    if(t.k==="fill"||t.k==="num"||t.k==="open")return root.querySelector(`[data-i="${i}"]`).value;
    if(t.k==="mcq"){const r=root.querySelector(`input[name="t${i}"]:checked`);return r?+r.value:null}
    return[...root.querySelectorAll(`[data-i="${i}"]`)].map(s=>s.value)};
  const auto=i=>{const t=S.tasks[i],v=val(i);let got=0,fb="";
    if(t.k==="fill"){const x=jbNorm(v);got=t.a.some(a=>x.includes(jbNorm(a)))&&x?t.pts:0;fb=got?"":"Дұрыс жауап: "+t.ans}
    else if(t.k==="num"){const x=parseFloat(String(v).replace(",","."));got=!isNaN(x)&&Math.abs(x-t.ans)<=Math.max(t.tol||0,Math.abs(t.ans)*.01)?t.pts:0;fb=(got?"":"Дұрыс жауап: "+t.ans+(t.unit?" "+t.unit:""))+(t.sol?" ("+t.sol+")":"")}
    else if(t.k==="mcq"){got=v===t.a?t.pts:0;fb=(got?"":"Дұрыс жауап: "+t.o[t.a])+(t.sol?" — "+t.sol:"")}
    else if(t.k==="match"){let c=0;t.pairs.forEach((p,k)=>{if(v[k]===p[1])c++});got=t.pts*c/t.pairs.length;fb=got===t.pts?"":"Дұрысы: "+t.pairs.map(p=>p[0]+" — "+p[1]).join("; ")}
    else if(t.k==="sort"){let c=0;t.items.forEach((p,k)=>{if(v[k]!==""&&+v[k]===p[1])c++});got=t.pts*c/t.items.length;fb=got===t.pts?"":"Дұрысы: "+t.items.map(p=>p[0]+" — "+t.cats[p[1]]).join("; ")}
    return{got:Math.round(got*100)/100,fb}};
  const total=()=>{let s=0;S.tasks.forEach((t,i)=>{if(t.k==="open")s+=(self[i]||[]).reduce((a,x)=>a+x,0);else s+=res[i]?res[i].got:0});return Math.round(s*100)/100};
  let res={};
  const upd=()=>{const sc=total(),pct=Math.round(sc/MAX*100),g=grade(pct);const e=$("#jsc");if(e)e.innerHTML=`<div class="big">${sc} / ${MAX}</div><p style="text-align:center"><b>${pct}%</b> · баға <b>${g}</b> · ${level(pct)}</p>`};
  $("#jck").onclick=()=>{
    if(checked)return;checked=true;$("#jck").disabled=true;root.querySelectorAll("input,select,textarea").forEach(e=>e.disabled=true);
    S.tasks.forEach((t,i)=>{const box=$("#jt"+i+" .jfb");
      if(t.k==="open"){self[i]=t.desc.map(()=>0);
        box.innerHTML=`<div class="card" style="background:var(--pri2)"><b>Үлгі жауап:</b> ${esc(t.model)}</div><b>Өзіңді бағала (дескриптор):</b>`+t.desc.map((d,k)=>`<label style="display:block;padding:4px 0"><input type="checkbox" data-s="${i}_${k}" style="width:auto"> ${esc(d[0])} <span class="tag">${d[1]} балл</span></label>`).join("");
        box.querySelectorAll("[data-s]").forEach(cb=>cb.onchange=()=>{const [ti,k]=cb.dataset.s.split("_").map(Number);self[ti][k]=cb.checked?S.tasks[ti].desc[k][1]:0;upd()})}
      else{res[i]=auto(i);const full=res[i].got===t.pts;box.innerHTML=`<div class="${full?"":"mut"}" style="margin-top:6px">${full?"✅ Дұрыс":res[i].got>0?"⚠️ Жартылай ("+res[i].got+"/"+t.pts+")":"❌ Қате"} ${esc(res[i].fb)}</div>`;
        $("#jt"+i).style.borderColor=full?"#3cb371":res[i].got>0?"#f1a62b":"#e57373"}});
    $("#jres").innerHTML=`<div class="card"><b>Нәтиже</b><p class="mut">Ашық жауаптарды үлгі жауаппен салыстырып, дескрипторларды белгіле: балл жаңарады.</p><div id="jsc"></div></div><button class="btn" id="jsv">📤 Нәтижені сақтау</button><p class="mut" id="jsm"></p>`;
    upd();$("#jres").scrollIntoView();
    $("#jsv").onclick=async()=>{const sc=total(),pct=Math.round(sc/MAX*100),g=grade(pct);
      const ans=S.tasks.map((t,i)=>t.k==="open"?{q:t.q,a:val(i)}:null).filter(Boolean);
      const rec={id:uid(),name:user().name,cls:user().cls,type:"jb",para:0,score:sc,max:MAX,pct,grade:g,ts:Date.now(),status:"auto",mapset:id,ans};
      const ok=await submit(rec);$("#jsv").disabled=true;$("#jsm").textContent=ok?"✅ Нәтиже сақталды және мұғалімге жіберілді.":"⚠️ Нәтиже осы телефонда сақталды."}};
}
