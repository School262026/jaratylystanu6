/* Лабораторияның кеңейтілген тәжірибелері (§19–22, §25): атом, молекула, зат күйі, жіктеу */
LABS.push(
 {id:"mol",i:"⚛️",t:"Атом және молекула конструкторы",p:"§19–20"},
 {id:"state",i:"🌡️",t:"Бөлшектердің қозғалысы: заттың күйі",p:"§19, §21"},
 {id:"simp",i:"🔬",t:"Қарапайым және күрделі заттар",p:"§20"},
 {id:"org",i:"🔥",t:"Органикалық және бейорганикалық заттар",p:"§22"},
 {id:"mat",i:"🧵",t:"Табиғи және жасанды материалдар",p:"§25"});
Object.assign(LABFN,{mol:labMol,state:labState,simp:labSimp,org:labOrg,mat:labMat});

/* ===== Молекула конструкторы ===== */
function labMol(b,L){
  const AT={H:{n:"Сутегі",c:"#fff",r:11,st:"#555"},O:{n:"Оттек",c:"#e53935",r:16},C:{n:"Көміртегі",c:"#444",r:16},N:{n:"Азот",c:"#3f51b5",r:15}};
  const MOLS=[["H₂O","Су",{H:2,O:1}],["CO₂","Көмірқышқыл газы",{C:1,O:2}],["O₂","Оттек",{O:2}],["H₂","Сутегі",{H:2}],["N₂","Азот",{N:2}],["CH₄","Метан",{C:1,H:4}],["NH₃","Аммиак",{N:1,H:3}]];
  const cnt={H:0,O:0,C:0,N:0};let tgt=null,done=new Set(),qs=false;
  b.innerHTML=`<div class="card">Атомдарды қосып, молекула жина. «Тапсырма» түймесі жасайтын молекуланың атын береді. Атомдар химиялық байланыспен біріккенде молекула түзіледі.</div>
  <div class="grid">${Object.keys(AT).map(k=>`<div class="card" style="text-align:center;margin:4px 0"><b style="font-size:20px">${k}</b><br><span class="mut">${AT[k].n}</span><div style="display:flex;gap:6px;justify-content:center;margin-top:6px"><button class="btn alt" data-m="${k}" style="width:42px;padding:6px">−</button><b id="c${k}" style="min-width:20px;font-size:20px">0</b><button class="btn alt" data-p="${k}" style="width:42px;padding:6px">＋</button></div></div>`).join("")}</div>
  <svg id="ms" viewBox="0 0 300 150" style="width:100%;background:#eef7fb;border-radius:12px;margin:8px 0"></svg>
  <div id="mn" class="card"><b>Молекула:</b> <span id="mt">атом қос</span></div>
  <div class="grid"><button class="btn" id="mk">🎯 Тапсырма</button><button class="btn alt" id="mc">♻️ Тазалау</button></div><div id="tk" class="card" style="display:none"></div><div id="end"></div>`;
  const $$=s=>b.querySelector(s);
  const total=()=>Object.values(cnt).reduce((a,x)=>a+x,0);
  const match=()=>MOLS.find(m=>Object.keys(AT).every(k=>(m[2][k]||0)===cnt[k]));
  function draw(){
    const atoms=[];Object.keys(cnt).forEach(k=>{for(let i=0;i<cnt[k];i++)atoms.push(k)});
    const n=atoms.length;let g="";const cx=150,cy=75;
    if(n===1)g=atom(atoms[0],cx,cy);
    else if(n>1){const cent=atoms.includes("C")?"C":atoms.includes("N")&&n>2?"N":atoms.includes("O")&&n>2?"O":null;
      if(!cent||n===2){const xs=atoms.map((a,i)=>cx+(i-(n-1)/2)*50);g=xs.slice(1).map((x,i)=>`<line x1="${xs[i]}" y1="${cy}" x2="${x}" y2="${cy}" stroke="#333" stroke-width="4"/>`).join("")+atoms.map((a,i)=>atom(a,xs[i],cy)).join("")}
      else{const rest=atoms.slice();rest.splice(rest.indexOf(cent),1);const R=48;
        const pos=rest.map((a,i)=>{const ang=cent==="O"&&rest.length===2?Math.PI/2+(i?-1:1)*0.9+Math.PI:rest.length===2?(i?0:Math.PI):(i/rest.length)*2*Math.PI-Math.PI/2;return[cx+R*Math.cos(ang),cy+R*Math.sin(ang)*(rest.length>2?.85:1)]});
        g=pos.map(p=>`<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#333" stroke-width="4"/>`).join("")+atom(cent,cx,cy)+pos.map((p,i)=>atom(rest[i],p[0],p[1])).join("")}}
    $$("#ms").innerHTML=g;
    Object.keys(cnt).forEach(k=>$$("#c"+k).textContent=cnt[k]);
    const m=match();$$("#mt").innerHTML=n===0?"атом қос":m?`<b>${m[0]}</b> — ${m[1]} молекуласы ✅`:"Бұл таныс молекула емес (қайта жина)";
    if(m){if(tgt&&m[0]===tgt[0]){$$("#tk").innerHTML="🎉 Дұрыс! "+tgt[1]+" молекуласы жиналды ("+tgt[0]+")."}done.add(m[0]);check()}
  }
  const atom=(k,x,y)=>`<circle cx="${x}" cy="${y}" r="${AT[k].r}" fill="${AT[k].c}" stroke="${AT[k].st||"#222"}" stroke-width="2"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="14" font-weight="700" fill="${k==="H"?"#222":"#fff"}">${k}</text>`;
  b.querySelectorAll("[data-p]").forEach(e=>e.onclick=()=>{if(total()<8)cnt[e.dataset.p]++;draw()});
  b.querySelectorAll("[data-m]").forEach(e=>e.onclick=()=>{if(cnt[e.dataset.m]>0)cnt[e.dataset.m]--;draw()});
  $$("#mc").onclick=()=>{Object.keys(cnt).forEach(k=>cnt[k]=0);draw()};
  $$("#mk").onclick=()=>{tgt=pick(MOLS);$$("#tk").style.display="";$$("#tk").innerHTML="🎯 Жина: <b>"+tgt[1]+"</b> молекуласы. Формуласы: <b>"+tgt[0]+"</b>"};
  function check(){if(!qs&&done.size>=4){qs=true;$$("#end").innerHTML=goQuiz();$$("#gq").onclick=()=>labQuiz(b,L,Q_MOL)}}
  $$("#end").innerHTML=`<p class="mut">Тестке өту үшін кемінде 4 түрлі молекула жина.</p>`;draw();
}
const Q_MOL=[
 {q:"Су молекуласы қандай атомдардан тұрады?",o:["2 сутегі және 1 оттек","1 сутегі және 2 оттек","2 оттек","1 көміртегі және 2 оттек"],a:0,why:"H₂O: сутегінің екі атомы және оттектің бір атомы."},
 {q:"Көмірқышқыл газының формуласы:",o:["H₂O","CO₂","O₂","CH₄"],a:1,why:"CO₂: бір көміртегі және екі оттек."},
 {q:"Оттек молекуласында неше атом бар?",o:["1","2","3","4"],a:1,why:"O₂: оттектің екі атомы."},
 {q:"Атом дегеніміз:",o:["Молекуланың ұсақ бөлшегі","Заттың ең үлкен бөлігі","Сұйықтық","Ерітінді"],a:0,why:"Атом — молекуланың (химиялық элементтің) ең ұсақ бөлшегі."},
 {q:"Молекула атомдардан қандай байланыс арқылы түзіледі?",o:["Химиялық байланыс","Магниттік","Жылулық","Дыбыстық"],a:0,why:"Атомдар химиялық байланыс арқылы бірігеді."}];

/* ===== Бөлшектердің қозғалысы ===== */
function labState(b,L){
  const SUB=[["Су",0,100],["Оттек",-218,-183],["Темір",1538,2750],["Мыс",1085,2567],["Сынап",-39,357]];
  let si=0,T=20,tried={},qs=false,raf=0;
  b.innerHTML=`<div class="card">Заттың температурасын өзгерт. Бөлшектердің қозғалысына және заттың күйіне назар аудар. Қыздырғанда молекулалардың қозғалыс жылдамдығы артады.</div>
  <div id="sr" style="display:flex;gap:8px;flex-wrap:wrap">${SUB.map((s,i)=>`<button class="mt ${i?"":"sel"}" style="width:auto" data-i="${i}">${s[0]}</button>`).join("")}</div>
  <label style="display:block;margin-top:8px">Температура: <b id="tv">20</b> °C</label><input type="range" id="ts" min="-260" max="3000" value="20">
  <div class="card" id="inf"></div><canvas id="cv" width="300" height="180" style="width:100%;background:#fff;border:1px solid var(--line);border-radius:12px"></canvas><div id="end"></div>`;
  const $$=s=>b.querySelector(s),cv=$$("#cv"),cx=cv.getContext("2d");
  const P=[];for(let i=0;i<36;i++)P.push({x:20+(i%6)*22,y:20+Math.floor(i/6)*22,vx:Math.random()-.5,vy:Math.random()-.5,hx:20+(i%6)*22,hy:20+Math.floor(i/6)*22});
  const state=()=>{const s=SUB[si];return T<s[1]?"қатты":T<s[2]?"сұйық":"газ"};
  const names={қатты:"Қатты күй: бөлшектер өз орнында тербеледі",сұйық:"Сұйық күй: бөлшектер жақын, бірақ ағып қозғалады",газ:"Газ күйі: бөлшектер ерікті әрі жылдам қозғалады"};
  function info(){const s=SUB[si];$$("#tv").textContent=T;$$("#inf").innerHTML=`<b>${s[0]}</b>: балқу ${s[1]} °C, қайнау ${s[2]} °C<br>Қазір: <b>${state()}</b>. <span class="mut">${names[state()]}</span>`;tried[s[0]+state()]=1;if(!qs&&Object.keys(tried).length>=6){qs=true;$$("#end").innerHTML=goQuiz();$$("#gq").onclick=()=>{cancelAnimationFrame(raf);labQuiz(b,L,Q_STATE)}}}
  function frame(){if(!document.body.contains(cv)){cancelAnimationFrame(raf);return}
    cx.clearRect(0,0,300,180);const st=state(),sp=Math.max(.3,Math.min(4,Math.sqrt(Math.max(T+273,10))/9));
    P.forEach(p=>{if(st==="қатты"){p.x=p.hx+(Math.random()-.5)*(1+sp);p.y=p.hy+(Math.random()-.5)*(1+sp)}
      else{const f=st==="сұйық"?1.2:3;p.vx+=(Math.random()-.5)*.4;p.vy+=(Math.random()-.5)*.4;const m=Math.hypot(p.vx,p.vy)||1,v=sp*f;p.vx=p.vx/m*v;p.vy=p.vy/m*v;p.x+=p.vx;p.y+=p.vy;
        const H=st==="сұйық"?180:180,top=st==="сұйық"?70:0;if(p.x<6||p.x>294)p.vx*=-1;if(p.y<top+6||p.y>H-6)p.vy*=-1;p.x=Math.max(6,Math.min(294,p.x));p.y=Math.max(top+6,Math.min(H-6,p.y))}
      cx.beginPath();cx.arc(p.x,p.y,6,0,7);cx.fillStyle=st==="қатты"?"#4a90d9":st==="сұйық"?"#26a69a":"#f1a62b";cx.fill()});
    raf=requestAnimationFrame(frame)}
  b.querySelectorAll("#sr .mt").forEach(e=>e.onclick=()=>{si=+e.dataset.i;b.querySelectorAll("#sr .mt").forEach(x=>x.classList.remove("sel"));e.classList.add("sel");
    P.forEach((p,i)=>{p.x=p.hx;p.y=p.hy});info()});
  $$("#ts").oninput=ev=>{T=+ev.target.value;info()};
  info();frame();$$("#end").innerHTML=`<p class="mut">Тестке өту үшін зат күйлерінің 6 түрлі жағдайын көр (заттар мен температураны өзгертіп).</p>`;
}
const Q_STATE=[
 {q:"Температура көтерілгенде молекулалардың қозғалыс жылдамдығы:",o:["Артады","Азаяды","Өзгермейді","Нөл болады"],a:0,why:"Қыздырғанда ішкі энергия артып, жылдамдық өседі."},
 {q:"Суды 20 °C-та қай күйде көреміз?",o:["Қатты","Сұйық","Газ","Плазма"],a:1,why:"Су 0 °C-тан 100 °C-қа дейін сұйық."},
 {q:"Темірдің қайнау температурасы (оқулықтағы 10-кесте):",o:["100 °C","2750 °C","–183 °C","357 °C"],a:1,why:"Темір 2750 °C-та қайнайды."},
 {q:"Оттек –183 °C-тан жоғарыда қандай күйде?",o:["Газ","Қатты","Сұйық","Мұз"],a:0,why:"Қайнау температурасынан (–183 °C) жоғары оттек — газ."},
 {q:"Газ күйінде бөлшектер:",o:["Өз орнында тербеледі","Еркін әрі жылдам қозғалады","Қозғалмайды","Тек төмен түседі"],a:1,why:"Газда бөлшектер арасы алыс, жылдам қозғалады."}];

/* ===== Жалпы жіктеу тәжірибесі ===== */
function sortLab(b,L,cfg){
  const cats=cfg.cats,items=shuffle(cfg.items);let i=0,ok=0,qs=false;
  b.innerHTML=`<div class="card">${cfg.intro}</div><div id="sl"></div><div id="end"></div>`;
  const $$=s=>b.querySelector(s);
  const draw=()=>{if(i>=items.length){$$("#sl").innerHTML=`<div class="card">Жіктеу аяқталды: ${ok} / ${items.length} дұрыс.</div>`;if(!qs){qs=true;$$("#end").innerHTML=goQuiz();$$("#gq").onclick=()=>labQuiz(b,L,cfg.quiz)}return}
    const it=items[i];$$("#sl").innerHTML=`<div class="bar"><i style="width:${i/items.length*100}%"></i></div><p class="mut">${i+1} / ${items.length}</p><div class="card" style="text-align:center"><div style="font-size:42px">${it.e||""}</div><b style="font-size:20px">${it.n}</b>${it.f?`<div class="mut">${it.f}</div>`:""}<div id="tst" style="margin-top:8px"></div>${cfg.test?`<button class="btn alt" id="tb" style="margin-top:8px">${cfg.test.btn}</button>`:""}</div>${cats.map((c,k)=>`<button class="opt" data-k="${k}">${c}</button>`).join("")}<div id="fb"></div>`;
    if(cfg.test)$$("#tb").onclick=()=>{$$("#tst").innerHTML="<b>"+(it.r||cfg.test.def)+"</b>"};
    b.querySelectorAll(".opt").forEach(el=>el.onclick=()=>{const k=+el.dataset.k,good=k===it.c;if(good)ok++;
      b.querySelectorAll(".opt").forEach((e,j)=>{e.disabled=true;if(j===it.c)e.classList.add("ok");else if(j===k)e.classList.add("no")});
      $$("#fb").innerHTML=`<div class="card">${good?"✅ Дұрыс!":"❌ Қате."} ${it.w||""}</div><button class="btn" id="nx">Келесі →</button>`;$$("#nx").onclick=()=>{i++;draw()}})};
  draw();
}
function labSimp(b,L){sortLab(b,L,{intro:"Заттың формуласына қарап, оны қарапайым немесе күрделі затқа жатқыз. Қарапайым зат — бір түрлі атомнан, күрделі зат — әртүрлі атомдардан тұрады.",cats:["Қарапайым зат","Күрделі зат"],
 items:[{n:"Оттек",f:"O₂",c:0,w:"Тек оттек атомдарынан тұрады."},{n:"Сутегі",f:"H₂",c:0,w:"Бір түрлі атом (H)."},{n:"Темір",f:"Fe",c:0,w:"Химиялық элемент — қарапайым зат."},{n:"Күкірт",f:"S",c:0,w:"Қарапайым зат."},{n:"Азот",f:"N₂",c:0,w:"Бір түрлі атом (N)."},
  {n:"Су",f:"H₂O",c:1,w:"Сутегі мен оттек атомдарынан тұрады."},{n:"Көмірқышқыл газы",f:"CO₂",c:1,w:"Көміртегі және оттек."},{n:"Ас тұзы",f:"NaCl",c:1,w:"Натрий және хлор."},{n:"Қант (сахароза)",f:"C₁₂H₂₂O₁₁",c:1,w:"Үш түрлі атомнан тұрады: C, H, O."},{n:"Метан",f:"CH₄",c:1,w:"Көміртегі және сутегі."}],
 quiz:[{q:"Қарапайым зат қандай атомдардан тұрады?",o:["Бір түрлі","Әртүрлі","Тек металл","Тек газ"],a:0,why:"Қарапайым зат — бір элемент атомдарынан."},{q:"Қайсысы күрделі зат?",o:["Оттек","Темір","Су","Күкірт"],a:2,why:"Су — H₂O, екі түрлі атом."},{q:"Күрделі заттар басқа затқа айналғанда:",o:["Ыдырайды","Ыдырамайды","Жоғалады","Өзгермейді"],a:0,why:"Мысалы, суды 3000 °C-қа қыздырсақ, сутегі мен оттекке ыдырайды."},{q:"Қант молекуласында неше түрлі атом бар?",o:["1","2","3","5"],a:2,why:"C, H, O — үш түрлі."}]})}

function labOrg(b,L){sortLab(b,L,{intro:"⚠️ Виртуалды тәжірибе. Затты «қыздыр» (спирт шамында), не болатынын бақыла. Органикалық заттардың құрамында көміртегі болады, қыздырғанда көбіне күйеді, қараяды. Бейорганикалық заттар (құм, тұз, металл) жанбайды.",cats:["Органикалық","Бейорганикалық"],
 test:{btn:"🔥 Қыздыру",def:"Өзгеріс жоқ"},
 items:[{n:"Қант",e:"🍬",c:0,r:"Балқып, қараяды, көмірге айналады, түтін шығады",w:"Құрамында көміртегі бар."},{n:"Ағаш",e:"🪵",c:0,r:"Жанады, күл мен көмір қалады",w:"Органикалық зат."},{n:"Шам (парафин)",e:"🕯️",c:0,r:"Балқиды және жанады",w:"Көміртегі бар."},{n:"Бидай ұны",e:"🌾",c:0,r:"Қараяды, күйген иіс шығады",w:"Нәруыз және крахмалдан тұрады."},{n:"Ас тұзы",e:"🧂",c:1,r:"Жанбайды, тек қатты қыздырғанда сытырлайды",w:"NaCl — бейорганикалық."},{n:"Құм",e:"🏖️",c:1,r:"Жанбайды, өзгермейді",w:"Кремний оксиді — бейорганикалық."},{n:"Мыс сым",e:"🔌",c:1,r:"Жанбайды, бетінде қара қабыршақ пайда болады",w:"Металл — бейорганикалық."},{n:"Пластмасса",e:"🧴",c:0,r:"Жұмсарып, жанады, қара түтін шығады",w:"Пластмасса — органикалық (көміртегі бар)."}],
 quiz:[{q:"Органикалық заттардың құрамында міндетті түрде болады:",o:["Көміртегі","Темір","Алтын","Неон"],a:0,why:"Органикалық заттар — көміртегі бар қосылыстар."},{q:"Қайсысы бейорганикалық зат?",o:["Қант","Ас тұзы","Май","Нәруыз"],a:1,why:"Ас тұзы NaCl — бейорганикалық."},{q:"Тірі ағзаның маңызды органикалық заттары:",o:["Нәруыз, май, көмірсу","Құм, тас, су","Ауа, жел","Тек су"],a:0,why:"Нәруыз, май, көмірсу, нуклеин қышқылы."},{q:"Химиялық заттардың қанша бөлігі органикалық?",o:["90%-дан астамы","10%","1%","50%-дан аз"],a:0,why:"Химиялық заттардың 90%-дан астамы органикалық."}]})}

function labMat(b,L){sortLab(b,L,{intro:"Материалды табиғи немесе жасанды деп жіктеңіз. Табиғи материал табиғаттан алынады (өсімдік, жануар, жер қойнауы), жасанды материал өнеркәсіпте жасалады.",cats:["Табиғи материал","Жасанды материал"],
 items:[{n:"Ағаш",e:"🪵",c:0,w:"Өсімдіктен алынады."},{n:"Мақта",e:"☁️",c:0,w:"Өсімдік талшығы."},{n:"Жүн",e:"🐑",c:0,w:"Жануардан алынады."},{n:"Тас",e:"🪨",c:0,w:"Жер қойнауынан."},{n:"Былғары",e:"👞",c:0,w:"Жануар терісі."},{n:"Нейлон",e:"🧵",c:1,w:"1938 ж. алынған жасанды талшық."},{n:"Пластмасса",e:"🧴",c:1,w:"Полимер — жасанды материал."},{n:"Полиэтилен пакет",e:"🛍️",c:1,w:"Жасанды полимер."},{n:"Резеңке (синтетикалық)",e:"🛞",c:1,w:"Өнеркәсіпте жасалған."},{n:"Капрон",e:"🧦",c:1,w:"Жасанды талшық."}],
 quiz:[{q:"Табиғи материалға мысал:",o:["Ағаш","Пластмасса","Нейлон","Полиэтилен"],a:0,why:"Ағаш — табиғи."},{q:"Нейлон қай жылы алынды?",o:["1938","1800","1900","2000"],a:0,why:"1938 ж. АҚШ-та."},{q:"Полимерлердің кемшілігі:",o:["Табиғатта ыдырамайды","Тым жеңіл емес","Қымбат емес","Мықты емес"],a:0,why:"Пластмасса табиғатта ыдырамайды, ластайды."},{q:"Жасанды материал дегеніміз:",o:["Өнеркәсіпте жасалатын","Тек тастан","Тек теріден","Тек судан"],a:0,why:"Өнеркәсіпте жасалады."}]})}
