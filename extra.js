/* Талдау (НИШ-аналитика), автоматты үй тапсырмасы, презентация/видео сілтемелері */
const KNOW=["test","quiz","kviz","nis"];
const avgOf=a=>a.length?Math.round(a.reduce((s,x)=>s+x,0)/a.length):null;
function analyze(rows){
  const by={};rows.filter(x=>x.pct!=null&&x.para>0&&KNOW.includes(x.type)).forEach(x=>{(by[x.para]=by[x.para]||[]).push(x)});
  const P={};Object.entries(by).forEach(([n,a])=>{const t=a.filter(x=>x.type==="test"||x.type==="nis");const pool=t.length?t:a;P[n]={n:+n,avg:avgOf(pool.map(x=>x.pct)),best:Math.max(...a.map(x=>x.pct)),count:a.length,hasTest:a.some(x=>x.type==="test")}});
  const secs=SECTIONS.map(([t,[a,b]])=>{const v=[];for(let i=a;i<=b;i++)if(P[i])v.push(P[i].avg);return{t,avg:avgOf(v),n:v.length}});
  const weak=Object.values(P).filter(p=>p.avg<70).sort((a,b)=>a.avg-b.avg).map(p=>p.n);
  const strong=Object.values(P).filter(p=>p.avg>=85).map(p=>p.n);
  const nis=rows.filter(x=>x.type==="nis"&&x.pct!=null).sort((a,b)=>a.ts-b.ts).slice(-6).map(x=>x.pct);
  const all=Object.values(P).map(p=>p.avg);
  return{P,secs,weak,strong,nis,overall:avgOf(all)};
}
const barRow=(label,v,col)=>`<div style="display:flex;align-items:center;gap:8px;margin:5px 0"><span style="width:44%;font-size:13px">${esc(label)}</span><div style="flex:1;height:12px;background:var(--line);border-radius:6px;overflow:hidden"><i style="display:block;height:100%;width:${v||0}%;background:${col||(v>=85?"#3cb371":v>=70?"#8bc34a":v>=40?"#f1a62b":"#e57373")}"></i></div><b style="width:42px;text-align:right;font-size:13px">${v==null?"—":v+"%"}</b></div>`;
function analyticsHtml(rows){
  const A=analyze(rows);
  if(A.overall===null)return`<div class="card"><b>📈 Талдау</b><p class="mut">Тест тапсырған соң, мұнда күшті және әлсіз тақырыптарың көрінеді.</p></div>`;
  const lv=A.overall>=85?"Жоғары":A.overall>=70?"Орта-жоғары":A.overall>=40?"Орта":"Төмен";
  const topics=n=>n.map(i=>`<a href="#/p/${i}">§${i}</a>`).join(", ")||"—";
  return`<div class="card"><b>📈 Талдау</b><p>Жалпы деңгейің: <b>${A.overall}% · ${lv}</b></p>
  <p class="mut" style="margin:6px 0 2px">Бөлімдер бойынша:</p>${A.secs.map(s=>barRow(s.t.replace(/ бөлім.*/,"")+". "+(s.t.split(". ")[1]||""),s.avg)).join("")}
  <p style="margin-top:10px">✅ <b>Күшті тақырыптар</b> (≥85%): ${topics(A.strong)}</p>
  <p>⚠️ <b>Қайталау қажет</b> (&lt;70%): ${topics(A.weak)}</p>
  ${A.nis.length?`<p style="margin-top:10px"><b>🏆 НИШ-тест динамикасы</b></p><div style="display:flex;align-items:flex-end;gap:6px;height:80px">${A.nis.map(v=>`<div style="flex:1;text-align:center;font-size:11px"><div style="height:${Math.max(4,v*.6)}px;background:var(--pri);border-radius:4px 4px 0 0"></div>${v}%</div>`).join("")}</div>`:""}
  ${A.weak.length?`<a class="btn" style="margin-top:10px" href="#/hw">🏠 Қайталау тапсырмасын орында</a>`:""}</div>`;
}
/* ---- мұғалімге: сынып бойынша талдау ---- */
function teacherAnalyticsHtml(rows){
  const K=rows.filter(x=>x.pct!=null&&x.para>0&&KNOW.includes(x.type));
  if(!K.length)return"";
  const byP={},byC={},byS={};
  K.forEach(x=>{(byP[x.para]=byP[x.para]||[]).push(x.pct);(byC[x.cls]=byC[x.cls]||[]).push(x.pct);(byS[x.cls+"|"+x.name]=byS[x.cls+"|"+x.name]||[]).push(x.pct)});
  const tp=Object.entries(byP).map(([n,v])=>({n:+n,avg:avgOf(v),c:v.length})).sort((a,b)=>a.avg-b.avg);
  const hard=tp.filter(t=>t.avg<60&&t.c>=2);
  return`<h2>📊 Талдау</h2><div class="card"><b>Сыныптар бойынша орташа</b>${Object.entries(byC).map(([c,v])=>barRow(c+" ("+new Set(K.filter(x=>x.cls===c).map(x=>x.name)).size+" оқушы)",avgOf(v))).join("")}</div>
  <div class="card"><b>Тақырыптар бойынша (әлсізінен бастап)</b>${tp.slice(0,12).map(t=>barRow("§"+t.n+" · "+(TITLES[t.n-1]||"").slice(0,26)+" ("+t.c+")",t.avg)).join("")}
  ${hard.length?`<p style="margin-top:8px">⚠️ <b>Қиын тақырыптар</b> (&lt;60%): ${hard.map(t=>"§"+t.n).join(", ")} — сабақта қайталауға кеңес.</p>`:""}</div>
  <div class="card"><b>Көмек керек оқушылар</b> (орташа &lt;50%)${Object.entries(byS).map(([k,v])=>({k,a:avgOf(v),n:v.length})).filter(x=>x.a<50&&x.n>=2).sort((a,b)=>a.a-b.a).map(x=>`<p style="margin:4px 0">${esc(x.k.split("|")[1])} · ${esc(x.k.split("|")[0])} — <b>${x.a}%</b> (${x.n} жұмыс)</p>`).join("")||`<p class="mut">Қазір жоқ.</p>`}</div>`;
}

/* ---- автоматты үй тапсырмасы ---- */
async function hwPage(){
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>🏠 Менің үй тапсырмам</h1><p class="mut">Жүктелуде...</p>`;
  const rows=await mine();if(location.hash!=="#/hw")return;
  const A=analyze(rows),open=[...OPEN].filter(n=>PARA[n]).sort((a,b)=>a-b),isP=!!(user()&&user().preview);
  const avail=isP?Object.keys(PARA).map(Number):open;
  const fresh=avail.filter(n=>!(A.P[n]&&A.P[n].hasTest));
  const weak=A.weak.filter(n=>PARA[n]);
  const link=n=>`<a class="card" style="display:block;text-decoration:none;color:inherit" href="#/p/${n}"><b>§${n}</b> ${esc(TITLES[n-1])}</a>`;
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>🏠 Менің үй тапсырмам</h1>
  <p class="mut">Тапсырма нәтижеңе қарай өздігінен құрылады. Мұғалім жаңа тақырып ашқанда, ол мұнда да шығады.</p>
  <h2>🆕 1. Жаңа тақырыптар (тест әлі тапсырылмаған)</h2>${fresh.length?fresh.map(link).join(""):`<div class="card">Бәрі орындалған 🎉</div>`}
  <h2>🔁 2. Қайталау (нәтижең 70%-дан төмен)</h2>${weak.length?weak.map(n=>`<div class="card"><b>§${n}</b> ${esc(TITLES[n-1])} <span class="tag">${A.P[n].avg}%</span><br><a href="#/p/${n}/summary">📖 Конспект</a> · <a href="#/p/${n}/test">📝 Тест</a></div>`).join(""):`<div class="card">Әлсіз тақырып жоқ 👍</div>`}
  <h2>⚡ 3. Автоматты қайталау тесті</h2><div class="card">Әлсіз тақырыптардан (болмаса, өткен тақырыптардан) 10 сұрақ автоматты таңдалады. Нәтиже бағаға жазылады.</div><button class="btn" id="hwq">🎯 Тестті бастау</button><div id="hwb"></div>`;
  $("#hwq").onclick=()=>{
    const pool=(weak.length?weak:Object.keys(A.P).map(Number).filter(n=>PARA[n]));
    const src=pool.length?pool:avail.slice(0,5);
    let items=[];src.forEach(n=>PARA[n].test.forEach(q=>items.push({q:q.q,o:q.o,a:q.a,why:q.why+" (§"+n+")"})));
    items=shuffle(items).slice(0,10).map(q=>{const idx=shuffle(q.o.map((t,i)=>i));return{q:q.q,why:q.why,o:idx.map(i=>q.o[i]),a:idx.indexOf(q.a)}});
    if(!items.length)return alert("Әзірге тапсырма жоқ. Алдымен бір тақырыптың тестін тапсыр.");
    $("#hwb").innerHTML="";labQuiz($("#hwb"),{id:"hw",t:"Қайталау тесті"},items,"hw");$("#hwb").scrollIntoView()};
}

/* ---- презентация / видео сілтемелері ---- */
let LINKS=(()=>{try{return JSON.parse(localStorage.getItem("jt_links"))||{}}catch(e){return{}}})();
function embedUrl(u){
  let m=u.match(/(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);if(m)return"https://www.youtube.com/embed/"+m[1];
  m=u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);if(m)return"https://drive.google.com/file/d/"+m[1]+"/preview";
  m=u.match(/docs\.google\.com\/presentation\/d\/([\w-]+)/);if(m)return"https://docs.google.com/presentation/d/"+m[1]+"/embed";
  return null}
function linksPage(n,P,b){
  const L=(LINKS[n]||[]).filter(x=>/^https?:\/\//i.test(x.u));
  b.innerHTML=`<h2>🎞️ Презентация және видео</h2>`+(L.length?L.map(x=>{const e=embedUrl(x.u);
    return`<div class="card"><b>${esc(x.t)}</b>${e?`<div style="position:relative;padding-top:56.25%;margin:8px 0"><iframe src="${esc(e)}" style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:10px" allowfullscreen loading="lazy"></iframe></div>`:""}<a class="btn alt" style="margin-top:8px" target="_blank" rel="noopener" href="${esc(x.u)}">↗ Жаңа терезеде ашу</a></div>`}).join(""):`<div class="card">Бұл тақырыпқа әзірге материал қосылмаған.</div>`);
}

/* ---- 1. Ата-анаға есеп (мұғалім) ---- */
function reportData(rows,name,cls){
  const mine=rows.filter(x=>x.name===name&&String(x.cls)===String(cls));
  const A=analyze(mine);
  const ws=mine.filter(x=>x.type==="ws").sort((a,b)=>b.ts-a.ts);
  const recent=mine.filter(x=>x.pct!=null||x.type==="ws").sort((a,b)=>b.ts-a.ts).slice(0,15);
  return{mine,A,ws,recent};
}
function reportText(name,cls,D){
  const A=D.A,g=A.overall==null?"—":grade(A.overall);
  return"Құрметті ата-ана! "+name+" ("+cls+") — «Жаратылыстану» пәні бойынша есеп.\n"+
   (A.overall==null?"Әзірге тест тапсырылмаған.":"Жалпы нәтиже: "+A.overall+"% (баға "+g+"). Тапсырылған тақырып: "+Object.keys(A.P).length+".")+
   (A.weak.length?"\nҚайталауға кеңес: "+A.weak.map(n=>"§"+n).join(", ")+".":"")+
   (A.strong.length?"\nЖақсы меңгерген: "+A.strong.map(n=>"§"+n).join(", ")+".":"")+
   "\nЖаратылыстану 6-сынып қосымшасы: "+location.origin;
}
function reportHtml(name,cls,D){
  const A=D.A,g=A.overall==null?"—":grade(A.overall),dt=new Date().toLocaleDateString("kk-KZ");
  const tn=n=>"§"+n+" "+(TITLES[n-1]||"");
  return`<div id="rep" class="card" style="background:#fff;color:#000"><h2 style="margin:0">Жаратылыстану · 6-сынып</h2><p class="mut" style="margin:2px 0 10px">Оқу үлгерімі туралы есеп · ${dt}</p>
  <p style="font-size:18px"><b>${esc(name)}</b> · ${esc(cls)}</p>
  <p>Жалпы нәтиже: <b>${A.overall==null?"—":A.overall+"%"}</b> · Баға: <b>${g}</b> · Меңгерген тақырып: <b>${Object.keys(A.P).length}</b></p>
  ${A.secs.filter(s=>s.n).map(s=>barRow(s.t.replace(/ бөлім.*/,"")+". "+(s.t.split(". ")[1]||""),s.avg)).join("")}
  ${A.strong.length?`<p>✅ <b>Жақсы меңгерген:</b> ${A.strong.map(tn).join("; ")}</p>`:""}
  ${A.weak.length?`<p>⚠️ <b>Қайталау қажет:</b> ${A.weak.map(tn).join("; ")}</p>`:""}
  <table style="margin-top:8px"><tr><th>Күні</th><th>Түрі</th><th>§</th><th>Нәтиже</th></tr>${D.recent.map(x=>`<tr><td>${new Date(x.ts).toLocaleDateString("kk-KZ")}</td><td>${TYPES[x.type]||x.type}</td><td>${x.para||"—"}</td><td>${x.type==="ws"?(x.grade?"баға "+x.grade:"тексерілуде"):x.pct+"% · "+x.grade}</td></tr>`).join("")}</table>
  <p style="margin-top:10px"><b>Ұсыныс:</b> ${A.weak.length?"әлсіз тақырыптарды қайталап, қосымшадағы «Үй тапсырмасы» бөліміндегі автоматты тестті орындау.":A.overall==null?"қосымшаға кіріп, алғашқы тақырыптардың тестін тапсыру.":"жақсы нәтижені сақтап, жаңа тақырыптарды уақытында орындау."}</p>
  <p class="mut" style="margin-top:18px">Мұғалім: ____________________</p></div>`;
}
function openReport(rows,name,cls){
  const D=reportData(rows,name,cls),prev=app.innerHTML;
  const st=document.createElement("style");st.id="pst";st.textContent="@media print{body *{visibility:hidden}#rep,#rep *{visibility:visible}#rep{position:absolute;left:0;top:0;width:100%;border:0}#nav{display:none}}";document.head.appendChild(st);
  app.innerHTML=`<a href="#" id="rb">← Панельге қайту</a><h1>📄 Ата-анаға есеп</h1>${reportHtml(name,cls,D)}
  <div class="grid" style="margin-top:10px"><button class="btn" id="rp">🖨️ Басып шығару / PDF</button><a class="btn alt" id="rw" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(reportText(name,cls,D))}">💬 WhatsApp</a></div>
  <button class="btn alt" id="rc" style="margin-top:8px">📋 Мәтінді көшіру</button><p class="mut">PDF сақтау үшін: басып шығару терезесінде «Принтер» орнына «PDF ретінде сақтау» таңда.</p>`;
  $("#rb").onclick=e=>{e.preventDefault();st.remove();teacher()};
  $("#rp").onclick=()=>window.print();
  $("#rc").onclick=async()=>{try{await navigator.clipboard.writeText(reportText(name,cls,D));alert("Көшірілді")}catch(e){prompt("Мәтінді көшір:",reportText(name,cls,D))}};
}

/* ---- 2. Жаңа тақырып туралы хабарландыру ---- */
function newTopics(){
  const seen=new Set(JSON.parse(localStorage.getItem("jt_seen")||"null")||[]);
  const first=!localStorage.getItem("jt_seen");
  const cur=[...OPEN].filter(n=>PARA[n]);
  const fresh=first?[]:cur.filter(n=>!seen.has(n));
  return{cur,fresh,first}
}
function markSeen(){try{localStorage.setItem("jt_seen",JSON.stringify([...OPEN]))}catch(e){}}
function newBanner(){
  const N=newTopics();if(N.first){markSeen();return""}
  if(!N.fresh.length)return"";
  return`<div class="card" style="border-color:var(--pri);background:var(--pri2)"><b>🆕 Жаңа тақырып ашылды!</b><br>${N.fresh.map(n=>`<a href="#/p/${n}">§${n} ${esc(TITLES[n-1])}</a>`).join("<br>")}<br><a href="#" id="seen" class="mut">Түсінікті, жасыр</a></div>`;
}
function announceText(n){return"🌿 Жаратылыстану 6: жаңа тақырып ашылды — §"+n+". "+TITLES[n-1]+".\nКонспектті оқып, тестті тапсырыңдар: "+location.origin}

/* ---- 3. Сынып рейтингі ---- */
let RATING=(()=>{try{return JSON.parse(localStorage.getItem("jt_rating"))!==false}catch(e){return true}})();
async function ratingPage(){
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>🏆 Сынып рейтингі</h1><p class="mut">Жүктелуде...</p>`;
  const u=user();let r=null;
  if(u&&!u.preview){try{r=await api({action:"rating",name:u.name,cls:u.cls,token:u.token})}catch(e){}}
  if(location.hash!=="#/rating")return;
  if(!r||!r.ok){app.innerHTML=`<a href="#/">← Басты бет</a><h1>🏆 Сынып рейтингі</h1><div class="card">${u&&u.preview?"Тест режимінде рейтинг жоқ.":r&&r.err==="off"?"Рейтинг әзірге өшірулі.":"Рейтингті көрсету мүмкін болмады."}</div>`;return}
  const medal=i=>["🥇","🥈","🥉"][i]||(i+1)+".";
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>🏆 ${esc(u.cls)} сыныбының рейтингі</h1><p class="mut">Ұпай: әр тақырыптан алған ең жақсы нәтиженің қосындысы. Көбірек тақырып тапсырып, нәтижені жақсарт!</p>
  <div class="card">${r.top.map((x,i)=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)${x.me?";font-weight:800;color:var(--pri)":""}"><span>${medal(i)} ${esc(x.n)}${x.me?" (сен)":""}</span><span>${x.pts} ұпай</span></div>`).join("")}</div>
  <div class="card">Сенің орның: <b>${r.rank} / ${r.total}</b> · ${r.pts} ұпай</div>`;
}
