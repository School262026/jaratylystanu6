/* Жаратылыстану 6 — оқушы және мұғалім қосымшасы (1-кезең) */
const API="https://script.google.com/macros/s/AKfycbztipI5vYSBzybybwFl_CaTV0TKCr19sb7LbXy4t0g6laoriBo9bgEdcKdwx4JO7k_rmg/exec"; // Apps Script Web App URL (Code.gs орналастырған соң осында қойылады). Бос болса — деректер тек осы телефонда сақталады.
const $=s=>document.querySelector(s), app=$("#app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
const ls={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const grade=p=>p>=85?5:p>=70?4:p>=40?3:2;
const level=p=>p>=85?"Жоғары деңгей":p>=70?"Орта-жоғары деңгей":p>=40?"Орта деңгей":"Қайталау қажет";
const user=()=>{const u=ls.get("jt_user",null);return u&&u.token?u:null};
/* ашық тақырыптар (мұғалім басқарады) */
const isOpen=n=>{const u=ls.get("jt_user",null);return !!(u&&u.preview)||OPEN.has(n)};
let OPEN=new Set(ls.get("jt_open",Array.from({length:20},(_,i)=>i+1)));
async function loadOpen(){try{const r=await api({action:"config"});if(r.ok){const n=new Set(r.open);const ch=n.size!==OPEN.size||[...n].some(x=>!OPEN.has(x));OPEN=n;ls.set("jt_open",r.open);if(r.links){LINKS=r.links;ls.set("jt_links",r.links)}if(typeof r.rating==="boolean"){RATING=r.rating;ls.set("jt_rating",r.rating)}if(ch&&/^(#\/?|#\/p\/\d+)?$/.test(location.hash))route()}}catch(e){}}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const TYPES={hw:"Үй тапсырмасы (қайталау)",lab:"Лаборатория",map:"Контурлы карта",kviz:"Квиз-тест",test:"Тест",nis:"НИШ-тест",quiz:"Викторина",game:"Ойын",ws:"Жұмыс парағы"};

/* ---------- сақтау және синхрондау ---------- */
async function api(body){
  if(!API)throw new Error("no api");
  const r=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(body)});
  return r.json();
}
function saveLocal(rec){const a=ls.get("jt_res",[]);const i=a.findIndex(x=>x.id===rec.id);i<0?a.push(rec):a[i]=rec;ls.set("jt_res",a)}
async function submit(rec){
  saveLocal(rec);
  const u=user();
  if(u.preview){saveLocal(rec);return true}
  try{const r=await api({action:"submit",record:rec,name:u.name,cls:u.cls,token:u.token});
    if(r.err==="auth"){authLost();return false}
    if(r.err==="closed"){if(rec.type!=="map")alert("Бұл тақырып әзірге жабық. Мұғалім ашқанда тапсырасың.");return false}
    if(!r.ok)return false;rec.synced=true;saveLocal(rec);return true}catch(e){return false}
}
function authLost(){ls.set("jt_user",null);alert("Қайта кіру керек.");route()}
async function mine(){
  const u=user();let a=ls.get("jt_res",[]);
  if(u.preview)return a.filter(x=>x.name===u.name);
  try{const r=await api({action:"mine",name:u.name,cls:u.cls,token:u.token});if(r.err==="auth"){authLost();return[]}if(r.ok){const m={};a.forEach(x=>m[x.id]=x);r.rows.forEach(x=>m[x.id]=x);a=Object.values(m);ls.set("jt_res",a)}}catch(e){}
  return a.filter(x=>x.name===u.name&&x.cls===u.cls);
}

/* ---------- маршрутизатор ---------- */
window.addEventListener("hashchange",route);
function route(){
  stopAudio();clearInterval(window._tm);
  const h=location.hash.slice(2).split("/"),u=user();
  $("#who").textContent=u?u.name+" · "+u.cls:"";
  window.scrollTo(0,0);
  const nv=$("#nav");if(nv)nv.style.display=(u||h[0]==="teacher")&&h[0]!==""?"flex":"none";
  if(h[0]==="teacher")return teacher();
  if(!u)return login();
  if(h[0]==="p"){const n=+h[1];if(!isOpen(n)){alert("Бұл тақырып әзірге жабық. Мұғалім ашады.");location.hash="#/";return}return h[2]?topicPage(n,h[2]):topic(n)}
  if(h[0]==="me")return me();
  if(h[0]==="hw")return hwPage();
  if(h[0]==="rating")return ratingPage();
  if(h[0]==="lab")return labPage(h.map(x=>decodeURIComponent(x)));
  if(h[0]==="maps")return mapsPage(h.map(x=>decodeURIComponent(x)));
  home();
}
const ERR={roster:"Бұл сыныптың тізімінде мұндай оқушы жоқ. Аты-жөніңді тізімдегідей жаз (мысалы: Әбдімарат Алуа).",code:"Сынып коды қате. Мұғалімнен сұра.",name:"Аты-жөніңді толық жаз.",pass:"Құпиясөз қате (кемінде 4 таңба керек).",exists:"Бұл оқушы тіркелген. Құпиясөзбен кір.",locked:"Тым көп қате әрекет. 10 минуттан кейін қайтала."};
function login(){
  app.innerHTML=`<h1>Сәлем! 👋</h1><div class="card"><p>Сыныбыңның кодын (мұғалім береді) және аты-жөніңді жаз.</p>
  <input id="cc" placeholder="Сынып коды" autocapitalize="characters" autocomplete="off"><input id="n" placeholder="Аты-жөні (мысалы: Айдос Нұрлан)" autocomplete="off">
  <button class="btn" id="go">Жалғастыру</button><p class="mut" id="er"></p></div><a class="mut" href="#/teacher">Мұғалім кіреберісі</a>`;
  $("#go").onclick=async()=>{const code=$("#cc").value.trim().toUpperCase(),name=$("#n").value.trim().replace(/\s+/g," ");
    if(!code||name.length<3)return $("#er").textContent="Кодты және аты-жөніңді жаз.";
    $("#er").textContent="Тексерілуде...";
    try{const r=await api({action:"check",code,name});if(!r.ok)return $("#er").textContent=ERR[r.err]||"Қате";passStep(code,r.name||name,r.cls,r.exists)}
    catch(e){$("#er").textContent="Байланыс жоқ. Интернетті тексер."}};
}
function passStep(code,name,cls,exists){
  app.innerHTML=`<h1>${exists?"Қайта кіру":"Құпиясөз жасау"}</h1><div class="card"><p><b>${esc(name)}</b> · ${esc(cls)}</p>
  <p class="mut">${exists?"Өз құпиясөзіңді жаз.":"Тек өзің білетін құпиясөз ойлап тап (кемінде 4 таңба). Оны ешкімге айтпа!"}</p>
  <input id="pw" type="password" placeholder="Құпиясөз" autocomplete="${exists?"current-password":"new-password"}">${exists?"":`<input id="pw2" type="password" placeholder="Құпиясөзді қайтала" autocomplete="new-password">`}
  <button class="btn" id="go">${exists?"Кіру":"Тіркелу және кіру"}</button><p class="mut" id="er"></p></div><a class="mut" href="#" id="bk">← Артқа</a>`;
  $("#bk").onclick=e=>{e.preventDefault();login()};
  $("#go").onclick=async()=>{const pass=$("#pw").value;
    if(pass.length<4)return $("#er").textContent="Құпиясөз кемінде 4 таңба болсын.";
    if(!exists&&pass!==$("#pw2").value)return $("#er").textContent="Құпиясөздер сәйкес емес.";
    $("#er").textContent="Күте тұр...";
    try{const r=await api({action:exists?"login":"register",code,name,pass});
      if(!r.ok)return $("#er").textContent=r.err==="pass"&&exists?"Құпиясөз қате. Ұмытсаң, мұғалімге айт.":ERR[r.err]||"Қате";
      ls.set("jt_user",{name:r.name,cls:r.cls,token:r.token});location.hash="#/";route();loadOpen()}
    catch(e){$("#er").textContent="Байланыс жоқ. Интернетті тексер."}};
}
function logout(){if(confirm("Шығасың ба?")){ls.set("jt_user",null);location.hash="#/";route()}}
function home(){
  loadOpen();
  const res=ls.get("jt_res",[]).filter(x=>x.name===user().name);
  const done=new Set(res.filter(x=>x.type==="test").map(x=>x.para));
  let h=`<h1>Жаратылыстану · 6-сынып</h1><p class="mut">Атамұра оқулығы бойынша. Параграфты таңда.</p>${newBanner()}
  <div class="grid"><a class="tile" href="#/maps"><span>🗺️</span>Контурлы карта</a><a class="tile" href="#/lab"><span>🧪</span>Лаборатория</a><a class="tile" href="#/hw"><span>🏠</span>Үй тапсырмасы</a>${RATING&&!(user()&&user().preview)?`<a class="tile" href="#/rating"><span>🏆</span>Рейтинг</a>`:""}<a class="tile" href="#/me"><span>📊</span>Менің нәтижем</a><a class="tile" href="#/teacher"><span>🔐</span>Мұғалім</a></div>`;
  SECTIONS.forEach(([t,[a,b]])=>{h+=`<h2>${esc(t)}</h2><div class="card plist">`;
    for(let i=a;i<=b;i++){const on=!!PARA[i]&&isOpen(i),lock=!!PARA[i]&&!isOpen(i);h+=`<a href="${on?"#/p/"+i:"#"}" class="${on?"":"off"}"><span class="num">§${i}</span><span>${esc(TITLES[i-1])}</span>${done.has(i)?"✅":lock?"<small class='mut'>🔒 мұғалім ашады</small>":on?"":"<small class='mut'>жақында</small>"}</a>`}
    h+="</div>"});
  h+=`<a class="btn alt" href="#" id="lo" style="margin-top:14px">🚪 Шығу</a>`;
  app.innerHTML=h;$("#lo").onclick=e=>{e.preventDefault();logout()};const sn=$("#seen");if(sn)sn.onclick=e=>{e.preventDefault();markSeen();home()};
}
function topic(n){
  const t=[["summary","📖","Конспект"],["audio","🎧","Аудио"],["terms","🃏","Терминдер"],["kviz","⚡","Квиз-тест"],["quiz","❓","Викторина"],["test","📝","Тест"],["nis","🏆","НИШ-тест"],["game","🎮","Ойын"],["ws","✍️","Жұмыс парағы"],["hw","🏠","Үй тапсырмасы"]].concat((LINKS[n]||[]).length?[["links","🎞️","Презентация / видео"]]:[]);
  app.innerHTML=`<a href="#/">← Барлық параграф</a><h1>§${n}. ${esc(TITLES[n-1])}</h1>
  <div class="grid">${t.map(x=>`<a class="tile" href="#/p/${n}/${x[0]}"><span>${x[1]}</span>${x[2]}</a>`).join("")}</div>`;
}
function topicPage(n,k){
  const P=PARA[n];if(!P)return home();
  const back=`<a href="#/p/${n}">← §${n}</a>`;
  const fn={summary,audio,terms,kviz:()=>runChoice(n,"kviz"),quiz:()=>runChoice(n,"quiz"),test:()=>runChoice(n,"test"),nis:()=>runChoice(n,"nis"),game:gameHub,match:game,rush,memory,ws,hw,links:linksPage}[k];
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
  const termQ=()=>P.terms.map((t,i)=>({q:"«"+t[0]+"» дегеніміз не?",why:t[0]+" — "+t[1],o:shuffle([{t:t[1],c:true}].concat(shuffle(P.terms.filter((_,j)=>j!==i)).slice(0,3).map(x=>({t:x[1],c:false}))))}));
  let items=mode==="kviz"
    ?shuffle(P.test.map(q=>({q:q.q,why:q.why,o:shuffle(q.o.map((t,i)=>({t,c:i===q.a})))})).concat(termQ())).slice(0,10)
    :mode==="quiz"
    ?shuffle(P.quiz).map(q=>({q:q.q,o:[{t:"Дұрыс",c:q.a},{t:"Бұрыс",c:!q.a}],why:q.why}))
    :shuffle(P.test).map(q=>({q:q.q,why:q.why,o:shuffle(q.o.map((t,i)=>({t,c:i===q.a})))}));
  const nis=mode==="nis",kviz=mode==="kviz",feedback=!nis;let i=0,score=0,log=[],left=items.length*90,t0=Date.now(),ql=20,pts=0,streak=0;
  if(nis){window._tm=setInterval(()=>{left--;const e=$("#tm");if(e)e.textContent="⏱ "+Math.floor(left/60)+":"+String(left%60).padStart(2,"0");if(left<=0){clearInterval(window._tm);finish()}},1000)}
  const draw=()=>{const q=items[i];b.innerHTML=(nis?`<div class="timer" id="tm">⏱</div>`:kviz?`<div class="timer" id="tm">⏱ 20 · ⚡ ${pts}</div>`:"")+`<div class="bar"><i style="width:${i/items.length*100}%"></i></div>
  <p class="mut">${i+1} / ${items.length}</p><div class="card"><b>${esc(q.q)}</b></div>`+
  q.o.map((o,k)=>`<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("")+`<div id="fb"></div>`;
    b.querySelectorAll(".opt").forEach(el=>el.onclick=()=>pick(+el.dataset.k));
    if(kviz){clearInterval(window._tm);ql=20;window._tm=setInterval(()=>{ql--;const e=$("#tm");if(e)e.textContent="⏱ "+ql+" · ⚡ "+pts;if(ql<=0)pick(-1)},1000)}};
  const pick=k=>{if(kviz)clearInterval(window._tm);const q=items[i],ok=k>=0&&q.o[k].c;if(ok){score++;if(kviz){streak++;pts+=500+ql*25+Math.min(streak-1,4)*50}}else streak=0;log.push({q:q.q,ans:k>=0?q.o[k].t:"Уақыт бітті",ok,right:q.o.find(o=>o.c).t,why:q.why});
    if(feedback){b.querySelectorAll(".opt").forEach((el,j)=>{el.disabled=true;if(q.o[j].c)el.classList.add("ok");else if(j===k)el.classList.add("no")});
      $("#fb").innerHTML=`<div class="card">${ok?"✅ Дұрыс!":"❌ Қате."} ${esc(q.why||"")}</div><button class="btn" id="nx">Келесі →</button>`;$("#nx").onclick=next}
    else next()};
  const next=()=>{i++;i<items.length?draw():finish()};
  async function finish(){
    clearInterval(window._tm);const max=items.length,pct=Math.round(score/max*100),g=grade(pct);
    const dur=Math.round((Date.now()-t0)/1000);
    const rec={id:uid(),name:user().name,cls:user().cls,type:mode,para:n,score,max,pct,grade:g,dur,ts:Date.now(),status:"auto"};
    const ok=await submit(rec);
    b.innerHTML=`<div class="card"><div class="big">${pct}%</div><p style="text-align:center"><b>Баға: ${g}</b> · ${level(pct)}<br>${score} / ${max} дұрыс${nis?" · "+dur+" сек":""}${kviz?" · ⚡ "+pts+" ұпай":""}</p></div>
    <p class="mut">${ok?"✅ Нәтиже мұғалімге жіберілді.":"⚠️ Нәтиже осы телефонда сақталды"+(API?", байланыс қалпына келгенде қайта жіберіледі":" (мұғалімге жіберу әлі қосылмаған)")+"."}</p>
    <h2>Қателер талдауы</h2>`+(log.filter(x=>!x.ok).map(x=>`<div class="card">❌ ${esc(x.q)}<br><span class="mut">Сенің жауабың: ${esc(x.ans)}</span><br>✅ <b>${esc(x.right)}</b><br><span class="mut">${esc(x.why||"")}</span></div>`).join("")||"<div class='card'>Қате жоқ! 🎉</div>")+
    `<button class="btn" onclick="location.reload()">🔁 Қайта тапсыру</button><a class="btn alt" style="margin-top:8px" href="#/p/${n}">← Тақырыпқа</a>`;
  }
  b.innerHTML=`<h2>${kviz?"⚡ Квиз-тест":mode==="quiz"?"❓ Викторина":nis?"🏆 НИШ-тест":"📝 Тест"}</h2><div class="card">${kviz?"Жылдам квиз: әр сұраққа 20 секунд. Тез әрі дұрыс жауап берсең, ұпай көп. Қатарынан дұрыс жауапқа бонус беріледі.":nis?"Уақыт шектеулі (сұрақ басына 90 сек), дұрыс жауап соңында көрсетіледі.":"Әр жауаптан кейін түсіндірме шығады."}</div><button class="btn" id="st">Бастау</button>`;
  $("#st").onclick=()=>{t0=Date.now();draw()};
}

/* ---------- ойындар бөлімі ---------- */
function gameHub(n,P,b){
  const g=[["kviz","⚡","Квиз-тест","Kahoot сияқты: 20 сек, жылдамдыққа ұпай"],["rush","🔥","Жылдам Д/Б","3 өмір, әр сұраққа 6 сек"],["memory","🧠","Жад карталары","Ұғым мен анықтаманы тап"],["match","🔗","Жұптастыр","Сол мен оң жақты қос"]];
  b.innerHTML=`<h2>🎮 Ойындар</h2>`+g.map(x=>`<a class="card" style="display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit" href="#/p/${n}/${x[0]}"><span style="font-size:30px">${x[1]}</span><span><b>${x[2]}</b><br><span class="mut">${x[3]}</span></span></a>`).join("");
}
async function gameEnd(n,b,score,max,extra){
  const pct=max?Math.round(score/max*100):0,rec={id:uid(),name:user().name,cls:user().cls,type:"game",para:n,score,max,pct,grade:grade(pct),ts:Date.now(),status:"auto"};
  await submit(rec);
  b.innerHTML=`<div class="card"><div class="big">🎉 ${pct}%</div><p style="text-align:center">${extra||""} Баға: <b>${rec.grade}</b></p></div><button class="btn" onclick="location.reload()">🔁 Қайта ойнау</button><a class="btn alt" style="margin-top:8px" href="#/p/${n}/game">🎮 Басқа ойын</a>`;
}
function rush(n,P,b){
  const Q=shuffle(P.quiz);let i=0,ok=0,lives=3,t=6;
  const stop=()=>clearInterval(window._tm);
  const end=()=>{stop();gameEnd(n,b,ok,Q.length,"Дұрыс: "+ok+"/"+Q.length+".")};
  const ans=v=>{stop();const q=Q[i],r=v===q.a;if(r)ok++;else lives--;
    b.querySelectorAll(".opt").forEach(e=>e.disabled=true);
    $("#fb").innerHTML=`<div class="card">${v===null?"⏱ Уақыт бітті. ":r?"✅ Дұрыс! ":"❌ Қате. "}${esc(q.why||"")}</div><button class="btn" id="nx">Келесі →</button>`;
    $("#nx").onclick=()=>{i++;if(lives<=0||i>=Q.length)end();else draw()}};
  const draw=()=>{t=6;const q=Q[i];b.innerHTML=`<div class="timer" id="tm">⏱ 6 · ${"❤️".repeat(lives)}</div><p class="mut">${i+1} / ${Q.length}</p><div class="card"><b>${esc(q.q)}</b></div><button class="opt" data-v="1">✅ Дұрыс</button><button class="opt" data-v="0">❌ Бұрыс</button><div id="fb"></div>`;
    b.querySelectorAll(".opt").forEach(e=>e.onclick=()=>ans(e.dataset.v==="1"));
    stop();window._tm=setInterval(()=>{t--;const e=$("#tm");if(e)e.textContent="⏱ "+t+" · "+"❤️".repeat(lives);if(t<=0)ans(null)},1000)};
  b.innerHTML=`<h2>🔥 Жылдам Дұрыс/Бұрыс</h2><div class="card">Әр сұраққа 6 секунд. 3 өмір: қате жауап не уақыт бітсе, өмір азаяды.</div><button class="btn" id="st">Бастау</button>`;
  $("#st").onclick=draw;
}
function memory(n,P,b){
  const pairs=P.match;let cards=shuffle(pairs.flatMap((p,i)=>[{t:p[0],i,k:"a"},{t:p[1],i,k:"b"}])),open=[],done=new Set(),moves=0,lock=false;
  const draw=()=>{b.innerHTML=`<h2>🧠 Жад карталары</h2><p class="mut">Ұғым мен оның жұбын тап. Қадам: ${moves}</p><div class="grid">`+cards.map((c,j)=>`<button class="mt ${done.has(j)?"done":""} ${open.includes(j)?"sel":""}" data-j="${j}" style="min-height:64px">${done.has(j)||open.includes(j)?esc(c.t):"❓"}</button>`).join("")+`</div>`;
    b.querySelectorAll(".mt").forEach(e=>e.onclick=()=>{const j=+e.dataset.j;if(lock||open.includes(j)||done.has(j))return;open.push(j);
      if(open.length===2){moves++;const[a,c]=open;if(cards[a].i===cards[c].i&&cards[a].k!==cards[c].k){done.add(a);done.add(c);open=[];draw();if(done.size===cards.length)setTimeout(()=>gameEnd(n,b,pairs.length,Math.max(pairs.length,moves-1),"Қадам: "+moves+"."),600)}
        else{lock=true;draw();setTimeout(()=>{open=[];lock=false;draw()},900)}}else draw()})};
  draw();
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
  if(location.hash!=="#/me")return;
  const avg=au.length?Math.round(au.reduce((s,x)=>s+x.pct,0)/au.length):null;
  app.innerHTML=`<a href="#/">← Басты бет</a><h1>📊 Менің нәтижем</h1>`+analyticsHtml(a)+
  (avg!==null?`<div class="card"><div class="big">${avg}%</div><p style="text-align:center">Орташа үлгерім · баға <b>${grade(avg)}</b> · ${level(avg)}</p></div>`:"")+
  `<div class="card"><table><tr><th>Күні</th><th>Түрі</th><th>§</th><th>Нәтиже</th></tr>`+
  a.map(x=>`<tr><td>${new Date(x.ts).toLocaleDateString("kk-KZ")}</td><td>${TYPES[x.type]||x.type}</td><td>${x.para||"—"}</td><td>${x.type==="ws"?(x.grade?`<b>${x.grade}</b> ${esc(x.comment||"")}`:"⏳ тексерілуде"):x.pct+"% · <b>"+x.grade+"</b>"}</td></tr>`).join("")+`</table></div>`;
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
    if(location.hash!=="#/teacher")return;
    let tc=null;if(API){try{tc=await api({action:"tconfig",pass:TP});if(!tc.ok)tc=null}catch(e){}}
    if(location.hash!=="#/teacher")return;
    renderTeacher(rows,tc);
  })();
}
function renderTeacher(rows,tc){
  const by={};rows.filter(x=>x.pct!=null).forEach(x=>{const k=x.name+"|"+x.cls;(by[k]=by[k]||[]).push(x.pct)});
  const pend=rows.filter(x=>x.type==="ws"&&!x.grade).sort((a,b)=>b.ts-a.ts),all=rows.sort((a,b)=>b.ts-a.ts);
  app.innerHTML=`<a href="#/">← Басты бет</a> · <a href="#" id="out">Шығу</a><h1>🔐 Мұғалім панелі</h1><button class="btn" id="pv">👀 Оқушы ретінде көру (тест-оқушы)</button><p class="mut">Барлық 60 тақырып ашық, нәтижелер сақталмайды және оқушыларға көрінбейді.</p>
  <h2>Оқушылар үлгерімі</h2><div class="card"><table><tr><th>Оқушы</th><th>Сынып</th><th>Тест саны</th><th>Орташа</th><th>Баға</th><th>📄 / 🗑</th></tr>`+
  Object.entries(by).map(([k,v])=>{const [n,c]=k.split("|"),avg=Math.round(v.reduce((a,b)=>a+b,0)/v.length);return `<tr><td>${esc(n)}</td><td>${esc(c)}</td><td>${v.length}</td><td>${avg}%</td><td><b>${grade(avg)}</b></td><td><button class="btn alt" data-rep="${esc(k)}" style="padding:2px 8px;font-size:13px">📄</button> <button class="btn alt" data-dl="${esc(k)}" style="padding:2px 8px;font-size:13px">🗑</button></td></tr>`}).join("")+`</table></div>
  <h2>Тексеруді күтетін жұмыс парақтары (${pend.length})</h2>`+
  (pend.map(x=>`<div class="card"><b>${esc(x.name)}</b> · ${esc(x.cls)} · §${x.para} <span class="tag">${new Date(x.ts).toLocaleString("kk-KZ")}</span>`+
    x.ans.map(a=>`<p><span class="mut">${esc(a.q)}</span><br>${esc(a.a)}</p>`).join("")+
    `<select data-g="${x.id}"><option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option></select><input data-c="${x.id}" placeholder="Пікір (міндетті емес)"><button class="btn" data-s="${x.id}">Бағаны қою</button></div>`).join("")||"<div class='card'>Жаңа жұмыс жоқ</div>")+
  teacherAnalyticsHtml(rows)+(tc?teacherAdmin(tc):"")+`<button class="btn alt" id="csv" style="margin-top:12px">⬇️ Excel/CSV жүктеу</button>`;
  if(tc)bindAdmin(tc);
  $("#pv").onclick=()=>{ls.set("jt_user",{name:"Мұғалім (тест)",cls:"—",token:"preview",preview:true});location.hash="#/";route()};
  $("#out").onclick=e=>{e.preventDefault();TP="";ls.set("jt_tp","");teacher()};
  app.querySelectorAll("[data-s]").forEach(bt=>bt.onclick=async()=>{const id=bt.dataset.s,g=+app.querySelector(`[data-g="${id}"]`).value,c=app.querySelector(`[data-c="${id}"]`).value;
    if(API){try{const r=await api({action:"grade",pass:TP,id,grade:g,comment:c});if(!r.ok)throw 0}catch(e){return alert("Қате: баға сақталмады")}}
    const x=rows.find(r=>r.id===id);x.grade=g;x.comment=c;x.status="graded";if(!API)ls.set("jt_res",rows);renderTeacher(rows,tc)});
  app.querySelectorAll("[data-rep]").forEach(bt=>bt.onclick=()=>{const [n,c]=bt.dataset.rep.split("|");openReport(rows,n,c)});
  app.querySelectorAll("[data-dl]").forEach(bt=>bt.onclick=async()=>{const [n,c]=bt.dataset.dl.split("|");
    if(!confirm(n+" ("+c+") оқушысының БАРЛЫҚ нәтижесін өшіру? Қайтару мүмкін емес."))return;
    try{const r=await api({action:"delres",pass:TP,name:n,cls:c});if(!r.ok)throw 0;alert("Өшірілді: "+r.deleted+" жазба");teacher()}catch(e){alert("Қате: өшірілмеді. Серверді жаңарттыңыз ба?")}});
  $("#csv").onclick=()=>{const L=[["Күні","Оқушы","Сынып","Түрі","§","Балл","%","Баға","Пікір"]].concat(all.map(x=>[new Date(x.ts).toLocaleString("kk-KZ"),x.name,x.cls,TYPES[x.type]||x.type,x.para,x.score!=null?x.score+"/"+x.max:"",x.pct??"",x.grade??"",x.comment||""]));
    const t="﻿"+L.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(";")).join("\n"),a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([t],{type:"text/csv"}));a.download="natizheler.csv";a.click()};
}

/* ---------- мұғалім: сынып кодтары, ашық тақырыптар, оқушылар ---------- */
function teacherAdmin(tc){
  const oldSrv=!tc.roster;tc.roster=tc.roster||{};
  const op=new Set(tc.open);
  return `<h2>🔑 Сынып кодтары</h2><div class="card" id="cls">`+Object.entries(tc.classes).map(([k,v])=>`<div class="grid" style="margin:4px 0"><input data-ck="${esc(k)}" value="${esc(k)}" readonly><input data-cv="${esc(k)}" value="${esc(v)}"></div>`).join("")+
  `<div class="grid" style="margin-top:8px"><input id="nk" placeholder="Жаңа сынып (6Е)"><input id="nv" placeholder="Коды"></div><p class="mut">Кодты өзгертуге болады. Сыныбына сәйкес кодты оқушыларға бер.</p></div>
  <h2>📋 Сынып тізімдері</h2><div class="card">${oldSrv?"<p style='color:var(--bad)'>⚠️ Сервер жаңартылмаған: Apps Script-те «Новая версия» жасап, қайта орналастырыңыз.</p>":""}`+Object.keys(tc.classes).map(k=>`<b>${esc(k)}</b> <span class="mut">(${(tc.roster[k]||[]).length} оқушы; бос болса, кез келген аты қабылданады)</span><textarea data-rs="${esc(k)}" rows="5" placeholder="Әр жолға бір оқушы: Тегі Аты">${esc((tc.roster[k]||[]).join("\n"))}</textarea>`).join("")+`<p class="mut">Оқушы тек осы тізімдегі аты-жөнімен тіркеле алады. Әріптердің кіші қателерін және аты мен тегінің ретін жүйе кешіреді.</p></div>
  <h2>🎞️ Презентация / видео сілтемелері</h2><div class="card"><input id="ln" type="number" min="1" max="60" placeholder="Параграф нөмірі (1–60)"><textarea id="lt" rows="4" placeholder="Әр жолға бір сілтеме: Атауы | https://сілтеме"></textarea><p class="mut">YouTube, Google Drive (файл), Google Slides сілтемелері тақырып ішінде көрінеді. Басқа сілтеме жаңа терезеде ашылады. Параметрлерді сақтау түймесін басуды ұмытпа.</p></div>
  <h2>📢 Хабарландыру және рейтинг</h2><div class="card"><div class="grid"><input id="an" type="number" min="1" max="60" placeholder="Тақырып №"><button class="btn alt" id="ab">📋 Хабарландыру мәтіні</button></div><p class="mut">Мәтінді көшіріп, сынып чатына (WhatsApp) жіберіңіз. Оқушы қосымшаны ашқанда да «Жаңа тақырып» хабары шығады.</p>
  <label style="display:block;margin-top:8px"><input type="checkbox" id="rt" style="width:auto" ${tc.rating===false?"":"checked"}> Сынып рейтингін оқушыларға көрсету</label></div>
  <h2>🔓 Ашық тақырыптар (<span id="oc">${op.size}</span>/60)</h2><div class="card"><div style="display:flex;flex-wrap:wrap;gap:6px" id="og">`+
  Array.from({length:60},(_,i)=>`<button class="mt" data-o="${i+1}" style="width:54px;padding:8px 0;text-align:center;${op.has(i+1)?"background:var(--pri2);border-color:var(--pri)":""}">${i+1}</button>`).join("")+
  `</div><div class="grid" style="margin-top:10px"><input id="uN" type="number" min="0" max="60" placeholder="1…N ашу"><button class="btn alt" id="uB">1…N ашу</button></div>
  <p class="mut">Түймені бассаң, тақырып ашылады/жабылады. «Сақтау» басқанша өзгеріс күшіне енбейді.</p></div>
  <button class="btn" id="svc">💾 Параметрлерді сақтау</button>
  <h2>👥 Оқушылар (${tc.users.length})</h2><div class="card"><table><tr><th>Оқушы</th><th>Сынып</th><th></th></tr>`+
  tc.users.map((u,i)=>`<tr><td>${esc(u.name)}</td><td>${esc(u.cls)}</td><td><button class="btn alt" data-rp="${i}" style="padding:4px 8px;font-size:13px">Құпиясөзді өшіру</button></td></tr>`).join("")+`</table></div>`;
}
function bindAdmin(tc){
  const op=new Set(tc.open),paint=()=>{app.querySelectorAll("[data-o]").forEach(b=>{const on=op.has(+b.dataset.o);b.style.background=on?"var(--pri2)":"";b.style.borderColor=on?"var(--pri)":""});$("#oc").textContent=op.size};
  app.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const n=+b.dataset.o;op.has(n)?op.delete(n):op.add(n);paint()});
  const links=JSON.parse(JSON.stringify(tc.links||{}));let ln=0;
  $("#ln").oninput=()=>{ln=+$("#ln").value;$("#lt").value=(links[ln]||[]).map(x=>x.t+" | "+x.u).join("\n")};
  $("#lt").oninput=()=>{if(!ln)return;links[ln]=$("#lt").value.split("\n").map(s=>s.trim()).filter(Boolean).map(s=>{const p=s.split("|").map(x=>x.trim());return{t:p.length>1?p[0]:"Материал",u:p[p.length-1]}}).filter(x=>/^https?:\/\//i.test(x.u))};
  $("#ab").onclick=async()=>{const n=+$("#an").value;if(!n||!TITLES[n-1])return alert("Тақырып нөмірін жаз (1–60)");const t=announceText(n);try{await navigator.clipboard.writeText(t);alert("Көшірілді:"+"\n\n"+t)}catch(e){prompt("Мәтінді көшір:",t)}};
  $("#uB").onclick=()=>{const n=+$("#uN").value;op.clear();for(let i=1;i<=n;i++)op.add(i);paint()};
  $("#svc").onclick=async()=>{const classes={};app.querySelectorAll("[data-ck]").forEach(k=>{const v=app.querySelector(`[data-cv="${k.dataset.ck}"]`).value.trim();if(v)classes[k.dataset.ck]=v});
    const nk=$("#nk").value.trim(),nv=$("#nv").value.trim();if(nk&&nv)classes[nk]=nv;
    const roster={};app.querySelectorAll("[data-rs]").forEach(t=>{roster[t.dataset.rs]=t.value.split("\n").map(x=>x.trim()).filter(Boolean)});
    try{const r=await api({action:"setcfg",pass:TP,open:[...op],classes,roster,links,rating:$("#rt").checked});if(!r.ok)throw 0;alert("Сақталды ✅");teacher()}catch(e){alert("Қате: сақталмады")}};
  app.querySelectorAll("[data-rp]").forEach(b=>b.onclick=async()=>{const u=tc.users[+b.dataset.rp];if(!confirm(u.name+" ("+u.cls+") құпиясөзін өшіру? Оқушы жаңадан құпиясөз жасайды."))return;
    try{const r=await api({action:"resetpw",pass:TP,name:u.name,cls:u.cls});if(!r.ok)throw 0;alert("Өшірілді");teacher()}catch(e){alert("Қате")}});
}
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js");
route();loadOpen();
