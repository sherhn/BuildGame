/* Screens and controls: pick a colour, read the forecast, choose materials, tap to build, survive the trials. */
(()=>{'use strict';
const G=BuildGame,S=Scene,app=document.getElementById('app'),KEY='young-builder-v1',TRIAL_MS=4000,GAP_MS=1500;
const CHEER=['Тук!','Ещё!','Так держать!','Почти готово!','Последний удар!'];
const save={titles:[],color:S.colors[0].id,muted:false};
let phase='start',game=G.create(),sel=null,taps=0,fresh=false,timers=[],run=null,ac=null;
try{
 const s=JSON.parse(localStorage.getItem(KEY));
 if(s){
  if(Array.isArray(s.titles))save.titles=s.titles.filter(t=>G.titles[t]);
  if(S.colors.some(c=>c.id===s.color))save.color=s.color;
  save.muted=!!s.muted;
 }
}catch{}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(save));}catch{}};
const hex=()=>S.colors.find(c=>c.id===save.color).hex;
const later=(ms,fn)=>{timers.push(setTimeout(fn,ms));};
const stopTimers=()=>{timers.forEach(clearTimeout);timers=[];};

function tone(freq,len=.12,type='square',vol=.06,at=0){
 if(save.muted)return;
 try{
  ac??=new(window.AudioContext||window.webkitAudioContext)();
  const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+at;
  o.type=type;o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len);
  o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+len);
 }catch{}
}
const sfx={
 select:()=>tone(660,.07,'triangle'),
 no:()=>tone(150,.2,'sawtooth'),
 hit:n=>tone(200+n*60,.09,'square'),
 done:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.18,'triangle',.08,i*.09)),
 crash:()=>[180,140,100,70].forEach((f,i)=>tone(f,.16,'sawtooth',.08,i*.07)),
 win:()=>[523,659,784,659,784,1047].forEach((f,i)=>tone(f,.2,'triangle',.08,i*.12)),
 sad:()=>[392,330,262].forEach((f,i)=>tone(f,.3,'triangle',.07,i*.22)),
 wind:()=>[300,260,320,240].forEach((f,i)=>tone(f,.4,'sawtooth',.03,i*.25)),
 quake:()=>{tone(60,1.4,'sawtooth',.07);tone(75,1.4,'square',.04,.2);},
 fire:()=>[900,1200,800,1500,1000,1300].forEach((f,i)=>tone(f,.05,'square',.03,i*.13)),
 flood:()=>[400,500,420,520,440].forEach((f,i)=>tone(f,.4,'sine',.05,i*.2)),
 snow:()=>[1047,1319,1568,1319].forEach((f,i)=>tone(f,.3,'sine',.04,i*.18))
};

const stageNo=()=>Math.min(game.picks.length,G.stages.length-1);
const lower=s=>s.toLowerCase();
const bubble=text=>`<div class="mascot"><span class="avatar" aria-hidden="true">👷</span><p class="bubble" id="bubble" aria-live="polite">${text}</p></div>`;
const say=text=>{const b=document.getElementById('bubble');if(b)b.textContent=text;};
const forecastBar=(state=()=>'')=>`<div class="forecast"><span>Испытания:</span>${game.forecast.map((h,i)=>`<span class="hz-chip ${state(i)}">${G.hazards[h].icon} ${G.hazards[h].name}</span>`).join('')}</div>`;
const titlesRow=()=>`<div class="titles"><b>Твои звания: ${save.titles.length} из ${Object.keys(G.titles).length}</b><div>${Object.entries(G.titles).map(([id,t])=>save.titles.includes(id)?`<span class="got" title="${t.name}">${t.icon}<small>${t.name}</small></span>`:'<span class="nope" title="Ещё не получено">❓<small>???</small></span>').join('')}</div></div>`;
const mode=(t,f)=>f.stage+'-'+S.mode(f.stage,t.hazard);
const allDead=()=>G.trials(game).flatMap(t=>t.fails.map(f=>mode(t,f)));

function card(o,i,k){
 const st=G.stages[k],fears=G.fearsOf(k,i),ok=G.canPick(game,i);
 const chips=st.kind!=='strong'?'':fears.length?fears.map(h=>`<i class="fear ${game.forecast.includes(h)?'hit':''}" title="Боится: ${lower(G.hazards[h].name)}">${G.hazards[h].icon}</i>`).join(''):'<i class="fear safe" title="Ничего не боится">✅</i>';
 const label=`${o.name}, ${i+1} мон.${st.kind==='strong'?fears.length?', боится: '+fears.map(h=>lower(G.hazards[h].name)).join(', '):', ничего не боится':''}`;
 return `<button class="card ${ok?'':'off'}" data-act="card" data-i="${i}" aria-pressed="false" aria-label="${label}"><span class="ico">${o.icon}</span><b>${o.name}</b><span class="fears">${chips}</span><span class="cost" aria-hidden="true">${'🪙'.repeat(i+1)}</span></button>`;
}

function panel(){
 const k=stageNo(),st=G.stages[k];
 const head=`<p class="stage-name">Этап ${k+1} из ${G.stages.length} · ${st.name}</p>`;
 if(phase==='start')return `${bubble('Привет! Я прораб Макс. Построим твой дом мечты?')}
  <p class="label">Выбери любимый цвет</p>
  <div class="swatches">${S.colors.map(c=>`<button class="swatch" data-act="color" data-id="${c.id}" style="--c:${c.hex}" aria-label="${c.name}" aria-pressed="${save.color===c.id}"></button>`).join('')}</div>
  <button class="big go" data-act="go">Строить! 🔨</button>${titlesRow()}`;
 if(phase==='brief')return `${bubble(`Внимание! На стройку придут ${G.TRIALS} испытания, а главный — ураган: он будет последним.`)}
  <div class="hz-list">${game.forecast.map((h,i)=>`<div class="hz ${h===G.FINALE?'finale':''}"><span class="hz-ico" aria-hidden="true">${G.hazards[h].icon}</span><div><b>${i+1}. ${G.hazards[h].name}${h===G.FINALE?' — финал':''}</b><small>Проверит: ${lower(G.targets(h).join(', '))}</small></div></div>`).join('')}</div>
  <p class="tip">На карточках красным горит то, чего боится материал из этого списка.</p>
  <button class="big go" data-act="brief">Понятно, строим! 🔨</button>`;
 if(phase==='choose')return `${head}${bubble(st.ask+(k===0?` У нас ${G.BUDGET} монет на весь дом!`:''))}${forecastBar()}
  <div class="tag ${st.kind}">${st.kind==='strong'?'💪 Для прочности — без красных значков!':'✨ Для красоты: дороже — красивее'}</div>
  <div class="cards">${st.options.map((o,i)=>card(o,i,k)).join('')}</div>
  <button class="big go" id="ok" data-act="ok" disabled>Выбери вариант</button>`;
 if(phase==='build')return `${head}${bubble('Стучи молотком — или прямо по дому!')}
  <div class="bricks" id="bricks">${'<i></i>'.repeat(G.taps(sel))}</div>
  <button class="big hammer" data-act="hit"><span>🔨</span> Стучи!</button>`;
 if(phase==='built'){
  const last=G.finished(game),done=game.picks.length-1,o=G.stages[done].options[game.picks[done]];
  return `<p class="stage-name">${G.stages[done].name} готов!</p>${bubble(last?'Дом построен! Теперь его проверят испытания.':'Отлично! Идём дальше?')}
  <div class="fact"><b>${o.icon} ${o.name}</b><p>💡 ${o.fact}</p></div>
  <button class="big go" data-act="next">${last?'Начать испытания! ⚠️':'Дальше →'}</button>`;
 }
 if(phase==='trials')return `${bubble(run.text)}${forecastBar(i=>{const t=run.list[i];return i<run.i||(i===run.i&&run.stage==='after')?(t.passed?'ok':'bad'):i===run.i?'now':'';})}
  <button class="link" data-act="skip">Пропустить ⏩</button>`;
 const r=G.result(game),t=G.titles[r.title],stars=[['Дом построен',r.stars.built],['Выдержал испытания',r.stars.tough],['Красивый дом',r.stars.pretty]];
 return `<div class="result ${r.stars.tough?'good':'bad'}">
  <div class="title-card"><span class="big-ico">${t.icon}</span><div><small>Твой дом —</small><h2>${t.name}</h2></div></div>
  ${fresh?'<div class="new">🎉 Новое звание!</div>':''}
  <p class="lead">${t.text}</p>
  <div class="rows">${r.trials.map(x=>`<div class="row ${x.passed?'':'bad'}"><span>${G.hazards[x.hazard].icon}</span><div><b>${G.hazards[x.hazard].name}:</b> ${x.passed?'выдержал ✅':x.already?'ломать уже нечего.':x.fails.map(f=>f.text).join(' ')}</div></div>`).join('')}</div>
  <div class="stars">${stars.map(([l,ok])=>`<div class="star ${ok?'on':''}"><span>${ok?'⭐':'☆'}</span>${l}</div>`).join('')}</div>
  ${r.tip?`<p class="tip">${r.tip}</p>`:''}
  <button class="big go" data-act="again">Построить ещё! 🔨</button>${titlesRow()}</div>`;
}

function sceneOptions(){
 const k=game.picks.length,base={picks:game.picks,color:hex()};
 if(phase==='start')return{picks:[1,1,1,1,1,1],color:hex()};
 if(phase==='brief')return{color:hex()};
 if(phase==='choose')return{...base,current:sel===null?null:{stage:k,pick:sel,mode:'ghost'}};
 if(phase==='build')return{...base,current:{stage:k,pick:sel,mode:'building'}};
 if(phase==='built')return{...base,pop:k-1};
 if(phase==='result')return{...base,dead:allDead()};
 const t=run.list[run.i];
 return run.stage==='hit'?{...base,trial:t.hazard,fail:t.fails.map(f=>mode(t,f)),dead:run.dead}:{...base,dead:run.dead};
}
function drawScene(){
 document.getElementById('house').innerHTML=S.house(sceneOptions());
 document.getElementById('scene').className='scene'+(phase==='trials'&&run.stage==='hit'?' hz-'+run.list[run.i].hazard:'');
}
function drawHud(){
 const k=game.picks.length,live=phase==='choose'||phase==='build';
 document.getElementById('steps').innerHTML=G.stages.map((s,i)=>`<i class="dot ${i<k?'done':''} ${i===k&&live?'now':''}" title="${s.name}">${i<k?'✓':i+1}</i>`).join('');
 const delta=phase==='choose'&&sel!==null?`<small>−${G.cost(sel)}</small>`:'';
 document.getElementById('coins').innerHTML=`🪙 <b>${G.coins(game)}</b>${delta}`;
 const snd=document.getElementById('sound');snd.textContent=save.muted?'🔇':'🔊';snd.setAttribute('aria-label',save.muted?'Включить звук':'Выключить звук');
}
function draw(){
 const p=document.getElementById('panel');
 p.innerHTML=panel();p.className='panel '+phase;
 drawScene();drawHud();
 p.querySelector('.go:not(:disabled),.hammer')?.focus({preventScroll:true});
}

function select(i){
 if(phase!=='choose')return;
 if(!G.canPick(game,i)){sfx.no();say('Не хватит монет на остальные этапы! Выбери подешевле.');return;}
 sel=i;sfx.select();
 const k=game.picks.length,o=G.stages[k].options[i],hits=G.fearsOf(k,i).filter(h=>game.forecast.includes(h));
 document.querySelectorAll('.card').forEach((c,n)=>{c.classList.toggle('on',n===i);c.setAttribute('aria-pressed',n===i);});
 const ok=document.getElementById('ok');ok.disabled=false;ok.textContent='Строить! 🔨';
 say(hits.length?`⚠️ ${o.name}: красный значок — ${hits.map(h=>lower(G.hazards[h].name)).join(', ')}!`:`${o.name}! ${['Дёшево и сердито.','Хороший выбор.','Вот это класс!'][i]}`);
 drawScene();drawHud();
}
function spark(stage){
 const [x,y,w,h]=S.box(stage),fx=document.getElementById('fx');
 if(fx.childElementCount>30)return;
 for(let i=0;i<5;i++){
  const s=document.createElement('span');
  s.textContent=['✨','💥','⭐','🔨'][i%4];
  s.style.left=(x+Math.random()*w)/6+'%';s.style.top=(y+Math.random()*h)/4.2+'%';
  s.addEventListener('animationend',()=>s.remove());fx.append(s);
 }
}
function confetti(){
 const fx=document.getElementById('fx');
 for(let i=0;i<28;i++){
  const s=document.createElement('span');
  s.className='fall';s.textContent=['🎉','⭐','✨','🎊'][i%4];
  s.style.left=Math.random()*95+'%';s.style.animationDelay=Math.random()*.8+'s';
  s.addEventListener('animationend',()=>s.remove());fx.append(s);
 }
}
function banner(text){
 const b=document.createElement('div');
 b.className='banner';b.textContent=text;
 b.addEventListener('animationend',()=>b.remove());
 document.getElementById('fx').append(b);
}
function hit(){
 if(phase!=='build')return;
 const need=G.taps(sel),k=game.picks.length,scene=document.getElementById('scene');
 taps++;sfx.hit(taps);spark(k);
 S.progress(document.querySelector('#house svg'),taps/need);
 document.querySelectorAll('#bricks i').forEach((b,i)=>b.classList.toggle('on',i<taps));
 scene.classList.remove('bump');void scene.offsetWidth;scene.classList.add('bump');
 if(taps<need){say(CHEER[Math.min(taps-1,CHEER.length-1)]);return;}
 G.pick(game,sel);sel=null;phase='built';sfx.done();draw();
}

// The trials run one after another; every broken part stays broken for the next one.
function trialStart(i){
 const t=run.list[i],z=G.hazards[t.hazard];
 run.i=i;run.stage='hit';run.text=z.intro;
 draw();banner(`${z.icon} ${z.name}!`);sfx[t.hazard]();
 later(TRIAL_MS,()=>trialEnd(i));
}
function trialEnd(i){
 const t=run.list[i];
 run.dead.push(...t.fails.map(f=>mode(t,f)));
 run.stage='after';
 run.text=t.passed?'Выдержал! ✅':t.already?'Ломать уже нечего…':t.fails.map(f=>f.text).join(' ');
 draw();
 if(t.fails.length)sfx.crash();else if(t.passed)sfx.done();
 later(GAP_MS,()=>i+1<run.list.length?trialStart(i+1):finish());
}
function finish(){
 stopTimers();
 const r=G.result(game);
 phase='result';fresh=!save.titles.includes(r.title);
 if(fresh){save.titles.push(r.title);persist();}
 draw();
 if(r.stars.tough){sfx.win();confetti();}else sfx.sad();
}

const act={
 color:b=>{save.color=b.dataset.id;persist();draw();},
 go:()=>{game=G.create();sel=null;phase='brief';draw();},
 brief:()=>{phase='choose';draw();},
 card:b=>select(+b.dataset.i),
 ok:()=>{if(sel===null)return;taps=0;phase='build';draw();},
 hit,
 next:()=>{
  if(!G.finished(game)){sel=null;phase='choose';draw();return;}
  phase='trials';run={list:G.trials(game),i:0,stage:'hit',dead:[],text:''};
  trialStart(0);
 },
 skip:finish,
 again:()=>{stopTimers();phase='start';game=G.create();draw();},
 sound:()=>{save.muted=!save.muted;persist();drawHud();sfx.select();},
 restart:()=>{
  if(phase==='start'||(phase!=='result'&&!confirm('Начать заново? Дом пропадёт.')))return;
  stopTimers();phase='start';game=G.create();sel=null;draw();
 }
};
app.innerHTML=`<header class="hud">
 <div class="logo"><span>🏠</span><b>Юный строитель</b></div>
 <div class="steps" id="steps" aria-label="Этапы"></div>
 <div class="coins" id="coins" aria-label="Монеты"></div>
 <button class="icon" id="sound" data-act="sound"></button>
 <button class="icon" data-act="restart" aria-label="Начать заново" title="Начать заново">↺</button>
</header>
<main class="stage">
 <section class="scene" id="scene" aria-label="Твой дом"><div class="world">${S.backdrop()}<div id="house"></div></div><div id="fx" aria-hidden="true"></div></section>
 <section class="panel" id="panel"></section>
</main>`;
app.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');
 if(b){act[b.dataset.act]?.(b);return;}
 if(phase==='build'&&e.target.closest('#scene'))hit();
});
document.addEventListener('keydown',e=>{if(phase==='choose'&&/^[1-3]$/.test(e.key))select(+e.key-1);});
draw();
})();
