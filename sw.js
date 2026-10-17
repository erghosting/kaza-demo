const CACHE='kaza-investor-demo-v9-portal-layout-20261016';
const ROOT=new URL('./',self.location.href).href;
const INDEX=ROOT+'index.html';
const LIMIT=80;
async function store(request,response){try{const cache=await caches.open(CACHE);await cache.put(request,response);const keys=await cache.keys();for(const key of keys.slice(0,Math.max(0,keys.length-LIMIT)))if(key.url!==INDEX)await cache.delete(key);}catch{}}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fetch(INDEX,{cache:'reload'});if(!response.ok)throw Error('Demo unavailable');
 const html=await response.clone().text();await store(INDEX,response);
 const assets=[...html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g)].map(m=>new URL(m[1],ROOT).href);
 await Promise.all([ROOT+'manifest.webmanifest',ROOT+'icons/kaza-192.png',ROOT+'icons/kaza-512.png',...assets].map(async url=>{const result=await fetch(url);if(result.ok)await store(url,result);}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('kaza-investor-demo-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 const key=event.request.mode==='navigate'?INDEX:event.request;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok)event.waitUntil(store(key,response.clone()));return response;}).catch(async()=>await caches.match(key)||Response.error()));
});
