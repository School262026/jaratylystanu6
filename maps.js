/* Контурлы карта: оқу режимі және тест. Деректер: data-maps.js (window.MAPS) */
const MAPDEF={
  kz:{title:"Қазақстан",sets:{
    regions:{t:"Облыстар",i:"🗺️",ask:"облысты"},
    cities:{t:"Қалалар",i:"🏙️",ask:"қаланы"},
    rivers:{t:"Өзендер",i:"🌊",ask:"өзенді"},
    lakes:{t:"Көлдер мен теңіздер",i:"💧",ask:"көлді (теңізді)"},
    mountains:{t:"Таулар",i:"⛰️",ask:"тауды"}}},
  world:{title:"Дүние жүзі",sets:{
    conts:{t:"Материктер",i:"🌍",ask:"материкті"},
    oceans:{t:"Мұхиттар",i:"🌊",ask:"мұхитты"}}}};

function mapsMenu(){
  let h=`<a href="#/">← Басты бет</a><h1>🗺️ Контурлы карта</h1><p class="mut">Алдымен «Оқу» режимінде нысандарды үйрен, сосын «Тест» бер. Нәтиже бағаға жазылады.</p>`;
  Object.entries(MAPDEF).forEach(([a,d])=>{h+=`<h2>${d.title}</h2>`;
    Object.entries(d.sets).forEach(([s,x])=>{h+=`<div class="card" style="display:flex;gap:10px;align-items:center;justify-content:space-between"><span style="font-size:17px"><b>${x.i} ${x.t}</b></span><span style="display:flex;gap:8px"><a class="btn alt" style="width:auto;padding:8px 14px" href="#/maps/${a}/${s}/learn">📖 Оқу</a><a class="btn" style="width:auto;padding:8px 14px" href="#/maps/${a}/${s}/quiz">📝 Тест</a></span></div>`})});
  h+=`<h2>📐 География практикумы</h2>`+GEO.map(x=>`<a class="card" style="display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit" href="#/geo/${x.id}"><span style="font-size:26px">${x.i}</span><span><b>${x.t}</b><br><span class="mut">${x.p}: есептер мен тапсырмалар</span></span></a>`).join("");
  app.innerHTML=h;
}

function mapItems(area,set){
  const M=MAPS[area];
  if(area==="kz"){
    if(set==="regions")return M.regions.map(r=>({id:r.id,kind:"poly",d:[r.d]}));
    if(set==="cities")return M.cities.map(c=>({id:c.id,kind:"point",x:c.x,y:c.y,R:11}));
    if(set==="rivers")return M.rivers.map(r=>({id:r.id,kind:"line",d:[r.d]}));
    if(set==="mountains")return M.mountains.map(c=>({id:c.id,kind:"point",x:c.x,y:c.y,R:13}));
    if(set==="lakes"){const L={};M.lakes.forEach(l=>{const id=l.id.startsWith("Арал")?"Арал теңізі":l.id;(L[id]=L[id]||{id,kind:"poly",d:[],x:l.x,y:l.y,R:9}).d.push(l.d)});
      const a=Object.values(L);a.forEach(o=>{if(o.id==="Арал теңізі")o.R=12});
      M.seas.forEach(s=>a.push({id:s.id,kind:"point",x:s.x,y:s.y,R:26}));return a}}
  if(area==="world"){
    if(set==="conts")return M.conts.map(c=>({id:c.id,kind:"poly",d:[c.d]}));
    if(set==="oceans")return M.oceans.map(c=>({id:c.id,kind:"poly",d:[c.d],ocean:true}))}
  return[];
}

function mapsPage(h){
  const area=h[1],set=h[2],mode=h[3];
  if(!area||!MAPDEF[area]||!MAPDEF[area].sets[set])return mapsMenu();
  const D=MAPDEF[area],S=D.sets[set],M=MAPS[area],items=mapItems(area,set),vb=M.vb,learn=mode!=="quiz";
  const back=`<a href="#/maps">← Карталар</a>`;
  /* ---- SVG ---- */
  let svg=`<svg id="msvg" viewBox="${vb}" style="width:100%;display:block;background:#bfe0f4;border-radius:12px;touch-action:manipulation">`;
  const strokeBase=area==="kz"?".4":".2";
  if(area==="kz"){
    M.neigh.forEach(d=>svg+=`<path d="${d}" fill="#e3e3e3" stroke="#aaa" stroke-width=".3"/>`);
    if(set==="regions"){M.regions.forEach((r,i)=>svg+=`<path class="mi" data-id="${esc(r.id)}" d="${r.d}" fill-rule="evenodd" fill="${["#f6d5a8","#d9e8b0","#f0c9d0","#c9dcf0","#e6d2f0","#f3e7a3"][i%6]}" stroke="#444" stroke-width="${strokeBase}"/>`)}
    else M.regions.forEach(r=>svg+=`<path d="${r.d}" fill="#f4efe0" stroke="#999" stroke-width=".3"/>`);
    if(set!=="lakes")M.lakes.forEach(l=>svg+=`<path d="${l.d}" fill="#7fc4ec" stroke="#2a7fb5" stroke-width=".3"/>`);
    if(set==="rivers")items.forEach(it=>{svg+=`<path class="mi" data-id="${esc(it.id)}" d="${it.d[0]}" fill="none" stroke="#2a7fb5" stroke-width="1"/><path class="hit" data-id="${esc(it.id)}" d="${it.d[0]}" fill="none" stroke="transparent" stroke-width="12"/>`});
    if(set==="lakes")items.forEach(it=>{if(it.kind==="poly")it.d.forEach(d=>svg+=`<path class="mi" fill-rule="evenodd" data-id="${esc(it.id)}" d="${d}" fill="#7fc4ec" stroke="#2a7fb5" stroke-width=".4"/>`)});
    if(set==="cities")items.forEach(it=>svg+=`<circle class="mi" data-id="${esc(it.id)}" cx="${it.x}" cy="${it.y}" r="1.8" fill="#d33" stroke="#fff" stroke-width=".4"/>`);
    if(set==="mountains")items.forEach(it=>svg+=`<path class="mi" data-id="${esc(it.id)}" d="M${it.x-3},${it.y+2.5}L${it.x},${it.y-3}L${it.x+3},${it.y+2.5}Z" fill="#8a6a3a" stroke="#fff" stroke-width=".4"/>`);
  } else {
    M.oceans.forEach((o,i)=>svg+=`<path d="${o.d}" fill="#a9d6f0"/>`);
    if(set==="oceans")M.oceans.forEach(o=>svg+=`<path class="mi" data-id="${esc(o.id)}" d="${o.d}" fill="transparent"/>`);
    M.conts.forEach((c,i)=>svg+=`<path class="${set==="conts"?"mi":""}" data-id="${esc(c.id)}" d="${c.d}" fill-rule="evenodd" fill="${["#f6d5a8","#d9e8b0","#f0c9d0","#c9dcf0","#e6d2f0","#f3e7a3"][i%6]}" stroke="#555" stroke-width=".2"/>`);
  }
  svg+=`<g id="lab"></g><g id="mk"></g></svg>`;
  const zoomBar=`<div style="display:flex;gap:8px;margin:8px 0"><button class="btn alt" id="zi">🔍＋</button><button class="btn alt" id="zo">🔍－</button></div>`;
  app.innerHTML=back+`<h1>${S.i} ${D.title}: ${S.t}</h1><div id="mbar"></div>`+zoomBar+`<div id="mwrap" style="overflow:auto;border-radius:12px;max-height:75vh"><div id="mbox" style="width:100%">${svg}</div></div><div id="mres"></div>`;
  let zoom=1;const box=$("#mbox");
  $("#zi").onclick=()=>{zoom=Math.min(4,zoom+.5);box.style.width=zoom*100+"%"};
  $("#zo").onclick=()=>{zoom=Math.max(1,zoom-.5);box.style.width=zoom*100+"%"};
  const svgEl=$("#msvg");
  const els=id=>[...svgEl.querySelectorAll(`[data-id="${CSS.escape(id)}"]`)];
  const pt=ev=>{const p=svgEl.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;return p.matrixTransform(svgEl.getScreenCTM().inverse())};
  const dist=(p,x,y)=>Math.hypot(p.x-x,p.y-y);
  const hit=(it,p)=>{
    if(it.kind==="point")return dist(p,it.x,it.y)<=it.R;
    const es=els(it.id);
    if(it.kind==="line")return es.some(e=>e.classList.contains("hit")&&e.isPointInStroke(p));
    const inside=es.some(e=>e.isPointInFill&&e.isPointInFill(p));
    return inside||(it.x!=null&&dist(p,it.x,it.y)<=it.R)};
  const contHit=p=>area==="world"&&[...svgEl.querySelectorAll("path[data-id]")].some(e=>!e.classList.contains("mi")&&e.isPointInFill(p));
  const which=p=>{
    if(set==="oceans"){if(contHit(p))return null;const order=["Солтүстік Мұзды мұхит","Оңтүстік мұхит","Атлант мұхиты","Үнді мұхиты","Тынық мұхит"];
      return order.map(n=>items.find(i=>i.id===n)).find(it=>hit(it,p))||null}
    const cand=items.filter(it=>hit(it,p));
    if(!cand.length)return null;
    if(cand.length>1&&cand[0].kind==="point"){cand.sort((a,b)=>dist(p,a.x,a.y)-dist(p,b.x,b.y))}
    return cand[0]};
  const mk=$("#mk"),lab=$("#lab");
  const mark=(p,col)=>{mk.insertAdjacentHTML("beforeend",`<circle cx="${p.x}" cy="${p.y}" r="3" fill="none" stroke="${col}" stroke-width="1.2"/>`)};
  const paint=(it,col)=>{els(it.id).forEach(e=>{if(it.kind==="line")e.setAttribute("stroke",col);else if(it.kind==="point")e.setAttribute("fill",col);else if(!e.classList.contains("hit")){e.setAttribute("fill",col)}});
    if(it.kind==="point")mark({x:it.x,y:it.y},col)};
  const center=it=>{if(it.kind==="point")return{x:it.x,y:it.y+(set==="cities"?-3:-5)};
    const e=els(it.id).filter(x=>!x.classList.contains("hit"))[0];if(!e)return null;const b=e.getBBox();return{x:b.x+b.width/2,y:b.y+b.height/2}};
  const short=n=>n.replace(" облысы","");
  const fs=area==="kz"?4:4;
  /* ---- OҚУ ---- */
  if(learn){
    $("#mbar").innerHTML=`<div class="card" id="nm">Нысанды түртсең, аты шығады. Аттар картада да жазылған.</div>`;
    setTimeout(()=>{items.forEach(it=>{let c=center(it);if(set==="oceans"){const ol=MAPS.world.olabel[it.id];c=ol}if(!c)return;
      lab.insertAdjacentHTML("beforeend",`<text x="${c.x}" y="${c.y}" font-size="${area==="world"?6:fs}" text-anchor="middle" font-weight="700" fill="#1d2b22" stroke="#fff" stroke-width=".9" paint-order="stroke">${esc(short(it.id))}</text>`)})},30);
    svgEl.onclick=ev=>{const it=which(pt(ev));$("#nm").innerHTML=it?`<b>${esc(it.id)}</b>`:"Бос жер. Басқа жерді түр.";mk.innerHTML="";if(it){const p=center(it)||pt(ev);mark(p,"#f1a62b")}};
    return;
  }
  /* ---- ТЕСТ ---- */
  const Q=shuffle(items).slice(0,10);let i=0,score=0,lock=false,t0=Date.now();
  const ask=()=>{lock=false;mk.innerHTML="";lab.innerHTML="";
    $("#mbar").innerHTML=`<div class="bar"><i style="width:${i/Q.length*100}%"></i></div><p class="mut">${i+1} / ${Q.length} · Дұрыс: ${score}</p><div class="card"><b>Картадан көрсет: ${esc(short(Q[i].id))}</b></div><div id="fb"></div>`};
  const finish=async()=>{const max=Q.length,pct=Math.round(score/max*100),g=grade(pct);
    const rec={id:uid(),name:user().name,cls:user().cls,type:"map",para:0,score,max,pct,grade:g,dur:Math.round((Date.now()-t0)/1000),ts:Date.now(),status:"auto",mapset:area+"/"+set};
    const ok=await submit(rec);
    $("#mbar").innerHTML="";$("#mwrap").style.display="none";$("#mres").innerHTML=`<div class="card"><div class="big">${pct}%</div><p style="text-align:center"><b>Баға: ${g}</b> · ${level(pct)}<br>${score} / ${max} дұрыс</p></div><p class="mut">${ok?"✅ Нәтиже мұғалімге жіберілді.":"⚠️ Нәтиже осы телефонда сақталды."}</p><button class="btn" onclick="location.reload()">🔁 Қайта тапсыру</button><a class="btn alt" style="margin-top:8px" href="#/maps/${area}/${set}/learn">📖 Оқу режимі</a><a class="btn alt" style="margin-top:8px" href="#/maps">← Карталар</a>`};
  ask();
  svgEl.onclick=ev=>{if(lock)return;lock=true;const p=pt(ev),it=which(p),ok=!!it&&it.id===Q[i].id;
    if(ok){score++;paint(Q[i],"#3cb371")}
    else{paint(Q[i],"#3cb371");if(it&&it.kind!=="point"&&it.kind!=="line"&&it!==Q[i])paint(it,"#e57373");else mark(p,"#d33")}
    $("#fb").innerHTML=`<div class="card">${ok?"✅ Дұрыс!":"❌ Қате."+(it?" Сен көрсеткенің: <b>"+esc(short(it.id))+"</b>.":" Сен бос жерді түрттің.")} Дұрыс жауап жасыл түспен көрсетілді.</div><button class="btn" id="nx">${i+1<Q.length?"Келесі →":"Аяқтау"}</button>`;
    /* келесі сұраққа картаны қайта салмай, түстерді тазалау */
    $("#nx").onclick=()=>{i++;if(i>=Q.length)return finish();resetColors();ask()};
  };
  const base={};els_all();
  function els_all(){svgEl.querySelectorAll(".mi").forEach((e,k)=>{base[k]={fill:e.getAttribute("fill"),stroke:e.getAttribute("stroke")}})}
  function resetColors(){svgEl.querySelectorAll(".mi").forEach((e,k)=>{if(base[k].fill!=null)e.setAttribute("fill",base[k].fill);if(base[k].stroke!=null)e.setAttribute("stroke",base[k].stroke)})}
}
