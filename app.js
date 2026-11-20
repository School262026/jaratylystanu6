/* Жаратылыстану 6 — оқушы және мұғалім қосымшасы (1-кезең) */
const API=""; // Apps Script Web App URL (Code.gs орналастырған соң осында қойылады). Бос болса — деректер тек осы телефонда сақталады.
const $=s=>document.querySelector(s), app=$("#app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
const ls={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const grade=p=>p>=85?5:p>=70?4:p>=40?3:2;
const level=p=>p>=85?"Жоғары деңгей":p>=70?"Орта-жоғары деңгей":p>=40?"Орта деңгей":"Қайталау қажет";
const user=()=>ls.get("jt_user",null);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const TYPES={test:"Тест",nis:"НИШ-тест",quiz:"Викторина",game:"Ойын",ws:"Жұмыс парағы"};

/* ---------- сақтау және синхрондау ---------- */
async function api(body){
  if(!API)throw new Error("no api");
  const r=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(body)});
  return r.json();
}
function saveLocal(rec){const a=ls.get("jt_res",[]);const i=a.findIndex(x=>x.id===rec.id);i<0?a.push(rec):a[i]=rec;ls.set("jt_res",a)}
async function submit(rec){
  saveLocal(rec);
  try{await api({action:"submit",record:rec});rec.synced=true;saveLocal(rec);return true}catch(e){return false}
}
async function mine(){
  const u=user();let a=ls.get("jt_res",[]);
  try{const r=await api({action:"mine",name:u.name,cls:u.cls});if(r.ok){const m={};a.forEach(x=>m[x.id]=x);r.rows.forEach(x=>m[x.id]=x);a=Object.values(m);ls.set("jt_res",a)}}catch(e){}
  return a.filter(x=>x.name===u.name&&x.cls===u.cls);
}

/* ---------- маршрутизатор ---------- */
window.addEventListener("hashchange",route);
function route(){
  stopAudio();clearInterval(window._tm);
  const h=location.hash.slice(2).split("/"),u=user();
  $("#who").textContent=u?u.name+" · "+u.cls:"";
  window.scrollTo(0,0);
  if(h[0]==="teacher")return teacher();
  if(!u)return login();
  if(h[0]==="p"){const n=+h[1];return h[2]?topicPage(n,h[2]):topic(n)}
  if(h[0]==="me")return me();
  home();
}
function login(){
  app.innerHTML=`<h1>Сәлем! 👋</h1><div class="card"><p>Атың мен сыныбыңды жаз.</p>
  <input id="n" placeholder="Аты-жөні (мысалы: Айдос Нұрлан)"><input id="c" placeholder="Сынып (мысалы: 6А)">
  <button class="btn" id="go">Кіру</button></div><a class="mut" href="#/teacher">Мұғалім кіреберісі</a>`;
  $("#go").onclick=()=>{const n=$("#n").value.trim(),c=$("#c").value.trim().toUpperCase();if(n.length<3||!c)return alert("Атың мен сыныбыңды толық жаз");ls.set("jt_user",{name:n,cls:c});location.hash="#/";route()};
}
function home(){
  const res=ls.get("jt_res",[]).filter(x=>x.name===user().name);
  const done=new Set(res.filter(x=>x.type==="test").map(x=>x.para));
  let h=`<h1>Жаратылыстану · 6-сынып</h1><p class="mut">Атамұра оқулығы бойынша. Параграфты таңда.</p>
  <div class="grid"><a class="tile" href="#/me"><span>📊</span>Менің нәтижем</a><a class="tile" href="#/teacher"><span>🔐</span>Мұғалім</a></div>`;
  SECTIONS.forEach(([t,[a,b]])=>{h+=`<h2>${esc(t)}</h2><div class="card plist">`;
    for(let i=a;i<=b;i++){const on=!!PARA[i];h+=`<a href="#/p/${i}" class="${on?"":"off"}"><span class="num">§${i}</span><span>${esc(TITLES[i-1])}</span>${done.has(i)?"✅":on?"":"<small class='mut'>жақында</small>"}</a>`}
    h+="</div>"});
  app.innerHTML=h;
}
function topic(n){
  const t=[["summary","📖","Конспект"],["audio","🎧","Аудио"],["terms","🃏","Терминдер"],["quiz","❓","Викторина"],["test","📝","Тест"],["nis","🏆","НИШ-тест"],["game","🎮","Ойын"],["ws","✍️","Жұмыс парағы"],["hw","🏠","Үй тапсырмасы"]];
  app.innerHTML=`<a href="#/">← Барлық параграф</a><h1>§${n}. ${esc(TITLES[n-1])}</h1>
  <div class="grid">${t.map(x=>`<a class="tile" href="#/p/${n}/${x[0]}"><span>${x[1]}</span>${x[2]}</a>`).join("")}</div>`;
}
function topicPage(n,k){
  const P=PARA[n];if(!P)return home();
  const back=`<a href="#/p/${n}">← §${n}</a>`;
  const fn={summary,audio,terms,quiz:()=>runChoice(n,"quiz"),test:()=>runChoice(n,"test"),nis:()=>runChoice(n,"nis"),game,ws,hw}[k];
  app.innerHTML=back+`<h1>§${n}. ${esc(TITLES[n-1])}</h1><div id="box"></div>`;
  fn&&fn(n,P,$("#box"));
}
const box=()=>$("#box");

/* ---------- материал ---------- */
function summary(n,P,b){b.innerHTML=`<h2>📖 Конспект</h2>`+P.summary.map(s=>`<div class="card">${md(s)}</div>`).join("")+
  `<a class="btn alt" href="#/p/${n}/audio">🎧 Аудионы тыңдау</a>`}
let _u=null;
function stopAudio(){try{speechSynthesis.cancel()}catch(e){}}
function audio(n,P,b){
  b.innerHTML=`<h2>🎧 Аудио</h2><div class="card"><audio id="au" controls style="width:100%" src="audio/p${n}.mp3"></audio>
  <p class="mut" id="am">Дайын аудио файл болса, жоғарыда ойнайды. Болмаса төмендегі дауыстап оқу түймесін бас.</p>
  <button class="btn" id="pl">▶️ Дауыстап оқу</button><button class="btn alt" id="st" style="margin-top:8px">⏹ Тоқтату</button></div>
  <div class="card mut">${esc(P.audio)}</div>`;
  $("#au").onerror=()=>$("#au").style.display="none";
  $("#pl").onclick=()=>{if(!window.speechSynthesis)return alert("Бұл құрылғыда дауыстап оқу жоқ. Мәтінді өзің оқы.");stopAudio();
    const u=new SpeechSynthesisUtterance(P.audio);const v=speechSynthesis.getVoices();
    u.voice=v.find(x=>/^kk/i.test(x.lang))||v.find(x=>/^ru/i.test(x.lang))||null;u.lang=u.voice?u.voice.lang:"kk-KZ";u.rate=.92;speechSynthesis.speak(u)};
  $("#st").onclick=stopAudio;
}
function terms(n,P,b){
  let i=0,show=false;const T=shuffle(P.terms);
  const draw=()=>{b.innerHTML=`<h2>🃏 Терминдер (${i+1}/${T.length})</h2><div class="card flip" id="f">${show?esc(T[i][1]):"<b>"+esc(T[i][0])+"</b>"}</div>
  <p class="mut" style="text-align:center">Түртсең — аударылады</p><div class="grid"><button class="btn alt" id="pv">←</button><button class="btn" id="nx">→</button></div>`;
    $("#f").onclick=()=>{show=!show;draw()};$("#pv").onclick=()=>{i=(i+T.length-1)%T.length;show=false;draw()};$("#nx").onclick=()=>{i=(i+1)%T.length;show=false;draw()}};
  draw();
}
function hw(n,P,b){b.innerHTML=`<h2>🏠 Үй тапсырмасы</h2><div class="card">${esc(P.homework)}</div>
  <a class="btn" href="#/p/${n}/ws">✍️ Жұмыс парағын толтыру</a>`}

/* ---------- тест / викторина / НИШ ---------- */
function runChoice(n,mode){
  const P=PARA[n],b=box();
  let items=mode==="quiz"
    ?shuffle(P.quiz).map(q=>({q:q.q,o:[{t:"Дұрыс",c:q.a},{t:"Бұрыс",c:!q.a}],why:q.why}))
    :shuffle(P.test).map(q=>({q:q.q,why:q.why,o:shuffle(q.o.map((t,i)=>({t,c:i===q.a})))}));
  const nis=mode==="nis",feedback=!nis;let i=0,score=0,log=[],left=items.length*90,t0=Date.now();
  if(nis){window._tm=setInterval(()=>{left--;const e=$("#tm");if(e)e.textContent="⏱ "+Math.floor(left/60)+":"+String(left%60).padStart(2,"0");if(left<=0){clearInterval(window._tm);finish()}},1000)}
  const draw=()=>{const q=items[i];b.innerHTML=(nis?`<div class="timer" id="tm">⏱</div>`:"")+`<div class="bar"><i style="width:${i/items.length*100}%"></i></div>
  <p class="mut">${i+1} / ${items.length}</p><div class="card"><b>${esc(q.q)}</b></div>`+
  q.o.map((o,k)=>`<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("")+`<div id="fb"></div>`;
    b.querySelectorAll(".opt").forEach(el=>el.onclick=()=>pick(+el.dataset.k))};
  const pick=k=>{const q=items[i],ok=q.o[k].c;if(ok)score++;log.push({q:q.q,ans:q.o[k].t,ok,right:q.o.find(o=>o.c).t,why:q.why});
    if(feedback){b.querySelectorAll(".opt").forEach((el,j)=>{el.disabled=true;if(q.o[j].c)el.classList.add("ok");else if(j===k)el.classList.add("no")});
      $("#fb").innerHTML=`<div class="card">${ok?"✅ Дұрыс!":"❌ Қате."} ${esc(q.why||"")}</div><button class="btn" id="nx">Келесі →</button>`;$("#nx").onclick=next}
    else next()};
  const next=()=>{i++;i<items.length?draw():finish()};
  async function finish(){
    clearInterval(window._tm);const max=items.length,pct=Math.round(score/max*100),g=grade(pct);
    const dur=Math.round((Date.now()-t0)/1000);
    const rec={id:uid(),name:user().name,cls:user().cls,type:mode,para:n,score,max,pct,grade:g,dur,ts:Date.now(),status:"auto"};
    const ok=await submit(rec);
    b.innerHTML=`<div class="card"><div class="big">${pct}%</div><p style="text-align:center"><b>Баға: ${g}</b> · ${level(pct)}<br>${score} / ${max} дұрыс${nis?" · "+dur+" сек":""}</p></div>
    <p class="mut">${ok?"✅ Нәтиже мұғалімге жіберілді.":"⚠️ Нәтиже осы телефонда сақталды"+(API?", байланыс қалпына келгенде қайта жіберіледі":" (мұғалімге жіберу әлі қосылмаған)")+"."}</p>
    <h2>Қателер талдауы</h2>`+(log.filter(x=>!x.ok).map(x=>`<div class="card">❌ ${esc(x.q)}<br><span class="mut">Сенің жауабың: ${esc(x.ans)}</span><br>✅ <b>${esc(x.right)}</b><br><span class="mut">${esc(x.why||"")}</span></div>`).join("")||"<div class='card'>Қате жоқ! 🎉</div>")+
    `<button class="btn" onclick="location.reload()">🔁 Қайта тапсыру</button><a class="btn alt" style="margin-top:8px" href="#/p/${n}">← Тақырыпқа</a>`;
  }
  b.innerHTML=`<h2>${mode==="quiz"?"❓ Викторина":nis?"🏆 НИШ-тест":"📝 Тест"}</h2><div class="card">${nis?"Уақыт шектеулі (сұрақ басына 90 сек), дұрыс жауап соңында көрсетіледі.":"Әр жауаптан кейін түсіндірме шығады."}</div><button class="btn" id="st">Бастау</button>`;
  $("#st").onclick=()=>{t0=Date.now();draw()};
}

/* ---------- ойын: жұптастыру ---------- */
function game(n,P,b){
  const pairs=P.match;let L=shuffle(pairs.map((p,i)=>[p[0],i])),R=shuffle(pairs.map((p,i)=>[p[1],i]));
  let sl=null,sr=null,done=0,miss=0;
  const draw=()=>{b.innerHTML=`<h2>🎮 Жұптастыр</h2><p class="mut">Сол жақтан бір, оң жақтан сәйкес ұғымды таңда. Қателер: ${miss}</p>
  <div class="grid"><div>${L.map(x=>`<button class="mt ${sl===x[1]?"sel":""} ${x.d?"done":""}" data-s="l" data-i="${x[1]}">${esc(x[0])}</button>`).join("")}</div>
  <div>${R.map(x=>`<button class="mt ${sr===x[1]?"sel":""} ${x.d?"done":""}" data-s="r" data-i="${x[1]}">${esc(x[0])}</button>`).join("")}</div></div>`;
    b.querySelectorAll(".mt").forEach(el=>el.onclick=()=>{const i=+el.dataset.i;if(el.dataset.s==="l")sl=i;else sr=i;
      if(sl!==null&&sr!==null){if(sl===sr){L.find(x=>x[1]===sl).d=1;R.find(x=>x[1]===sr).d=1;done++}else miss++;sl=sr=null;if(done===pairs.length)return end()}draw()})};
  async function end(){const score=Math.max(0,pairs.length-miss),max=pairs.length,pct=Math.round(score/max*100);
    const rec={id:uid(),name:user().name,cls:user().cls,type:"game",para:n,score,max,pct,grade:grade(pct),ts:Date.now(),status:"auto"};await submit(rec);
    b.innerHTML=`<div class="card"><div class="big">🎉 ${pct}%</div><p style="text-align:center">Қате: ${miss}. Баға: <b>${rec.grade}</b></p></div><button class="btn" onclick="location.reload()">🔁 Қайта ойнау</button>`}
  draw();
}

/* ---------- жұмыс парағы ---------- */
function ws(n,P,b){
  const key="jt_ws_"+n,d=ls.get(key,{});
  b.innerHTML=`<h2>✍️ Жұмыс парағы</h2>`+P.ws.map((q,i)=>`<div class="card"><b>${esc(q)}</b><textarea data-i="${i}" placeholder="Жауабың...">${esc(d[i]||"")}</textarea></div>`).join("")+
  `<button class="btn" id="sb">📤 Мұғалімге жіберу</button><p class="mut" id="ms">Жазғаның өздігінен сақталып отырады.</p>`;
  b.querySelectorAll("textarea").forEach(t=>t.oninput=()=>{d[t.dataset.i]=t.value;ls.set(key,d)});
  $("#sb").onclick=async()=>{const ans=P.ws.map((q,i)=>({q,a:(d[i]||"").trim()}));
    if(ans.some(x=>x.a.length<3))return alert("Барлық тапсырмаға жауап жаз.");
    const rec={id:uid(),name:user().name,cls:user().cls,type:"ws",para:n,ans,ts:Date.now(),status:"pending",grade:null,comment:""};
    const ok=await submit(rec);$("#sb").disabled=true;$("#ms").textContent=ok?"✅ Жіберілді! Мұғалім бағалаған соң «Менің нәтижем» бөлімінде көресің.":"⚠️ Телефонда сақталды"+(API?"":" (мұғалімге жіберу әлі қосылмаған)")+"."}
}

/* ---------- менің нәтижем ---------- */
async function me(){
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>📊 Менің нәтижем</h1><p class="mut">Жүктелуде...</p>`;
  const a=(await mine()).sort((x,y)=>y.ts-x.ts),au=a.filter(x=>x.pct!=null);
  const avg=au.length?Math.round(au.reduce((s,x)=>s+x.pct,0)/au.length):null;
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>📊 Менің нәтижем</h1>`+
  (avg!==null?`<div class="card"><div class="big">${avg}%</div><p style="text-align:center">Орташа үлгерім · баға <b>${grade(avg)}</b> · ${level(avg)}</p></div>`:"")+
  `<div class="card"><table><tr><th>Күні</th><th>Түрі</th><th>§</th><th>Нәтиже</th></tr>`+
  a.map(x=>`<tr><td>${new Date(x.ts).toLocaleDateString("kk-KZ")}</td><td>${TYPES[x.type]||x.type}</td><td>${x.para}</td><td>${x.type==="ws"?(x.grade?`<b>${x.grade}</b> ${esc(x.comment||"")}`:"⏳ тексерілуде"):x.pct+"% · <b>"+x.grade+"</b>"}</td></tr>`).join("")+`</table></div>`;
}

/* ---------- мұғалім ---------- */
let TP=ls.get("jt_tp","");
function teacher(){
  if(!TP){app.innerHTML=`<a href="#/">← Басты бет</a><h1>🔐 Мұғалім</h1><div class="card"><input id="pw" type="password" placeholder="Құпиясөз"><button class="btn" id="ok">Кіру</button><p class="mut">${API?"":"Сервер қосылмаған: демо режимі (құпиясөз: teacher). Тек осы құрылғыдағы деректер көрінеді."}</p></div>`;
    $("#ok").onclick=()=>{TP=$("#pw").value;ls.set("jt_tp",TP);teacher()};return}
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>🔐 Мұғалім панелі</h1><p class="mut">Жүктелуде...</p>`;
  (async()=>{
    let rows;
    if(API){try{const r=await api({action:"list",pass:TP});if(!r.ok)throw 0;rows=r.rows}catch(e){TP="";ls.set("jt_tp","");return alert("Құпиясөз қате немесе байланыс жоқ"),teacher()}}
    else{if(TP!=="teacher"){TP="";ls.set("jt_tp","");alert("Қате құпиясөз");return teacher()}rows=ls.get("jt_res",[])}
    renderTeacher(rows);
  })();
}
function renderTeacher(rows){
  const by={};rows.filter(x=>x.pct!=null).forEach(x=>{const k=x.name+"|"+x.cls;(by[k]=by[k]||[]).push(x.pct)});
  const pend=rows.filter(x=>x.type==="ws"&&!x.grade).sort((a,b)=>b.ts-a.ts),all=rows.sort((a,b)=>b.ts-a.ts);
  app.innerHTML=`<a href="#/">← Басты бет</a> · <a href="#" id="out">Шығу</a><h1>🔐 Мұғалім панелі</h1>
  <h2>Оқушылар үлгерімі</h2><div class="card"><table><tr><th>Оқушы</th><th>Сынып</th><th>Тест саны</th><th>Орташа</th><th>Баға</th></tr>`+
  Object.entries(by).map(([k,v])=>{const [n,c]=k.split("|"),avg=Math.round(v.reduce((a,b)=>a+b,0)/v.length);return `<tr><td>${esc(n)}</td><td>${esc(c)}</td><td>${v.length}</td><td>${avg}%</td><td><b>${grade(avg)}</b></td></tr>`}).join("")+`</table></div>
  <h2>Тексеруді күтетін жұмыс парақтары (${pend.length})</h2>`+
  (pend.map(x=>`<div class="card"><b>${esc(x.name)}</b> · ${esc(x.cls)} · §${x.para} <span class="tag">${new Date(x.ts).toLocaleString("kk-KZ")}</span>`+
    x.ans.map(a=>`<p><span class="mut">${esc(a.q)}</span><br>${esc(a.a)}</p>`).join("")+
    `<select data-g="${x.id}"><option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option></select><input data-c="${x.id}" placeholder="Пікір (міндетті емес)"><button class="btn" data-s="${x.id}">Бағаны қою</button></div>`).join("")||"<div class='card'>Жаңа жұмыс жоқ</div>")+
  `<button class="btn alt" id="csv">⬇️ Excel/CSV жүктеу</button>`;
  $("#out").onclick=e=>{e.preventDefault();TP="";ls.set("jt_tp","");teacher()};
  app.querySelectorAll("[data-s]").forEach(bt=>bt.onclick=async()=>{const id=bt.dataset.s,g=+app.querySelector(`[data-g="${id}"]`).value,c=app.querySelector(`[data-c="${id}"]`).value;
    if(API){try{const r=await api({action:"grade",pass:TP,id,grade:g,comment:c});if(!r.ok)throw 0}catch(e){return alert("Қате: баға сақталмады")}}
    const x=rows.find(r=>r.id===id);x.grade=g;x.comment=c;x.status="graded";if(!API)ls.set("jt_res",rows);renderTeacher(rows)});
  $("#csv").onclick=()=>{const L=[["Күні","Оқушы","Сынып","Түрі","§","Балл","%","Баға","Пікір"]].concat(all.map(x=>[new Date(x.ts).toLocaleString("kk-KZ"),x.name,x.cls,TYPES[x.type]||x.type,x.para,x.score!=null?x.score+"/"+x.max:"",x.pct??"",x.grade??"",x.comment||""]));
    const t="﻿"+L.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(";")).join("\n"),a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([t],{type:"text/csv"}));a.download="natizheler.csv";a.click()};
}

if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js");
route();
