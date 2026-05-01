const S={events:[],types:{},range:'month',type:'all',q:'',today:day(new Date())};
const baseTypes={
  exam:['מבחנים','#B91C1C'],
  quiz:['בחנים','#DC2626'],
  vacation:['חופשות','#0F766E'],
  trip:['טיולים','#15803D'],
  activity:['פעילויות','#2563EB'],
  club:['חוגים','#7C3AED'],
  special:['פעילויות מיוחדות','#BE185D'],
  ceremony:['טקסים','#92400E'],
  meeting:['ישיבות','#475569'],
  deadline:['תאריך יעד','#C2410C'],
  community:['קהילה / הורים','#0891B2'],
  other:['אחר','#A16207']
};

const $=id=>document.getElementById(id);
const E={
  statusTitle:$('statusTitle'),
  statusText:$('statusText'),
  typeNav:$('typeNav'),
  search:$('search'),
  monthTitle:$('monthTitle'),
  monthGrid:$('monthGrid'),
  events:$('events'),
  listTitle:$('listTitle'),
  countToday:$('countToday'),
  countWeek:$('countWeek'),
  countExams:$('countExams'),
  countTotal:$('countTotal'),
  liveClock:$('liveClock'),
  liveDate:$('liveDate')
};

start();

async function start(){
  bind();
  updateClock();
  setInterval(updateClock,1000);
  await sync();
  render();
  setInterval(sync,180000);
}

function bind(){
  document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('[data-range]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    S.range=b.dataset.range;
    render();
  });
  E.search.oninput=e=>{
    S.q=e.target.value.trim().toLowerCase();
    render();
  };
  $('todayBtn').onclick=()=>{
    S.range='today';
    document.querySelectorAll('[data-range]').forEach(x=>x.classList.toggle('active',x.dataset.range==='today'));
    location.hash='list';
    render();
  };
  $('resetBtn').onclick=()=>{
    S.range='month';
    S.type='all';
    S.q='';
    E.search.value='';
    document.querySelectorAll('[data-range]').forEach(x=>x.classList.toggle('active',x.dataset.range==='month'));
    render();
  };
  $('copyBtn').onclick=async()=>{
    try{
      await navigator.clipboard.writeText(location.href);
      msg('הקישור הועתק');
    }catch{
      msg('לא ניתן להעתיק');
    }
  };
  $('syncBtn').onclick=async()=>{
    msg('מרענן נתונים');
    await sync();
  };
}

function updateClock(){
  const now=new Date();
  if(E.liveClock){
    E.liveClock.textContent=new Intl.DateTimeFormat('he-IL',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
  }
  if(E.liveDate){
    E.liveDate.textContent=new Intl.DateTimeFormat('he-IL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);
  }
}

async function sync(){
  try{
    const src=await fetch('data/source.json?cb='+Date.now(),{cache:'no-store'}).then(r=>r.json());
    const table=await loadSheet(src.sheetId,src.gid);
    S.types=mkTypes();
    S.events=extractEvents(table).sort((a,b)=>(a.dateRaw+a.startTime).localeCompare(b.dateRaw+b.startTime));
    E.statusTitle.textContent=S.events.length?'מסונכרן מהגיליון':'הגיליון נקרא, אין אירועים תקינים';
    E.statusText.textContent=`טאב ${src.gid} · ${S.events.length} אירועים · רענון אוטומטי`;
    render();
  }catch(err){
    await fallback();
  }
}

async function fallback(){
  try{
    const d=await fetch('data/events.json?cb='+Date.now(),{cache:'no-store'}).then(r=>r.json());
    S.types=mkTypes(d.activityTypes);
    S.events=(d.events||[]).map(normObj).filter(Boolean);
    E.statusTitle.textContent='Google Sheet לא נגיש';
    E.statusText.textContent='כרגע לא ניתן לקרוא את הגיליון. לא מוצגים נתוני דמו.';
    render();
  }catch{
    E.statusTitle.textContent='שגיאת נתונים';
    E.statusText.textContent='לא ניתן לקרוא את Google Sheet כרגע';
  }
}

function loadSheet(id,gid){
  return new Promise((ok,bad)=>{
    const cb='lz_cb_'+Date.now();
    window[cb]=res=>{
      delete window[cb];
      document.getElementById(cb)?.remove();
      if(!res||res.status!=='ok') bad(new Error('sheet not readable'));
      else ok(res.table);
    };
    const s=document.createElement('script');
    s.id=cb;
    s.onerror=()=>{
      delete window[cb];
      bad(new Error('sheet load failed'));
    };
    s.src=`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?gid=${gid}&tqx=out:json;responseHandler:${cb}&_=${Date.now()}`;
    document.body.appendChild(s);
  });
}

function matrix(t){
  const head=(t.cols||[]).map(c=>clean(c.label||c.id||''));
  const rows=(t.rows||[]).map(r=>(r.c||[]).map(c=>c?String(c.f??c.v??'').trim():''));
  return [head,...rows];
}

function extractEvents(t){
  const m=matrix(t);
  const standard=extractStandard(m);
  if(standard.length) return standard;
  return extractGrid(m);
}

function extractStandard(m){
  if(!m.length) return [];
  const h=m[0].map(clean);
  const hasDate=h.some(x=>['תאריך','date','Date'].includes(x));
  const hasTitle=h.some(x=>['שם אירוע','שם','אירוע','פעילות','title','Title'].includes(x));
  if(!hasDate||!hasTitle) return [];
  return m.slice(1).map(r=>{
    let o={};
    h.forEach((k,i)=>o[k]=r[i]||'');
    return normObj(o);
  }).filter(Boolean);
}

function extractGrid(m){
  let dateByCol={},out=[];
  for(let r=0;r<m.length;r++){
    for(let c=0;c<m[r].length;c++){
      let v=clean(m[r][c]);
      if(!v) continue;
      let d=parseGridDate(v);
      if(d){ dateByCol[c]=d; continue; }
      if(!dateByCol[c]) continue;
      if(isHeaderLike(v)) continue;
      let tm=extractTime(v);
      let title=v.replace(/\(?\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}\)?/,'').trim()||v;
      out.push({
        title,
        date:parseDate(dateByCol[c]),
        dateRaw:dateByCol[c],
        type:typeKey(v),
        startTime:tm[0],
        endTime:tm[1],
        group:'',
        location:'',
        responsible:'',
        notes:v===title?'':v,
        color:''
      });
    }
  }
  return uniqueEvents(out);
}

function uniqueEvents(list){
  const seen=new Set();
  return list.filter(e=>{
    const key=[e.title,e.dateRaw,e.startTime,e.endTime,e.type].join('|');
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseGridDate(v){
  let m=String(v).trim().match(/^(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?$/);
  if(!m) return '';
  let now=new Date();
  let schoolBase=now.getMonth()>=8?now.getFullYear():now.getFullYear()-1;
  let y=m[3]?(m[3].length===2?2000+Number(m[3]):Number(m[3])):(Number(m[2])>=9?schoolBase:schoolBase+1);
  return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
}

function normObj(r){
  let title=pick(r,['שם אירוע','שם','אירוע','פעילות','title','Title']);
  let date=toDate(pick(r,['תאריך','date','Date']));
  if(!title||!date) return null;
  let raw=pick(r,['סוג','סוג אירוע','קטגוריה','type','Type'])||title;
  return {
    title,
    date:parseDate(date),
    dateRaw:date,
    type:typeKey(raw),
    startTime:pick(r,['שעת התחלה','התחלה','משעה','startTime']),
    endTime:pick(r,['שעת סיום','סיום','עד שעה','endTime']),
    group:[pick(r,['שכבה']),pick(r,['כיתה']),pick(r,['קבוצה','group'])].filter(Boolean).join(' · '),
    location:pick(r,['מיקום','מקום','location']),
    responsible:pick(r,['אחראי','אחריות','responsible']),
    notes:pick(r,['הערות','פרטים','notes']),
    color:pick(r,['צבע','color'])
  };
}

function pick(r,names){
  for(const n of names){
    const k=clean(n);
    if(r[k]) return r[k];
  }
  return '';
}

function extractTime(v){
  let m=String(v).match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  if(m) return [m[1],m[2]];
  m=String(v).match(/(\d{1,2}:\d{2})/);
  return m?[m[1],'']:['',''];
}

function isHeaderLike(v){
  return /^יום\s/.test(v) || v.includes('לוח') || v.includes('גלישת טקסט') || v.includes('גודל גופן') || v.includes('כל חודש');
}

function typeKey(v){
  v=String(v).trim().toLowerCase();
  if(v.includes('מבחן')) return 'exam';
  if(v.includes('בוחן')||v.includes('בחן')) return 'quiz';
  if(v.includes('חופשה')||v.includes('חופש')) return 'vacation';
  if(v.includes('טיול')||v.includes('סיור')) return 'trip';
  if(v.includes('חוג')) return 'club';
  if(v.includes('טקס')) return 'ceremony';
  if(v.includes('ישיבה')||v.includes('מפגש')) return 'meeting';
  if(v.includes('הורים')||v.includes('קהילה')) return 'community';
  if(v.includes('הגשה')||v.includes('תאריך יעד')) return 'deadline';
  return 'activity';
}

function mkTypes(extra){
  let o={};
  Object.entries(baseTypes).forEach(([k,v])=>o[k]={label:v[0],color:v[1]});
  return Object.assign(o,extra||{});
}

function render(){
  renderTypes();
  stats();
  month();
  list();
}

function renderTypes(){
  E.typeNav.innerHTML=[['all',{label:'הכול'}],...Object.entries(S.types)].map(([k,t])=>`<button data-type="${esc(k)}" class="${S.type===k?'active':''}">${esc(t.label||k)}</button>`).join('');
  E.typeNav.querySelectorAll('button').forEach(b=>b.onclick=()=>{
    S.type=b.dataset.type;
    render();
  });
}

function stats(){
  E.countTotal.textContent=S.events.length;
  E.countToday.textContent=S.events.filter(e=>same(e.date,S.today)).length;
  E.countWeek.textContent=S.events.filter(e=>e.date>=S.today&&e.date<add(S.today,7)).length;
  E.countExams.textContent=S.events.filter(e=>e.type==='exam').length;
}

function month(){
  const n=new Date(),f=new Date(n.getFullYear(),n.getMonth(),1),st=add(f,-f.getDay());
  E.monthTitle.textContent=new Intl.DateTimeFormat('he-IL',{month:'long',year:'numeric'}).format(f);
  let h='';
  for(let i=0;i<42;i++){
    const d=add(st,i),ev=S.events.filter(e=>same(e.date,d));
    h+=`<div class="day ${d.getMonth()!==n.getMonth()?'muted':''} ${same(d,S.today)?'today':''}"><b>${d.getDate()}</b><div>${ev.slice(0,5).map(e=>`<span class="dot" style="background:${esc(color(e))}"></span>`).join('')}</div></div>`;
  }
  E.monthGrid.innerHTML=h;
}

function list(){
  const a=filtered();
  E.listTitle.textContent=`רשימת אירועים · ${a.length}`;
  if(!S.events.length){
    E.events.innerHTML='<div class="empty"><b>אין כרגע אירועים להצגה</b><span>המידע יופיע כאן רק כשהגיליון יהיה קריא וזמין. אין באתר נתוני דמו.</span></div>';
    return;
  }
  E.events.innerHTML=a.map(e=>`<article class="event" style="--c:${esc(color(e))}"><h3>${esc(e.title)}</h3><div class="meta"><span>${fmt(e.date)}</span><span>${esc(time(e))}</span>${e.group?`<span>${esc(e.group)}</span>`:''}${e.location?`<span>${esc(e.location)}</span>`:''}</div><span class="badge">${esc(label(e))}</span>${e.notes?`<div class="meta"><span>${esc(e.notes)}</span></div>`:''}</article>`).join('')||'<div class="empty"><b>אין תוצאות בסינון הנוכחי</b></div>';
}

function filtered(){
  return S.events.filter(e=>{
    let txt=[e.title,e.group,e.location,e.responsible,e.notes,label(e)].join(' ').toLowerCase();
    return (S.type==='all'||e.type===S.type) && range(e) && (!S.q||txt.includes(S.q));
  });
}

function range(e){
  if(S.range==='all') return true;
  if(S.range==='today') return same(e.date,S.today);
  if(S.range==='week') return e.date>=S.today&&e.date<add(S.today,7);
  let n=new Date();
  return e.date.getFullYear()===n.getFullYear()&&e.date.getMonth()===n.getMonth();
}

function toDate(v){
  v=String(v).trim();
  let m=v.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})$/);
  if(m) return `${m[3].length===2?'20'+m[3]:m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  return '';
}

function parseDate(s){
  let [a,b,c]=s.split('-').map(Number);
  return new Date(a,b-1,c);
}
function clean(s){ return String(s||'').trim().replace(/\s+/g,' '); }
function day(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
function add(d,n){ let x=new Date(d); x.setDate(x.getDate()+n); return day(x); }
function same(a,b){ return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function label(e){ return (S.types[e.type]||S.types.other||{}).label||e.type; }
function color(e){ return e.color||(S.types[e.type]||S.types.other||{}).color||'#2563EB'; }
function time(e){ return [e.startTime,e.endTime].filter(Boolean).join(' - ')||'ללא שעה'; }
function fmt(d){ return new Intl.DateTimeFormat('he-IL',{weekday:'long',day:'numeric',month:'long'}).format(d); }
function esc(v){ return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function msg(t){ let x=$('toast'); x.textContent=t; x.classList.add('show'); setTimeout(()=>x.classList.remove('show'),1600); }
