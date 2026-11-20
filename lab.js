/* Виртуалды лаборатория: 4 тәжірибе + қорытынды тест */
const LABS=[
 {id:"soda",i:"🫧",t:"Сода мен сірке қышқылы",p:"§32 Химиялық реакция"},
 {id:"ind",i:"🧪",t:"Индикатор: қышқыл, сілті, бейтараптандыру",p:"§23–24"},
 {id:"heat",i:"🌡️",t:"Мұзды қыздыру: балқу және қайнау",p:"§21"},
 {id:"press",i:"⛷️",t:"Қысым: адам қарда неге батады?",p:"§45"}];

function labMenu(){
  let h=`<a href="#/">← Басты бет</a><h1>🧪 Виртуалды лаборатория</h1><p class="mut">Қауіпсіз тәжірибелер: өзің істеп, бақыла, соңында қысқа тест тапсыр.</p>`;
  LABS.forEach(x=>h+=`<a class="card" style="display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit" href="#/lab/${x.id}"><span style="font-size:30px">${x.i}</span><span><b>${x.t}</b><br><span class="mut">${x.p}</span></span></a>`);
  app.innerHTML=h;
}
function labPage(h){
  const id=h[1];if(!id)return labMenu();
  const L=LABS.find(x=>x.id===id);if(!L)return labMenu();
  app.innerHTML=`<a href="#/lab">← Лаборатория</a><h1>${L.i} ${L.t}</h1><div id="lb"></div>`;
  ({soda:labSoda,ind:labInd,heat:labHeat,press:labPress})[id]($("#lb"),L);
}
/* ---- қорытынды тест ---- */
function labQuiz(b,L,items,type){type=type||"lab";
  let i=0,score=0;const t0=Date.now();
  const draw=()=>{const q=items[i];b.innerHTML=`<h2>📝 Қорытынды тест</h2><div class="bar"><i style="width:${i/items.length*100}%"></i></div><p class="mut">${i+1} / ${items.length}</p><div class="card"><b>${esc(q.q)}</b></div>`+q.o.map((t,k)=>`<button class="opt" data-k="${k}">${esc(t)}</button>`).join("")+`<div id="fb"></div>`;
    b.querySelectorAll(".opt").forEach(el=>el.onclick=()=>{const k=+el.dataset.k,ok=k===q.a;if(ok)score++;
      b.querySelectorAll(".opt").forEach((e,j)=>{e.disabled=true;if(j===q.a)e.classList.add("ok");else if(j===k)e.classList.add("no")});
      $("#fb").innerHTML=`<div class="card">${ok?"✅ Дұрыс!":"❌ Қате."} ${esc(q.why||"")}</div><button class="btn" id="nx">${i+1<items.length?"Келесі →":"Аяқтау"}</button>`;
      $("#nx").onclick=()=>{i++;i<items.length?draw():fin()}})};
  const fin=async()=>{const max=items.length,pct=Math.round(score/max*100),g=grade(pct);
    const rec={id:uid(),name:user().name,cls:user().cls,type:type,para:0,score,max,pct,grade:g,dur:Math.round((Date.now()-t0)/1000),ts:Date.now(),status:"auto",mapset:L.id};
    const ok=await submit(rec);
    b.innerHTML=`<div class="card"><div class="big">${pct}%</div><p style="text-align:center"><b>Баға: ${g}</b> · ${level(pct)}<br>${score} / ${max} дұрыс</p></div><p class="mut">${ok?"✅ Нәтиже мұғалімге жіберілді.":"⚠️ Нәтиже осы телефонда сақталды."}</p><button class="btn" onclick="location.reload()">🔁 Тәжірибені қайта жасау</button><a class="btn alt" style="margin-top:8px" href="#/lab">← Басқа тәжірибе</a>`};
  draw();
}
const goQuiz=(b,L,items)=>`<button class="btn" id="gq" style="margin-top:12px">📝 Тестке өту</button>`;
function logger(b){return {el:b.querySelector("#lg"),add(t){this.el.insertAdjacentHTML("beforeend",`<li>${t}</li>`)}}}

/* ===== 1. Сода + сірке ===== */
function labSoda(b,L){
  let st={soda:false,vin:false,done:false};
  b.innerHTML=`<div class="card">Мақсат: заттардың химиялық жолмен өзгеруін (реакция белгілерін) бақылау. Қадамдарды ретімен орында.</div>
  <svg viewBox="0 0 300 220" style="width:100%;max-width:420px;display:block;margin:auto;background:#eef7fb;border-radius:12px">
   <style>@keyframes up{0%{transform:translateY(0);opacity:.9}100%{transform:translateY(-95px);opacity:0}}.bb{animation:up 1.6s infinite;fill:#fff;stroke:#7fb5d0}</style>
   <path d="M95,60 L95,190 Q95,200 105,200 L195,200 Q205,200 205,190 L205,60" fill="none" stroke="#456" stroke-width="3"/>
   <rect id="liq" x="97" y="190" width="106" height="0" fill="#bfe8ff" opacity=".8"/>
   <path id="pow" d="M100,198 Q150,186 200,198 L200,199 L100,199Z" fill="#fafafa" stroke="#ccc" style="display:none"/>
   <g id="bub"></g>
   <g id="mt" style="display:none"><rect x="240" y="30" width="5" height="70" fill="#c9a36a" transform="rotate(25 242 65)"/><path id="fl" d="M232,28 q8,-18 14,0 q-6,10 -14,0Z" fill="#ff9800" transform="rotate(25 242 65)"/></g>
   <text id="gas" x="150" y="40" text-anchor="middle" font-size="16" fill="#2a7" style="display:none">CO₂ ↑</text></svg>
  <div class="grid" style="margin-top:10px"><button class="btn alt" id="b1">1️⃣ Сода сал</button><button class="btn alt" id="b2">2️⃣ Сірке қышқылын құй</button></div>
  <button class="btn alt" id="b3" style="margin-top:8px">3️⃣ Жанған шырпыны жақындат</button>
  <h2>📒 Бақылау журналы</h2><ul id="lg" class="card" style="padding-left:28px"></ul><div id="end"></div>`;
  const lg=logger(b),$$=s=>b.querySelector(s);
  $$("#b1").onclick=()=>{if(st.soda)return;st.soda=true;$$("#pow").style.display="";lg.add("Стақанға ас содасының ұнтағы салынды (ақ ұнтақ).")};
  $$("#b2").onclick=()=>{if(!st.soda)return lg.add("⚠️ Алдымен сода салу керек.");if(st.vin)return;st.vin=true;$$("#liq").setAttribute("y",120);$$("#liq").setAttribute("height",70);
    let g="";for(let i=0;i<14;i++)g+=`<circle class="bb" cx="${108+Math.random()*84}" cy="${150+Math.random()*30}" r="${2+Math.random()*4}" style="animation-delay:${(Math.random()*1.6).toFixed(2)}s"/>`;
    $$("#bub").innerHTML=g;$$("#gas").style.display="";lg.add("Сірке қышқылы құйылды: көпіршіктер пайда болды, газ бөлінді. <b>Реакция белгісі: газдың бөлінуі.</b>")};
  $$("#b3").onclick=()=>{$$("#mt").style.display="";
    if(!st.vin)lg.add("Шырпы жанып тұр (реакция әлі жүрмеген, газ жоқ).");
    else{$$("#fl").style.display="none";lg.add("Шырпы сөнді: көмірқышқыл газы (CO₂) отты өшіреді. Демек, жаңа зат — CO₂ пайда болды.");if(!st.done){st.done=true;$$("#end").innerHTML=goQuiz()+"";$$("#gq").onclick=()=>labQuiz(b,L,Q_SODA)}}};
}
const Q_SODA=[
 {q:"Сода мен сірке қышқылы әрекеттескенде қандай газ бөлінеді?",o:["Оттек","Көмірқышқыл газы","Сутек","Азот"],a:1,why:"CO₂ бөлінеді."},
 {q:"Жанып тұрған шырпы газға жақындағанда не болды?",o:["Жарқырады","Сөнді","Өзгермеді","Жарылды"],a:1,why:"CO₂ жануды қолдамайды."},
 {q:"Қайсысы химиялық реакцияның белгісі?",o:["Зат пішінінің өзгеруі","Газдың бөлінуі","Заттың массасы","Ыдыстың түрі"],a:1,why:"Газ бөлінуі – реакция белгісі."}];

/* ===== 2. Индикатор ===== */
function labInd(b,L){
  const S=[["Лимон шырыны",2.2],["Сірке қышқылы",2.9],["Таза су",7],["Ас тұзының ерітіндісі",7],["Ас содасының ерітіндісі",8.4],["Сабын ерітіндісі",10]];
  const col=p=>p<3?"#e53935":p<4.5?"#ef6c00":p<6.5?"#fbc02d":p<7.5?"#43a047":p<9?"#26a69a":p<11?"#3f51b5":"#7e57c2";
  const kind=p=>p<6.5?"қышқыл":p>7.5?"сілтілі":"бейтарап";
  const tested={};let cur=null,drops=0,quizShown=false;
  b.innerHTML=`<div class="card">1-бөлім: әр ерітіндіні таңда, индикатор тамыз, түсіне қарап ортасын анықта.</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px" id="rk">${S.map((s,i)=>`<button class="mt" style="width:auto" data-i="${i}">${s[0]}</button>`).join("")}</div>
  <div style="display:flex;gap:20px;align-items:center;margin:10px 0"><svg viewBox="0 0 80 140" width="90"><path d="M25,10 L25,110 Q25,128 40,128 Q55,128 55,110 L55,10" fill="none" stroke="#456" stroke-width="3"/><path id="tl" d="M27,70 L27,110 Q27,126 40,126 Q53,126 53,110 L53,70Z" fill="#eaf6fb" style="display:none"/></svg>
  <div><div id="cn" class="mut">Ерітіндіні таңда.</div><button class="btn" id="di" style="margin-top:8px">💧 Индикатор тамыз</button><div id="ph" style="margin-top:8px;font-weight:700"></div></div></div>
  <div class="card"><b>Нәтиже кестесі</b><table id="tb"><tr><th>Ерітінді</th><th>Түсі</th><th>Орта</th></tr></table></div>
  <h2>2-бөлім: бейтараптандыру</h2><div class="card">Қышқыл ерітіндісіне (pH≈2) сілті тамшыларын қос. Бейтарап орта (жасыл түс) пайда болғанша тамызып көр.</div>
  <div style="display:flex;gap:20px;align-items:center"><svg viewBox="0 0 100 110" width="110"><path d="M20,15 L20,90 Q20,100 30,100 L70,100 Q80,100 80,90 L80,15" fill="none" stroke="#456" stroke-width="3"/><rect id="nl" x="22" y="45" width="56" height="53" fill="#e53935" opacity=".85"/></svg>
  <div><button class="btn alt" id="dr">➕ Сілті тамшысы</button><div id="np" style="margin-top:8px;font-weight:700">pH = 2.0 (қышқылды)</div><div id="nm" class="mut"></div></div></div><div id="end"></div>`;
  const $$=s=>b.querySelector(s);
  b.querySelectorAll("#rk .mt").forEach(el=>el.onclick=()=>{cur=+el.dataset.i;b.querySelectorAll("#rk .mt").forEach(x=>x.classList.remove("sel"));el.classList.add("sel");$$("#tl").style.display="";$$("#tl").setAttribute("fill","#eaf6fb");$$("#cn").textContent=S[cur][0]+": индикатор әлі тамызылмады";$$("#ph").textContent=""});
  $$("#di").onclick=()=>{if(cur===null)return alert("Алдымен ерітіндіні таңда");const p=S[cur][1];$$("#tl").setAttribute("fill",col(p));$$("#cn").textContent=S[cur][0]+": түсі өзгерді";
    $$("#ph").textContent="Түс бойынша орта: "+kind(p)+" (pH ≈ "+p+")";
    if(!tested[cur]){tested[cur]=1;$$("#tb").insertAdjacentHTML("beforeend",`<tr><td>${S[cur][0]}</td><td><span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${col(p)}"></span></td><td>${kind(p)}</td></tr>`)};check()};
  const steps=[2,2.6,3.3,4.2,5.4,6.5,7,9,10.5,11.5,12];
  $$("#dr").onclick=()=>{if(drops<steps.length-1)drops++;const p=steps[drops];$$("#nl").setAttribute("fill",col(p));$$("#np").textContent="pH = "+p+" ("+kind(p)+")";
    $$("#nm").textContent=p>=6.5&&p<7.5?"✅ Бейтарап орта: қышқыл мен сілті бір-бірін бейтараптандырды (су және тұз түзіледі).":p>7.5?"Сілті артық болып кетті.":"Әлі қышқыл орта.";if(p>=6.5&&p<7.5)neu=true;check()};
  let neu=false;
  function check(){if(!quizShown&&Object.keys(tested).length>=S.length&&neu){quizShown=true;$$("#end").innerHTML=goQuiz();$$("#gq").onclick=()=>labQuiz(b,L,Q_IND)}}
  $$("#end").innerHTML=`<p class="mut" style="margin-top:10px">Тестке өту үшін: барлық 6 ерітіндіні тексер және бейтарап ортаға жет.</p>`;
}
const Q_IND=[
 {q:"Қышқыл ортада универсал индикатор қандай түске боялады?",o:["Қызыл","Көк","Жасыл","Түссіз"],a:0,why:"Қышқыл – қызыл/қызғылт."},
 {q:"Бейтарап ортаның (су) түсі қандай?",o:["Қызыл","Жасыл","Күлгін-көк","Қара"],a:1,why:"Бейтарап ортада жасыл."},
 {q:"Сабын ерітіндісі қандай орта?",o:["Қышқыл","Бейтарап","Сілтілі","Анықталмайды"],a:2,why:"Сабын – сілтілі орта (pH>7)."},
 {q:"Қышқыл мен сілті әрекеттескенде не түзіледі?",o:["Тек газ","Су және тұз","Тек тұз","Ештеңе"],a:1,why:"Бейтараптандыру: қышқыл + сілті → тұз + су."},
 {q:"Лимон шырынының pH мәні шамамен:",o:["2","7","10","14"],a:0,why:"Лимон шырыны – күшті қышқылды."}];

/* ===== 3. Қыздыру ===== */
function labHeat(b,L){
  let k=0,auto=null;const T=[];
  for(let i=0;i<5;i++)T.push([-10+i*2,"Мұз"]);for(let i=0;i<4;i++)T.push([0,"Мұз балқып жатыр"]);
  for(let i=1;i<=10;i++)T.push([i*10,"Су"]);for(let i=0;i<4;i++)T.push([100,"Су қайнап жатыр"]);for(let i=1;i<=3;i++)T.push([100+i*8,"Бу"]);
  b.innerHTML=`<div class="card">Мұзды біркелкі қыздырамыз. Әр басқанда уақыт өтеді (1 қадам). Температура мен заттың күйін бақыла.</div>
  <div style="display:flex;gap:14px;align-items:center"><div id="st" style="font-size:42px">🧊</div><div><div style="font-size:30px;font-weight:800" id="tp">-10 °C</div><div id="sn" class="mut">Мұз</div></div></div>
  <svg id="gr" viewBox="0 0 300 160" style="width:100%;background:#fff;border:1px solid var(--line);border-radius:12px;margin:10px 0"><line x1="30" y1="10" x2="30" y2="140" stroke="#888"/><line x1="30" y1="140" x2="290" y2="140" stroke="#888"/><text x="4" y="14" font-size="9">T°C</text><text x="270" y="152" font-size="9">уақыт</text><text x="8" y="144" font-size="8">-10</text><text x="6" y="84" font-size="8">0</text><text x="2" y="30" font-size="8">130</text><polyline id="ln" fill="none" stroke="#e53935" stroke-width="2" points=""/></svg>
  <div class="grid"><button class="btn" id="hs">🔥 1 қадам қыздыру</button><button class="btn alt" id="ha">▶️ Автоматты</button></div><h2>📒 Бақылау журналы</h2><ul id="lg" class="card" style="padding-left:28px"></ul><div id="end"></div>`;
  const $$=s=>b.querySelector(s),lg=logger(b);let last="",qs=false;
  const X=i=>30+i*(250/(T.length-1)),Y=t=>140-(t+10)/140*130;
  function step(){if(k>=T.length-1){clearInterval(auto);return}k++;const [t,s]=T[k];$$("#tp").textContent=t+" °C";$$("#sn").textContent=s;
    $$("#st").textContent=s.startsWith("Мұз")?"🧊":s.startsWith("Су")?"💧":"♨️";
    $$("#ln").setAttribute("points",T.slice(0,k+1).map((p,i)=>X(i).toFixed(1)+","+Y(p[0]).toFixed(1)).join(" "));
    if(s!==last){last=s;lg.add(`${k}-қадам: ${t} °C — <b>${s}</b>`)}
    if(k>=T.length-1&&!qs){qs=true;lg.add("Қорытынды: мұз 0 °C-та балқиды, су 100 °C-та қайнайды. Балқу және қайнау кезінде температура өзгермейді.");$$("#end").innerHTML=goQuiz();$$("#gq").onclick=()=>{clearInterval(auto);labQuiz(b,L,Q_HEAT)}}}
  $$("#hs").onclick=step;$$("#ha").onclick=()=>{clearInterval(auto);auto=setInterval(()=>{if(!document.body.contains($$("#ha"))){clearInterval(auto);return}step()},450)};
  lg.add("Бастапқы күй: мұз, -10 °C.");
}
const Q_HEAT=[
 {q:"Мұз қандай температурада балқиды?",o:["0 °C","10 °C","100 °C","-10 °C"],a:0,why:"Мұздың балқу температурасы 0 °C."},
 {q:"Су қандай температурада қайнайды (қалыпты қысымда)?",o:["50 °C","90 °C","100 °C","120 °C"],a:2,why:"Қайнау температурасы 100 °C."},
 {q:"Балқу кезінде температура қалай өзгереді?",o:["Көтеріледі","Төмендейді","Өзгермейді","Секіреді"],a:2,why:"Балқу кезінде температура тұрақты."},
 {q:"Судың 100 °C-тан жоғары күйі:",o:["Мұз","Бу","Сұйық","Қатты дене"],a:1,why:"Су буға айналады."}];

/* ===== 4. Қысым ===== */
function labPress(b,L){
  const A=[["Өкше (тік)",0.002],["Етік",0.04],["Шаңғы",0.4]];let ai=1,m=50,tried={};
  b.innerHTML=`<div class="card">Қысым p = F : S (күш : аудан). Салмағын және аяқ астындағы аудан түрін өзгертіп, адамның қарға қанша бататынын бақыла.</div>
  <label>Адамның массасы: <b id="mv">50</b> кг</label><input type="range" id="ms" min="20" max="90" value="50">
  <div id="ar" style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0">${A.map((a,i)=>`<button class="mt ${i===1?"sel":""}" style="width:auto" data-i="${i}">${a[0]} (${a[1]} м²)</button>`).join("")}</div>
  <svg viewBox="0 0 300 170" style="width:100%;background:#eef7fb;border-radius:12px"><rect x="0" y="95" width="300" height="75" fill="#fff" stroke="#cde"/><g id="pp"></g></svg>
  <div class="card" id="rs"></div><div id="end"></div>`;
  const $$=s=>b.querySelector(s);
  function draw(){const S=A[ai][1],F=m*9.8,p=F/S/1000,d=Math.min(60,p/3);$$("#mv").textContent=m;
    const w=Math.max(8,Math.min(110,S*260)),h=d;
    $$("#pp").innerHTML=`<rect x="${150-w/2}" y="${95-12+h}" width="${w}" height="8" fill="#555"/><rect x="143" y="${95-62+h}" width="14" height="50" rx="4" fill="#3b7"/><circle cx="150" cy="${95-72+h}" r="9" fill="#fc8"/>`;
    $$("#rs").innerHTML=`Күш F = ${m} × 9,8 ≈ <b>${Math.round(F)} Н</b><br>Аудан S = <b>${S} м²</b><br>Қысым p = F : S ≈ <b>${p<10?p.toFixed(1):Math.round(p)} кПа</b><br>Қарға бату тереңдігі ≈ <b>${Math.round(d)} см</b>`;
    tried[ai]=1;if(Object.keys(tried).length===3&&!$$("#gq")){$$("#end").innerHTML=goQuiz();$$("#gq").onclick=()=>labQuiz(b,L,Q_PRESS)}}
  $$("#ms").oninput=e=>{m=+e.target.value;draw()};
  b.querySelectorAll("#ar .mt").forEach(el=>el.onclick=()=>{ai=+el.dataset.i;b.querySelectorAll("#ar .mt").forEach(x=>x.classList.remove("sel"));el.classList.add("sel");draw()});
  draw();
  $$("#end").innerHTML=`<p class="mut">Тестке өту үшін аудан түрінің үшеуін де байқап көр.</p>`;
}
const Q_PRESS=[
 {q:"Қысымды қалай есептейді?",o:["p = F · S","p = F : S","p = S : F","p = F + S"],a:1,why:"Қысым = күш : аудан."},
 {q:"Аяқ астындағы аудан үлкейсе, қысым:",o:["Артады","Азаяды","Өзгермейді","Нөл болады"],a:1,why:"Аудан үлкен болса, қысым аз."},
 {q:"Шаңғышы қарға неге батпайды?",o:["Жеңіл","Шаңғының ауданы үлкен","Қар қатты","Күші аз"],a:1,why:"Салмақ үлкен ауданға таралады, қысым азаяды."},
 {q:"Ине неге оңай тесіп өтеді?",o:["Ауыр","Ауданы өте кіші, қысымы үлкен","Жылы","Ұзын"],a:1,why:"Кіші аудан – үлкен қысым."}];
