const C="jt6-v9";
const F=["./","index.html","app.js","style.css","data-toc.js","data-h.js","data-p1.js","data-b1.js","data-b2.js","data-b3.js","data-b4.js","data-b5.js","data-b6.js","data-b7.js","data-b8.js","data-b9.js","data-b10.js","manifest.json","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
