(()=>{
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{
    const toast=document.getElementById('toast');
    const show=txt=>{if(!toast)return;toast.textContent=txt;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)};
    if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
    const status=document.createElement('div');
    status.className='netStatus';
    document.body.appendChild(status);
    const update=()=>{status.textContent=navigator.onLine?'מחובר לרשת':'אין חיבור רשת';status.classList.toggle('offline',!navigator.onLine)};
    window.addEventListener('online',()=>{update();show('חיבור הרשת חזר')});
    window.addEventListener('offline',()=>{update();show('אין חיבור רשת')});
    update();
    const share=document.createElement('button');
    share.type='button';share.className='floatingShare';share.textContent='שיתוף';
    share.onclick=async()=>{try{if(navigator.share){await navigator.share({title:document.title,url:location.href})}else{await navigator.clipboard.writeText(location.href);show('הקישור הועתק')}}catch{}};
    document.body.appendChild(share);
  });
})();
