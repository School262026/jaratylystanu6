/* География практикумы: шартты белгілер, масштаб, сағаттық белдеулер, координаттар (§12–15) */
const GEO=[
 {id:"symbols",i:"🧭",t:"Шартты белгілер",p:"§12"},
 {id:"scale",i:"📏",t:"Масштаб: арақашықтықты есептеу",p:"§13"},
 {id:"coords",i:"📍",t:"Географиялық координаттар",p:"§14"},
 {id:"find",i:"🎯",t:"Координат бойынша картадан нүкте табу",p:"§14"},
 {id:"zones",i:"🕒",t:"Сағаттық белдеулер және уақыт",p:"§15"},
 {id:"deposits",i:"⛏️",t:"Кен орындарын картаға түсіру",p:"§28"}];
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const fmtN=n=>String(Math.round(n*100)/100).replace(".",",");
const fmtScale=n=>"1:"+n.toString().replace(/\B(?=(\d{3})+(?!\d))/g," ");
const hhmm=m=>{m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};

function geoPage(h){
  const id=h[1];if(!id)return mapsMenu();
  const G=GEO.find(x=>x.id===id);if(!G)return mapsMenu();
  app.innerHTML=`<a href="#/maps">← Карталар</a><h1>${G.i} ${G.t}</h1><div id="gb"></div>`;
  const b=$("#gb");
  if(id==="symbols")geoRun(b,G,symItems());
  if(id==="scale")geoIntro(b,G,`<b>Масштаб</b> — картадағы арақашықтықтың жердегі нақты арақашықтыққа қатынасы. Мысалы, 1:2 500 000 масштабында <b>1 см = 25 км</b>.<br>Нақты арақашықтық = картадағы см × масштаб мөлшері. Экватордың 1° доғасы ≈ <b>111 км</b>.`,scaleItems);
  if(id==="coords")geoIntro(b,G,`<b>Географиялық координаттар</b> — нүктенің ендігі (φ, экваторға қатысты) және бойлығы (λ, нөлдік меридианға қатысты). Қазақстан үшін: ендік — солтүстік (с.е.), бойлық — шығыс (ш.б.). Әлем нүктелері үшін оңтүстік ендік (о.е.) мен батыс бойлыққа (б.б.) <b>минус (−)</b> таңбасын қой.<br><b>Ендікті анықтау алгоритмі:</b> 1) картадан объектіні тап; 2) жарты шарын анықта (солтүстік/оңтүстік); 3) өтетін параллельді тап; 4) параллельдің мәнін градуспен анықта; 5) ендікті жаз. <b>Бойлықты</b> дәл солай меридиан арқылы (шығыс/батыс) анықтайды.`,coordItems);
  if(id==="find")geoIntro(b,G,`Координаттары берілген нүктені Қазақстан картасында тап. Картада әр 5° сайын ендік пен бойлық торы сызылған.`,findItems);
  if(id==="deposits")geoIntro(b,G,`Қазақстанның ірі пайдалы қазба кен орындарын картаға түсір. Картада облыстар шекарасы, өзен-көлдер және ірі қалалар көрсетілген. Нысанды түртіп, орнын көрсет. Әр жауаптан кейін кен орнының облысы айтылады.`,depositItems);
  if(id==="zones")geoIntro(b,G,`Жер 24 сағаттық белдеуге бөлінген, әр белдеу <b>15°</b> (360°:24). Белдеулер арасындағы айырма — <b>1 сағат</b>. Шығысқа қарай уақыт артады. Астана — V белдеу (UTC+5), Лондон — 0 белдеу, Пекин — VIII белдеу.`,zoneItems);
}
function geoIntro(b,G,txt,mk){
  b.innerHTML=`<div class="card">${txt}</div><button class="btn" id="gs">Тапсырмаларды бастау</button>`;
  $("#gs").onclick=()=>geoRun(b,G,mk());
}
/* ---- жалпы тапсырма жүргізушісі ---- */
function geoRun(b,G,items){
  let i=0,score=0;const t0=Date.now();
  const draw=()=>{const q=items[i];
    b.innerHTML=`<div class="bar"><i style="width:${i/items.length*100}%"></i></div><p class="mut">${i+1} / ${items.length}</p><div class="card">${q.q}</div><div id="in"></div><div id="fb"></div>`;
    const inp=$("#in");
    if(q.kind==="choice"){inp.innerHTML=q.o.map((t,k)=>`<button class="opt" data-k="${k}">${t}</button>`).join("");inp.querySelectorAll(".opt").forEach(el=>el.onclick=()=>{const k=+el.dataset.k;inp.querySelectorAll(".opt").forEach((e,j)=>{e.disabled=true;if(j===q.a)e.classList.add("ok");else if(j===k)e.classList.add("no")});done(k===q.a,q.sol)})}
    else if(q.kind==="num"){inp.innerHTML=`<input id="a1" inputmode="decimal" placeholder="Жауабың${q.unit?" ("+q.unit+")":""}"><button class="btn" id="ck">Тексеру</button>`;$("#ck").onclick=()=>{const v=parseFloat($("#a1").value.replace(",","."));if(isNaN(v))return alert("Санмен жаз");done(Math.abs(v-q.ans)<=Math.max(q.tol||0,Math.abs(q.ans)*.01),q.sol)}}
    else if(q.kind==="time"){inp.innerHTML=`<input id="a1" type="time" step="60"><button class="btn" id="ck">Тексеру</button>`;$("#ck").onclick=()=>{const v=$("#a1").value;if(!v)return alert("Уақытты таңда");const [hh,mm]=v.split(":").map(Number);done((((hh*60+mm)-q.ans)%1440+1440)%1440===0,q.sol)}}
    else if(q.kind==="coord"){inp.innerHTML=`<div class="grid"><input id="a1" inputmode="decimal" placeholder="Ендік, ° с.е."><input id="a2" inputmode="decimal" placeholder="Бойлық, ° ш.б."></div><button class="btn" id="ck">Тексеру</button>`;$("#ck").onclick=()=>{const la=parseFloat($("#a1").value.replace(",",".")),lo=parseFloat($("#a2").value.replace(",","."));if(isNaN(la)||isNaN(lo))return alert("Екі санды да жаз");done(Math.abs(la-q.lat)<=(q.tol||1.5)&&Math.abs(lo-q.lon)<=(q.tol||1.5),q.sol)}}
    else if(q.kind==="click"){drawFind(inp,q,done)}
  };
  function done(ok,sol){if(ok)score++;$("#fb").innerHTML=`<div class="card">${ok?"✅ Дұрыс!":"❌ Қате."} ${sol||""}</div><button class="btn" id="nx">${i+1<items.length?"Келесі →":"Аяқтау"}</button>`;$("#nx").onclick=()=>{i++;i<items.length?draw():fin()};
    inpLock()}
  function inpLock(){b.querySelectorAll("#in input,#in .btn").forEach(e=>e.disabled=true)}
  const fin=async()=>{const max=items.length,pct=Math.round(score/max*100),g=grade(pct);
    const rec={id:uid(),name:user().name,cls:user().cls,type:"map",para:0,score,max,pct,grade:g,dur:Math.round((Date.now()-t0)/1000),ts:Date.now(),status:"auto",mapset:"geo/"+G.id};
    const ok=await submit(rec);
    b.innerHTML=`<div class="card"><div class="big">${pct}%</div><p style="text-align:center"><b>Баға: ${g}</b> · ${level(pct)}<br>${score} / ${max} дұрыс</p></div><p class="mut">${ok?"✅ Нәтиже мұғалімге жіберілді.":"⚠️ Нәтиже осы телефонда сақталды."}</p><button class="btn" onclick="location.reload()">🔁 Жаңа тапсырмалар</button><a class="btn alt" style="margin-top:8px" href="#/maps">← Карталар</a>`};
  draw();
}

/* ---- 1. Шартты белгілер ---- */
const SYM=(()=>{
  const sv=(inner,bg)=>`<svg viewBox="0 0 60 40" width="90" style="background:${bg||"#f4efe0"};border-radius:8px">${inner}</svg>`;
  const em=(e,bg)=>sv(`<text x="30" y="30" font-size="26" text-anchor="middle">${e}</text>`,bg);
  return[
  {n:"Орман",g:"аудандық",s:em("🌲","#cfe9c4")},{n:"Көл (су айдыны)",g:"аудандық",s:sv('<rect width="60" height="40" fill="#8fd0f0"/>',"#8fd0f0")},
  {n:"Құм",g:"аудандық",s:sv('<g fill="#b08a2e"><circle cx="10" cy="10" r="1.5"/><circle cx="30" cy="14" r="1.5"/><circle cx="48" cy="9" r="1.5"/><circle cx="18" cy="28" r="1.5"/><circle cx="40" cy="30" r="1.5"/></g>',"#f6e7a8")},
  {n:"Егістік (жыртылған жер)",g:"аудандық",s:sv('<g stroke="#a67c2e" stroke-width="2"><path d="M0,10H60M0,20H60M0,30H60"/></g>',"#f1e2b8")},
  {n:"Батпақ",g:"аудандық",s:sv('<g stroke="#2a8" stroke-width="1.5"><path d="M8,10h14M30,16h14M12,26h14M36,32h14"/></g>',"#d8f0ee")},
  {n:"Өзен",g:"сызықтық",s:sv('<path d="M0,28 Q15,8 30,22 T60,12" fill="none" stroke="#2a7fb5" stroke-width="3"/>')},
  {n:"Темір жол",g:"сызықтық",s:sv('<path d="M0,28H60" stroke="#222" stroke-width="3"/><path d="M8,22v12M20,22v12M32,22v12M44,22v12M56,22v12" stroke="#222" stroke-width="2"/>')},
  {n:"Автомобиль жолы",g:"сызықтық",s:sv('<path d="M0,20H60" stroke="#d33" stroke-width="5"/>')},
  {n:"Мемлекеттік шекара",g:"сызықтық",s:sv('<path d="M0,20H60" stroke="#a33" stroke-width="3" stroke-dasharray="8 4"/>')},
  {n:"Электр желісі",g:"сызықтық",s:sv('<path d="M0,20H60" stroke="#222" stroke-width="2"/><g stroke="#222"><path d="M12,14v12M30,14v12M48,14v12"/></g>')},
  {n:"Қала (ірі елді мекен)",g:"масштабсыз",s:sv('<circle cx="30" cy="20" r="9" fill="#d33" stroke="#fff" stroke-width="2"/>')},
  {n:"Тау шыңы",g:"масштабсыз",s:sv('<path d="M15,30L30,8L45,30Z" fill="#8a6a3a"/>')},
  {n:"Әуежай",g:"масштабсыз",s:em("✈️")},{n:"Мұнай кен орны",g:"масштабсыз",s:em("🛢️")},
  {n:"Шахта (көмір кен орны)",g:"масштабсыз",s:em("⛏️")},{n:"Электр стансысы",g:"масштабсыз",s:em("⚡")},
  {n:"Аурухана",g:"масштабсыз",s:em("➕")},{n:"Мектеп",g:"масштабсыз",s:em("🏫")},{n:"Ескерткіш",g:"масштабсыз",s:em("🗿")}];
})();
function symItems(){
  const G=["аудандық","сызықтық","масштабсыз"],out=[];
  shuffle(SYM).slice(0,10).forEach((s,i)=>{
    if(i%3===2){out.push({kind:"choice",q:`Бұл шартты белгі қай топқа жатады?<br>${s.s}`,o:G.map(x=>x[0].toUpperCase()+x.slice(1)),a:G.indexOf(s.g),sol:`<b>${s.n}</b> — ${s.g} шартты белгі. Аудандық: үлкен аумақ (орман, көл); сызықтық: сызық (өзен, жол); масштабсыз: нүктелік белгі (қала, шың).`})}
    else{const names=shuffle(SYM.filter(x=>x.n!==s.n)).slice(0,3).map(x=>x.n);const o=shuffle([s.n].concat(names));out.push({kind:"choice",q:`Бұл шартты белгі нені білдіреді?<br>${s.s}`,o,a:o.indexOf(s.n),sol:`Бұл — <b>${s.n}</b> (${s.g} белгі).`})}});
  return out;
}

/* ---- 2. Масштаб ---- */
function scaleItems(){
  const out=[],SC=[100000,200000,500000,1000000,2500000,5000000,6000000,10000000,20000000];
  const km=n=>n/100000; // 1 см = n/100000 км
  for(let i=0;i<10;i++){const N=pick(SC),per=km(N),t=i%8;
    if(t===0){const c=rnd(2,25),x=c*per;out.push({kind:"num",unit:"км",ans:x,q:`Масштабы <b>${fmtScale(N)}</b> картада А және Б нүктелерінің арақашықтығы <b>${c} см</b>. Жердегі нақты арақашықтық қанша км?`,sol:`Масштаб мөлшері: 1 см = ${fmtN(per)} км. x = ${c} · ${fmtN(per)} = <b>${fmtN(x)} км</b>.`})}
    else if(t===1){const c=rnd(2,20),d=Math.round(c*per*10)/10;out.push({kind:"num",unit:"см",ans:d/per,tol:.1,q:`Жердегі А және Б нүктелерінің арақашықтығы <b>${fmtN(d)} км</b>. Масштабы <b>${fmtScale(N)}</b> картада бұл арақашықтық неше см болады?`,sol:`1 см = ${fmtN(per)} км. x = ${fmtN(d)} : ${fmtN(per)} = <b>${fmtN(d/per)} см</b>.`})}
    else if(t===2){const v=pick([4,5,6]),hr=pick([2,3,4,5]),N2=pick([100000,200000,500000]),d=v*hr,p2=km(N2);out.push({kind:"num",unit:"см",ans:d/p2,tol:.1,q:`Жолаушы сағатына <b>${v} км</b> жылдамдықпен <b>${hr} сағат</b> жүрді. Жүрген жолы масштабы <b>${fmtScale(N2)}</b> картада неше см болады?`,sol:`Жол: ${v} · ${hr} = ${d} км. 1 см = ${fmtN(p2)} км. x = ${d} : ${fmtN(p2)} = <b>${fmtN(d/p2)} см</b>.`})}
    else if(t===3){const N3=pick([5000000,10000000,20000000]),p3=km(N3),deg=pick([10,20,30,40,45,50]),c=deg*111/p3;out.push({kind:"num",unit:"°",ans:deg,tol:.5,q:`Масштабы <b>${fmtScale(N3)}</b> картада экватордағы А және Б нүктелерінің арақашықтығы <b>${fmtN(c)} см</b>. Осы нүктелер арасындағы экватор доғасының бұрышы неше градус? (1° ≈ 111 км)`,sol:`Қашықтық: ${fmtN(c)} · ${fmtN(p3)} = ${fmtN(c*p3)} км. Бұрыш: ${fmtN(c*p3)} : 111 = <b>${deg}°</b>.`})}
    else if(t===5){const N5=pick([1000000,2500000,5000000]),p5=km(N5),w=pick([25,50,75,100]),hh=pick([50,100,150]);const cw=w/p5,ch=hh/p5;out.push({kind:"num",unit:"см²",ans:cw*ch,tol:.05,q:`Ұзындығы <b>${hh} км</b>, ені <b>${w} км</b> жер телімінің ауданы масштабы <b>${fmtScale(N5)}</b> картада неше см² болады?`,sol:`1 см = ${fmtN(p5)} км. Картадағы ұзындығы: ${hh} : ${fmtN(p5)} = ${fmtN(ch)} см, ені: ${w} : ${fmtN(p5)} = ${fmtN(cw)} см. Ауданы: ${fmtN(ch)} · ${fmtN(cw)} = <b>${fmtN(cw*ch)} см²</b>.`})}
    else if(t===6){const N6=pick([50000,100000,200000]),p6=N6/100000,cw=pick([2,3,4,5]),ch=pick([3,4,6,8]);out.push({kind:"num",unit:"км²",ans:cw*p6*ch*p6,tol:.05,q:`Картада (масштабы <b>${fmtScale(N6)}</b>) жер телімінің ені <b>${cw} см</b>, ұзындығы <b>${ch} см</b>. Нақты ауданы неше км²?`,sol:`1 см = ${fmtN(p6)} км. Нақты ені: ${cw} · ${fmtN(p6)} = ${fmtN(cw*p6)} км, ұзындығы: ${ch} · ${fmtN(p6)} = ${fmtN(ch*p6)} км. Ауданы: <b>${fmtN(cw*p6*ch*p6)} км²</b>.`})}
    else if(t===7){const L=pick([40,50,80]),x=20000/L*100000;out.push({kind:"num",unit:"",ans:x,q:`Глобуста екі полюс арасындағы арақашықтық <b>${L} см</b> (нақты арақашықтық ≈ 20 000 км). Глобустың сандық масштабы 1 : ? (тек екінші санды жаз, мысалы 50000000)`,sol:`1 см = 20000 : ${L} = ${20000/L} км = ${x} см. Масштаб 1 : <b>${x}</b>.`})}
    else{const c=pick([2,4,5,10]),r=pick([10,20,25,50,100,250,500]),x=r/c*100000;out.push({kind:"num",unit:"",ans:x,q:`Картада <b>${c} см</b> жерде <b>${r} км</b> болса, картаның сандық масштабы қандай? (1 : ? — тек екінші санды жаз, мысалы 2500000)`,sol:`${r} км = ${r*100000} см. Масштаб = ${c} : ${r*100000} = 1 : ${r/c*100000}. Жауап: <b>${x}</b>.`})}}
  return out;
}

/* ---- 3. Координаттар (есептеу) ---- */
const CITIES=[["Атырау",47.11,51.92],["Балқаш",46.85,74.98],["Талдықорған",45.02,78.37],["Арқалық",50.25,66.92],["Астана",51.13,71.43],["Алматы",43.24,76.89],["Ақтау",43.65,51.15],["Орал",51.23,51.37],["Өскемен",49.95,82.61],["Қызылорда",44.85,65.51],["Павлодар",52.29,76.95],["Қостанай",53.21,63.63],["Ақтөбе",50.28,57.21],["Шымкент",42.32,69.59],["Семей",50.43,80.26],["Петропавл",54.87,69.15]];
const WORLD=[["Килиманджаро жанартауы",-3.1,37.4,3],["Мехико қаласы",19.4,-99.1,2],["Канберра қаласы",-35.3,149.1,2],["Бразилиа қаласы",-15.8,-47.9,2],["Котопахи жанартауы",-0.7,-78.4,2],["Камерун жанартауы",4.2,9.2,2.5],["Каир қаласы",30.0,31.2,2],["Токио қаласы",35.7,139.7,2]];
const sgn=(v,p,n)=>Math.abs(v).toFixed(1)+"° "+(v>=0?p:n);
function coordItems(){
  const kz=shuffle(CITIES).slice(0,4).map(c=>({kind:"coord",lat:c[1],lon:c[2],tol:1.5,q:`Градус торы бойынша <b>${c[0]}</b> қаласының географиялық координаттарын анықта (1–2° дәлдікпен).`,sol:`${c[0]}: ≈ <b>${c[1].toFixed(1)}° с.е., ${c[2].toFixed(1)}° ш.б.</b>`}));
  const wd=shuffle(WORLD).slice(0,4).map(c=>({kind:"coord",lat:c[1],lon:c[2],tol:c[3],q:`<b>${c[0]}</b> координаттарын анықта. (Оңтүстік ендік пен батыс бойлыққа минус таңбасын қой, мысалы: −15 және −48.)`,sol:`${c[0]}: ≈ <b>${sgn(c[1],"с.е.","о.е.")}, ${sgn(c[2],"ш.б.","б.б.")}</b> (сандармен: ${c[1].toFixed(1)}; ${c[2].toFixed(1)})`}));
  return kz.concat(wd);
}
/* ---- 4. Координат бойынша картадан тап ---- */
function findItems(){
  return shuffle(CITIES).slice(0,6).map(c=>{const la=Math.round(c[1]),lo=Math.round(c[2]);return{kind:"click",lat:la,lon:lo,city:c[0],q:`Картадан <b>${la}° с.е., ${lo}° ш.б.</b> нүктесін тап (түрт). Бұл нүкте <b>${c[0]}</b> қаласына жақын.`,sol:`Дұрыс орын қызыл белгімен көрсетілді: ${la}° с.е., ${lo}° ш.б.`}});
}
function drawFind(inp,q,done){
  const M=MAPS.kz,X=lon=>(lon-45)*6.6,Y=lat=>(56-lat)*10;
  let g="";for(let lo=45;lo<=90;lo+=5)g+=`<path d="M${X(lo)},0V${Y(39.5)}" stroke="#7a8" stroke-width=".3"/><text x="${X(lo)+.5}" y="6" font-size="4" fill="#355">${lo}°</text>`;
  for(let la=40;la<=55;la+=5)g+=`<path d="M0,${Y(la)}H290" stroke="#7a8" stroke-width=".3"/><text x="1" y="${Y(la)-.8}" font-size="4" fill="#355">${la}°</text>`;
  if(q.ref)g=M.lakes.map(l=>`<path d="${l.d}" fill="#7fc4ec" stroke="#2a7fb5" stroke-width=".3"/>`).join("")+M.rivers.map(r=>`<path d="${r.d}" fill="none" stroke="#2a7fb5" stroke-width=".7"/>`).join("")+M.cities.map(c=>`<circle cx="${c.x}" cy="${c.y}" r="1.4" fill="#d33"/><text x="${c.x+2}" y="${c.y+1}" font-size="3.6" fill="#333">${c.id}</text>`).join("");
  inp.innerHTML=`<svg id="fsv" viewBox="${M.vb}" style="width:100%;display:block;background:#bfe0f4;border-radius:12px">${M.neigh.map(d=>`<path d="${d}" fill="#e3e3e3" stroke="#aaa" stroke-width=".3"/>`).join("")}${M.regions.map(r=>`<path d="${r.d}" fill="#f4efe0" stroke="#999" stroke-width=".3"/>`).join("")}${g}<g id="fm"></g></svg><p class="mut">Нүктені түртіп таңда.</p>`;
  const svg=$("#fsv");let lock=false;
  svg.onclick=ev=>{if(lock)return;lock=true;const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;const c=p.matrixTransform(svg.getScreenCTM().inverse());
    const lo=c.x/6.6+45,la=56-c.y/10,ok=Math.hypot(lo-q.lon,(la-q.lat)*1.1)<=(q.tol||2.2);
    $("#fm").innerHTML=`<circle cx="${c.x}" cy="${c.y}" r="2.5" fill="${ok?"#3cb371":"#d33"}"/><circle cx="${X(q.lon)}" cy="${Y(q.lat)}" r="3" fill="none" stroke="#d33" stroke-width="1"/>`;
    done(ok,q.sol+" Сен көрсеткен нүкте: ≈ "+la.toFixed(1)+"° с.е., "+lo.toFixed(1)+"° ш.б.")}
}
/* ---- 5. Сағаттық белдеулер ---- */
const ZONES=[["Астана",5],["Алматы",5],["Лондон",0],["Париж",1],["Берлин",1],["Мәскеу",3],["Стамбул",3],["Дубай",4],["Ташкент",5],["Пекин",8],["Токио",9],["Сидней",10],["Нью-Йорк",-5],["Чикаго",-6],["Лос-Анджелес",-8]];
const bz=n=>n===0?"0":(n>0?"+"+n:""+n);
function zoneItems(){
  const out=[];
  for(let i=0;i<8;i++){const t=i%4;
    if(t===0||t===1){let A=pick(ZONES),B=pick(ZONES.filter(z=>z[1]!==A[1]));const h0=rnd(6,22),m0=pick([0,15,30,45]),t0=h0*60+m0,d=B[1]-A[1];
      out.push({kind:"time",ans:t0+d*60,q:`${A[0]}да (UTC${bz(A[1])}) жергілікті уақыт <b>${hhmm(t0)}</b>. ${B[0]}да (UTC${bz(B[1])}) сағат неше болады?`,sol:`Белдеулер айырмасы: ${B[1]} − (${A[1]}) = ${d} сағ. ${hhmm(t0)} ${d>=0?"+":"−"} ${Math.abs(d)} сағ = <b>${hhmm(t0+d*60)}</b>.`})}
    else if(t===2){let A=pick(ZONES),B=pick(ZONES.filter(z=>z[1]!==A[1]));const dur=rnd(2,9),h0=rnd(6,22),m0=pick([0,10,20,30,40,50]),t0=h0*60+m0,d=B[1]-A[1];
      out.push({kind:"time",ans:t0+dur*60+d*60,q:`Ұшақ ${A[0]}дан (UTC${bz(A[1])}) жергілікті уақыт бойынша <b>${hhmm(t0)}</b> ұшты, ұшу ұзақтығы <b>${dur} сағат</b>. ${B[0]}да (UTC${bz(B[1])}) қонғанда жергілікті сағат неше болады?`,sol:`Жергілікті ұшу уақыты ${hhmm(t0)} + ${dur} сағ = ${hhmm(t0+dur*60)} (${A[0]} уақытымен). Белдеу айырмасы ${d} сағ → <b>${hhmm(t0+dur*60+d*60)}</b>.`})}
    else{const lon=pick([15,30,45,60,75,90,105,120,135]),lo2=lon+rnd(-5,5);const bn=Math.round(lo2/15);
      out.push({kind:"num",unit:"белдеу №",ans:bn,tol:0,q:`Нүктенің бойлығы <b>${lo2}° ш.б.</b> Ол қай сағаттық белдеуде орналасқан? (нөмірін жаз; белдеу 15°, нөлдік белдеу 7°30′ б.б. мен 7°30′ ш.б. аралығында)`,sol:`${lo2} : 15 = ${(lo2/15).toFixed(1)} ≈ <b>${bn}</b>-белдеу.`})}}
  return out;
}

/* ---- 6. Кен орындарын картаға түсіру (§28) ---- */
const DEPOSITS=[["Қарағанды алабы","көмір",49.8,73.1,"Қарағанды облысы"],["Екібастұз алабы","көмір",51.7,75.3,"Павлодар облысы"],["Қашаған","мұнай",46.2,51.3,"Атырау облысы (Каспий теңізі)"],["Теңіз","мұнай",46.2,53.4,"Атырау облысы"],["Құмкөл","мұнай",46.0,65.3,"Қызылорда облысы"],["Қарашығанақ","газ",51.3,53.2,"Батыс Қазақстан облысы"],["Жаңажол","газ",48.8,57.2,"Ақтөбе облысы"],["Қашар","темір кені",52.9,63.1,"Қостанай облысы"],["Соколов-Сарыбай","темір кені",52.9,63.4,"Қостанай облысы"],["Жезді","марганец (түсті металл)",47.8,67.7,"Ұлытау облысы"],["Қоңырат","мыс",47.4,75.0,"Қарағанды облысы"],["Ащысай","полиметалл кені",43.6,69.0,"Түркістан облысы"],["Васильков (Алтынтау)","алтын",53.0,70.4,"Ақмола облысы"]];
function depositItems(){
  return shuffle(DEPOSITS).slice(0,10).map(d=>({kind:"click",ref:true,tol:3,lat:d[2],lon:d[3],q:`Картадан <b>${d[0]}</b> кен орнын (${d[1]}) тап және түрт.`,sol:`<b>${d[0]}</b> — ${d[1]}, ${d[4]}.`}));
}
