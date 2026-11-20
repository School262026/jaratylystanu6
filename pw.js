/* Сарамандық жұмыстар: оқулықтағы тапсырма бойынша орындап, нәтижесін мұғалімге жіберу */
async function pwList(){
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>🔬 Сарамандық жұмыстар</h1><p class="mut">Оқулықтағы практикалық және зертханалық жұмыстар. Тақырып ашылған соң орындап, нәтижесін мұғалімге жібересің.</p><p class="mut">Жүктелуде...</p>`;
  const rows=await mine();if(location.hash!=="#/pw")return;
  const prev=user()&&user().preview;
  const st=n=>{const r=rows.filter(x=>x.type==="pw"&&x.para===n).sort((a,b)=>b.ts-a.ts)[0];return r?(r.grade?`<span class="tag">баға ${r.grade}</span>`:`<span class="tag">⏳ тексерілуде</span>`):""};
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>🔬 Сарамандық жұмыстар</h1><p class="mut">Оқулықтағы практикалық және зертханалық жұмыстар. Тақырып ашылған соң орындап, нәтижесін мұғалімге жібересің.</p>`+
   Object.keys(PW).map(Number).sort((a,b)=>a-b).map(n=>{const on=isOpen(n);return`<a class="card" style="display:block;text-decoration:none;color:inherit;${on?"":"opacity:.5;pointer-events:none"}" href="#/p/${n}/pw"><b>§${n}</b> ${esc(PW[n].t)} ${on?st(n):"<small class='mut'>🔒 мұғалім ашады</small>"}</a>`}).join("");
}
async function pwWork(n,P,b){
  const W=PW[n];if(!W){b.innerHTML="<div class='card'>Бұл тақырыпта сарамандық жұмыс жоқ.</div>";return}
  const key="jt_pw_"+n,d=ls.get(key,{});
  const rows=await mine();if(!document.body.contains(b))return;
  const prev=rows.filter(x=>x.type==="pw"&&x.para===n).sort((a,b)=>b.ts-a.ts)[0];
  const locked=prev&&!(prev.grade&&prev.grade<=3);
  const inp=(i,r,c,ph)=>`<input data-i="${i}" data-r="${r}" data-c="${c}" placeholder="${esc(ph||"")}" value="${esc((d[i]||{})[r+"_"+c]||"")}" style="min-width:90px">`;
  let h=`<h2>🔬 ${esc(W.t)}</h2>
  ${prev?`<div class="card" style="border-color:var(--pri)">${prev.grade?`✅ Мұғалім бағалады: <b>${prev.grade}</b>${prev.comment?" · "+esc(prev.comment):""}`:"⏳ Жұмыс мұғалімге жіберілді, тексерілуде."}</div>`:""}
  <div class="card"><b>Мақсаты:</b> ${esc(W.goal)}<br><b>Құрал-жабдықтар:</b> ${W.tools.map(esc).join("; ")}.</div>
  ${W.safety?`<div class="card" style="border-color:#e57373">${esc(W.safety)}</div>`:""}
  ${(W.aid||[]).map(a=>`<a class="btn alt" style="margin:4px 0" href="${a[0]}">${a[1]}</a>`).join("")}
  <h2>Жұмыс барысы</h2>`;
  W.tasks.forEach((t,i)=>{
    h+=`<div class="card"><b>${esc(t.q)}</b>`;
    if(t.table){h+=`<div style="overflow:auto"><table><tr><th></th>${t.table.cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr>${t.table.rows.map((r,ri)=>`<tr><td><b>${esc(r)}</b></td>${t.table.cols.map((c,ci)=>`<td>${inp(i,ri,ci)}</td>`).join("")}</tr>`).join("")}</table></div>`}
    else if(t.kind==="calc"){h+=`<label>Тариф: 1 кВт·сағ құны, теңге <input data-i="${i}" data-r="tar" data-c="0" inputmode="decimal" value="${esc((d[i]||{}).tar_0||"")}" placeholder="мысалы 25"></label><div style="overflow:auto"><table><tr><th>Құрал</th><th>Қуаты, кВт</th><th>Күніне, сағат</th><th>Энергия, кВт·сағ</th><th>Құны, тг</th></tr>${t.calc.rows.map((r,ri)=>`<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${inp(i,ri,0,"сағ")}</td><td id="e${ri}">—</td><td id="k${ri}">—</td></tr>`).join("")}<tr><td colspan="3"><b>Барлығы (күніне)</b></td><td id="et"><b>—</b></td><td id="kt"><b>—</b></td></tr></table></div>`}
    else h+=`<textarea data-i="${i}" data-r="t" data-c="0" placeholder="Жауабың...">${esc((d[i]||{}).t_0||"")}</textarea>`;
    h+="</div>"});
  h+=`<button class="btn" id="pws" ${locked?"disabled":""}>📤 Мұғалімге жіберу</button><p class="mut" id="pwm">${locked?"Жұмыс жіберілген.":"Жазғаның өздігінен сақталып отырады. Тәжірибенің суретін дәптерге түсіріп, мұғалімге көрсетуге болады."}</p>`;
  b.innerHTML=h;
  const calc=()=>{const cw=W.tasks.findIndex(t=>t.kind==="calc");if(cw<0)return;const tar=parseFloat(String((d[cw]||{}).tar_0||"").replace(",","."))||0;let et=0,kt=0;
    W.tasks[cw].calc.rows.forEach((r,ri)=>{const hh=parseFloat(String((d[cw]||{})[ri+"_0"]||"").replace(",","."));if(isNaN(hh)){$("#e"+ri).textContent="—";$("#k"+ri).textContent="—";return}const e=r[1]*hh;et+=e;kt+=e*tar;$("#e"+ri).textContent=(Math.round(e*100)/100)+"";$("#k"+ri).textContent=tar?(Math.round(e*tar*10)/10)+"":"—"});
    $("#et").innerHTML="<b>"+(Math.round(et*100)/100)+"</b>";$("#kt").innerHTML="<b>"+(tar?Math.round(kt*10)/10:"—")+"</b>"};
  b.querySelectorAll("[data-i]").forEach(el=>el.oninput=()=>{const i=el.dataset.i;d[i]=d[i]||{};d[i][el.dataset.r+"_"+el.dataset.c]=el.value;ls.set(key,d);calc()});
  calc();
  $("#pws").onclick=async()=>{
    const ans=W.tasks.map((t,i)=>{const v=d[i]||{};let a="";
      if(t.table)a=t.table.rows.map((r,ri)=>r+": "+t.table.cols.map((c,ci)=>(v[ri+"_"+ci]||"").trim()||"—").join(" | ")).join("\n");
      else if(t.kind==="calc"){const tar=parseFloat(String(v.tar_0||"").replace(",","."))||0;a="Тариф: "+(v.tar_0||"—")+" тг/кВт·сағ\n"+t.calc.rows.map((r,ri)=>{const hh=parseFloat(String(v[ri+"_0"]||"").replace(",","."));return r[0]+": "+(isNaN(hh)?"—":hh+" сағ → "+Math.round(r[1]*hh*100)/100+" кВт·сағ"+(tar?" → "+Math.round(r[1]*hh*tar*10)/10+" тг":""))}).join("\n")}
      else a=(v.t_0||"").trim();
      return{q:t.q,a}});
    const filled=ans.filter(x=>x.a.replace(/[—|\s:]/g,"").length>=3).length;
    if(filled<ans.length)return alert("Барлық тапсырманы орында ("+filled+"/"+ans.length+" толтырылды).");
    const rec={id:uid(),name:user().name,cls:user().cls,type:"pw",para:n,ans,ts:Date.now(),status:"pending",grade:null,comment:""};
    const ok=await submit(rec);$("#pws").disabled=true;$("#pwm").textContent=ok?"✅ Жіберілді! Мұғалім бағалаған соң «Менің нәтижем» бөлімінде көресің.":"⚠️ Телефонда сақталды, мұғалімге жеткізу кейін қайталанады."};
}
