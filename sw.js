/* DigiLedger offline support.
   When online, the app's own files are always checked with GitHub first (cache: "no-cache"), so a new
   version shows on the next open instead of after GitHub Pages' ~10-minute browser cache.
   When offline, the last saved copy is used. */
const C="digiledger-v2",F=["./","index.html","manifest.webmanifest","icon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const own=new URL(req.url).origin===self.location.origin;
  /* own files: revalidate with the server; other files (fonts, libraries): normal browser caching */
  const net=own?fetch(req,{cache:"no-cache"}):fetch(req);
  e.respondWith(net.then(r=>{if(r.ok||r.type==="opaque"){const cp=r.clone();caches.open(C).then(c=>c.put(req,cp)).catch(()=>{})}return r})
    .catch(()=>caches.match(req,{ignoreSearch:req.mode==="navigate"}).then(m=>m||(req.mode==="navigate"?caches.match("./"):undefined))))});
