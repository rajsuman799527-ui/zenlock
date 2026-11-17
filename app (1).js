/* Zenlock — web prototype. Native (Capacitor) me real blocking add hogi. */
const KEY='zenlock_v1';
const APPS=[
 {id:'wa',n:'WhatsApp',c:'#25D366',i:'W'},{id:'ig',n:'Instagram',c:'#E1306C',i:'I'},{id:'yt',n:'YouTube',c:'#FF0033',i:'Y'},
 {id:'sc',n:'Snapchat',c:'#E6C700',i:'S'},{id:'fb',n:'Facebook',c:'#1877F2',i:'F'},{id:'x',n:'X',c:'#444',i:'X'},
 {id:'tg',n:'Telegram',c:'#2AABEE',i:'T'},{id:'nf',n:'Netflix',c:'#C4121A',i:'N'},{id:'ch',n:'Chrome',c:'#4C8BF5',i:'C'},
 {id:'rd',n:'Reddit',c:'#FF5700',i:'R'},{id:'gm',n:'Games',c:'#7C6BFF',i:'G'},{id:'sp',n:'Spotify',c:'#1DB954',i:'♪'}
];
const QUOTES=['Abhi ka focus, kal ki azaadi.','Ek ek minute tumhara hai.','Phone rakho. Kaam pakdo.','Boredom ke baad hi deep work aata hai.','Tum isse zyada kar sakte ho.'];
const DAYS=['S','M','T','W','T','F','S'];
const defR=()=>({on:false,days:[1,2,3,4,5],start:'09:00',end:'10:00',shield:0});
let S=JSON.parse(localStorage.getItem(KEY)||'null')||{shields:[[],[],[]],shield:0,mins:45,custom:60,passes:3,hist:{},sessions:{},routines:[defR(),defR(),defR()],routine:0,session:null,lastTrig:''};
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const pad=n=>String(n).padStart(2,'0');
const dayKey=(d=new Date())=>d.toLocaleDateString('en-CA');
let toastT;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('show'),2200)}
const digits=(el,hh,mm,colon=true)=>{el.innerHTML=`${pad(hh)}<i>:</i>${pad(mm)}`};

/* ---------- navigation ---------- */
$('#nav').addEventListener('click',e=>{const b=e.target.closest('button');if(b)go(b.dataset.v)});
function go(v){$$('.view').forEach(x=>x.classList.toggle('active',x.id==='v-'+v));$$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));if(v==='stats')renderStats();if(v==='shields')renderShields()}

/* ---------- slide helper ---------- */
function slider(el,done){
  const k=el.querySelector('.knob');let sx=0,drag=false,max=0;const right=el.classList.contains('exit');
  k.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX;max=el.clientWidth-k.clientWidth-12;k.setPointerCapture(e.pointerId);k.style.transition='none'});
  k.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-sx;dx=right?Math.min(0,Math.max(-max,dx)):Math.max(0,Math.min(max,dx));k.style.transform=`translateX(${dx}px)`;k._dx=Math.abs(dx)/max});
  const end=()=>{if(!drag)return;drag=false;k.style.transition='transform .25s';k.style.transform='';if(k._dx>.85)done();k._dx=0};
  k.addEventListener('pointerup',end);k.addEventListener('pointercancel',end);
}

/* ---------- FOCUS ---------- */
function curMins(){return S.mins==='custom'?S.custom:S.mins}
function renderFocus(){
  const m=curMins();digits($('#focusDigits'),Math.floor(m/60),m%60);
  $('#customVal').textContent=Math.floor(S.custom/60)+':'+pad(S.custom%60);
  $$('.grid .tile[data-m]').forEach(t=>t.classList.toggle('sel',String(S.mins)===t.dataset.m));
  const n=S.shields[S.shield].length;
  $('#focusSub').textContent=`Shield ${S.shield+1} · ${n} apps block honge`;
  $('#shieldHint').textContent=n?'':'Pehle Shields me apps select karo.';
  $('#passCount').textContent=S.passes;
}
$$('.grid .tile[data-m]').forEach(t=>t.addEventListener('click',e=>{if(e.target.closest('.step'))return;S.mins=t.dataset.m==='custom'?'custom':+t.dataset.m;save();renderFocus()}));
$('#minus').onclick=()=>{S.custom=Math.max(5,S.custom-5);S.mins='custom';save();renderFocus()};
$('#plus').onclick=()=>{S.custom=Math.min(720,S.custom+5);S.mins='custom';save();renderFocus()};
slider($('#slideStart'),()=>{
  if(!S.shields[S.shield].length){toast('Pehle apps select karo');go('shields');return}
  startSession(curMins(),S.shield);
});

/* ---------- SHIELDS ---------- */
function renderShields(){
  $('#shieldsHero').innerHTML=[0,1,2].map(i=>`<div class="bag ${i===S.shield?'on':''}">${S.shields[i].length}</div>`).join('');
  $('#shieldTabs').innerHTML=[0,1,2].map(i=>`<button class="${i===S.shield?'on':''}" data-i="${i}">Shield ${i+1}</button>`).join('');
  $('#appGrid').innerHTML=APPS.map(a=>`<button class="app ${S.shields[S.shield].includes(a.id)?'on':''}" data-id="${a.id}"><div class="ic" style="background:${a.c}">${a.i}</div>${a.n}</button>`).join('');
}
$('#shieldTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.shield=+b.dataset.i;save();renderShields();renderFocus()});
$('#appGrid').addEventListener('click',e=>{const b=e.target.closest('.app');if(!b)return;const l=S.shields[S.shield],i=l.indexOf(b.dataset.id);i>-1?l.splice(i,1):l.push(b.dataset.id);save();renderShields();renderFocus()});

/* ---------- ROUTINES ---------- */
function renderRoutines(){
  const r=S.routines[S.routine];
  $('#routineTabs').innerHTML=[0,1,2].map(i=>`<button class="${i===S.routine?'on':''}" data-i="${i}">Routine ${i+1}</button>`).join('');
  $('#routineClock').innerHTML=`<div>${r.start}<small>start</small></div><div>${r.end}<small>end</small></div>`;
  $('#rOn').checked=r.on;$('#rStart').value=r.start;$('#rEnd').value=r.end;$('#rShield').value=r.shield;
  $('#days').innerHTML=DAYS.map((d,i)=>`<button class="${r.days.includes(i)?'on':''}" data-d="${i}">${d}</button>`).join('');
}
$('#routineTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.routine=+b.dataset.i;save();renderRoutines()});
$('#days').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const r=S.routines[S.routine],d=+b.dataset.d,i=r.days.indexOf(d);i>-1?r.days.splice(i,1):r.days.push(d);save();renderRoutines()});
['rOn','rStart','rEnd','rShield'].forEach(id=>$('#'+id).addEventListener('change',()=>{const r=S.routines[S.routine];r.on=$('#rOn').checked;r.start=$('#rStart').value;r.end=$('#rEnd').value;r.shield=+$('#rShield').value;save();renderRoutines()}));
function checkRoutines(){
  if(S.session)return;const now=new Date(),hm=pad(now.getHours())+':'+pad(now.getMinutes());
  S.routines.forEach((r,i)=>{
    if(!r.on||!r.days.includes(now.getDay())||!S.shields[r.shield].length)return;
    const [eh,em]=r.end.split(':').map(Number);let mins=(eh*60+em)-(now.getHours()*60+now.getMinutes());
    const tag=dayKey()+'|'+i+'|'+r.start;
    if(hm>=r.start&&mins>0&&S.lastTrig!==tag&&hm<r.end){S.lastTrig=tag;save();startSession(mins,r.shield);toast('Routine '+(i+1)+' shuru')}
  });
}

/* ---------- STATS ---------- */
function streak(){let n=0;const d=new Date();for(;;){if(S.hist[dayKey(d)]>0)n++;else if(n>0||dayKey(d)!==dayKey())break;d.setDate(d.getDate()-1);if(n>400)break}return n}
function renderStats(){
  const now=new Date(),y=now.getFullYear(),m=now.getMonth(),dim=new Date(y,m+1,0).getDate();
  let vals=[],tot=0,best=0,ses=0;
  for(let d=1;d<=dim;d++){const k=dayKey(new Date(y,m,d)),v=S.hist[k]||0;vals.push(v);tot+=v;best=Math.max(best,v);ses+=S.sessions[k]||0}
  const mx=Math.max(60,...vals);
  $('#bars').innerHTML=vals.map((v,i)=>`<div class="${i+1===now.getDate()?'today':i+1>now.getDate()?'fut':''}" style="height:${Math.max(4,v/mx*100)}%"></div>`).join('');
  $('#statLine').textContent=`Aaj · ${S.hist[dayKey()]||0} min`;
  $('#stTotal').textContent=tot;$('#stBest').textContent=best;$('#stSessions').textContent=ses;
}

/* ---------- SESSION ---------- */
let tick,idleT,dimT1,dimT2;
function startSession(mins,shield){
  const now=Date.now();S.session={start:now,end:now+mins*60000,shield,total:mins};save();showLock();
}
function showLock(){
  const s=S.session;$('#lockScreen').classList.remove('hidden');
  $('#quote').textContent=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  $('#dock').innerHTML=S.shields[s.shield].map(id=>{const a=APPS.find(x=>x.id===id);return `<div class="ic blk" data-b="1" style="background:${a.c}">${a.i}</div>`}).join('')+'<div class="ic phone">📞</div>';
  clearInterval(tick);tick=setInterval(updateLock,250);updateLock();resetDim();
}
function updateLock(){
  const s=S.session;if(!s)return;const left=s.end-Date.now();
  if(left<=0){finish(true);return}
  const t=Math.ceil(left/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60);
  digits($('#lockDigits'),h,m);$('#lockSec').textContent=pad(t%60);
  const e=new Date(s.end);$('#lockEnds').textContent=e.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  $('#dimClock').textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
}
function finish(complete){
  const s=S.session;if(!s)return;
  const done=Math.max(0,Math.round((Math.min(Date.now(),s.end)-s.start)/60000)),k=dayKey();
  S.hist[k]=(S.hist[k]||0)+done;if(complete)S.sessions[k]=(S.sessions[k]||0)+1;
  S.session=null;save();clearInterval(tick);clearTimeout(dimT1);clearTimeout(dimT2);
  $('#dim').className='dim';$('#lockScreen').classList.add('hidden');
  toast(complete?'Session complete 🎉':'Session band');renderFocus();renderStats();updateStreak();
}
$('#extend').onclick=()=>{S.session.end+=15*60000;S.session.total+=15;save();toast('+15 min');resetDim()};
slider($('#slideExit'),()=>{
  if(S.passes<=0){toast('Koi emergency pass nahi bacha');return}
  S.passes--;save();finish(false);
});
$('#dock').addEventListener('click',e=>{if(e.target.closest('[data-b]'))toast('Ye app abhi blocked hai 🔒')});

/* dim: kuch der baad screen kam, phir lagbhag off */
function resetDim(){
  const d=$('#dim');d.className='dim';clearTimeout(dimT1);clearTimeout(dimT2);
  dimT1=setTimeout(()=>d.className='dim l1',12000);
  dimT2=setTimeout(()=>d.className='dim l2',30000);
}
['pointerdown','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(S.session)resetDim()},{passive:true}));
document.addEventListener('visibilitychange',()=>{if(S.session&&document.hidden)toast('Session chal raha hai')});

function updateStreak(){$('#streakCount').textContent=streak()}

/* ---------- init ---------- */
renderFocus();renderShields();renderRoutines();updateStreak();
if(S.session){S.session.end>Date.now()?showLock():finish(true)}
setInterval(checkRoutines,20000);checkRoutines();
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
