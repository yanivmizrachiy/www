const app=document.getElementById('app');
const bg={meeting:'#E2E8F0',vacation:'#CCFBF1',community:'#CFFAFE',trip:'#DCFCE7',activity:'#DBEAFE',deadline:'#FFEDD5',ceremony:'#FEF3C7',exam:'#FEE2E2',quiz:'#FFE4E6',other:'#F5F5F4'};
const ac={meeting:'#475569',vacation:'#0F766E',community:'#0891B2',trip:'#15803D',activity:'#2563EB',deadline:'#C2410C',ceremony:'#92400E',exam:'#B91C1C',quiz:'#DC2626',other:'#A16207'};
app.innerHTML='<main class="list" id="list"><div class="empty">טוען...</div></main>';
load();
async function load(){try{const d=await fetch('data/may-june-events.json?v=24785da',{cache:'no-store'}).then(r=>r.json());const ev=(d.events||[]).filter(e=>/-(05|06)-/.test(e.date)).sort((a,b)=>(a.date+(a.startTime||'')+a.title).localeCompare(b.date+(b.startTime||'')+b.title));draw(ev)}catch{document.getElementById('list').innerHTML='<div class="empty">לא נמצאו אירועים</div>'}}
function draw(ev){const list=document.getElementById('list');if(!ev.length){list.innerHTML='<div class="empty">לא נמצאו אירועים</div>';return}list.innerHTML=ev.map(card).join('')}
function card(e){const d=new Date(e.date+'T12:00:00');const dateText=(e.dayLabel?e.dayLabel+' · ':'')+(e.dateLabel||fmtDate(d));const time=[e.startTime,e.endTime].filter(Boolean).join(' - ');const c=ac[e.type]||ac.other,b=bg[e.type]||bg.other;return `<article class="event oneLineEvent" style="--bg:${b};--c:${c}">${time?`<div class="time">${esc(time)}</div>`:''}<div class="title">${esc(dateText+' — '+e.title)}</div></article>`}
function fmtDate(d){return new Intl.DateTimeFormat('he-IL',{weekday:'long',day:'numeric',month:'long'}).format(d)}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
