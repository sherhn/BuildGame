/* Rules of "Юный строитель": six stages, three choices each, one purse of coins and three trials from a forecast. No DOM: runs in Node.js too. */
(function(root){
 'use strict';
 const BUDGET=14,PRETTY_GOAL=6,TRIALS=3,FINALE='wind';
 const hazards={
 wind:{name:'Ураган',icon:'🌪️',intro:'Налетел ураган!'},
 quake:{name:'Землетрясение',icon:'🌍',intro:'Земля дрожит!'},
 fire:{name:'Пожар',icon:'🔥',intro:'Вспыхнул пожар!'},
 flood:{name:'Наводнение',icon:'🌊',intro:'Река вышла из берегов!'},
 snow:{name:'Снегопад',icon:'❄️',intro:'Валит тяжёлый снег!'}
 };
 // fears maps a hazard to what happens when it hits this choice; a choice without fears is safe against everything.
 const opt=(name,icon,fact,fears={})=>({name,icon,fact,fears});
 const stage=(id,name,kind,ask,options)=>({id,name,kind,ask,options});
 // Choice i costs i+1 coins. Only "strong" stages are tested by the trials; "pretty" stages only add beauty.
 const stages=[
 stage('foundation','Фундамент','strong','На чём будет стоять дом?',[
 opt('Песок','🏖️','Песок сыпучий: от тряски и воды он «плывёт». Дом на нём накренится!',{quake:'Земля затряслась — песок поплыл, и дом накренился!',flood:'Вода размыла песок — дом сдвинуло потоком!'}),
 opt('Камни','🪨','Камни не боятся воды, но от сильной тряски между ними появляются трещины.',{quake:'От тряски камни разошлись — дом осел!'}),
 opt('Бетон','🏗️','Бетон — это цемент, песок, вода и щебень. Со стальными прутьями внутри он как скелет!')]),
 stage('walls','Стены','strong','Из чего построим стены?',[
 opt('Солома','🌾','Солома тёплая, но лёгкая и горючая. Помнишь трёх поросят?',{wind:'Ураган разметал солому, как у поросёнка!',fire:'Солома вспыхнула, как спичка!'}),
 opt('Брёвна','🪵','Деревянные дома тёплые и пахнут лесом. Но дерево боится огня.',{fire:'Деревянные стены сгорели!'}),
 opt('Кирпич','🧱','Кирпич делают из глины и обжигают в печи. Он не горит и стоит сотни лет!')]),
 stage('roof','Крыша','strong','Чем накроем крышу?',[
 opt('Ветки','🍂','Крыша из веток — как у шалаша. Ветер, огонь и снег ей не по силам.',{wind:'Ураган унёс крышу из веток!',fire:'Крыша из веток сгорела!',snow:'Снег продавил крышу из веток!'}),
 opt('Черепица','🟥','Черепицу обжигают из глины. Она не горит, но очень тяжёлая: большой снег её продавит.',{snow:'Тяжёлый снег продавил черепичную крышу!'}),
 opt('Металл','🔩','Металлическая крыша не горит и сбрасывает снег. Но дождь по ней стучит очень громко!')]),
 stage('windows','Окна и дверь','pretty','Какие сделаем окна и дверь?',[
 opt('Простые','🪟','Стекло пропускает свет и держит тепло. Без окон дома были бы тёмными!'),
 opt('Ставни','🚪','Ставни закрывают окна от солнца и непогоды. А ещё это красиво!'),
 opt('Витражи','💠','Витраж собирают из кусочков цветного стекла. На солнце он сияет!')]),
 stage('yard','Двор','pretty','Что будет у дома во дворе?',[
 opt('Клумбы','🌷','Цветы посадили — и сразу веселее! Пчёлы будут рады.'),
 opt('Сад и забор','🌳','Дерево даёт тень и свежий воздух, а забор охраняет двор.'),
 opt('Фонтан и пёс','⛲','Насос гонит воду по кругу, поэтому фонтан не кончается. А пёс охраняет двор!')]),
 stage('extra','Изюминка','pretty','Что поставим на крышу?',[
 opt('Флажок','🚩','Флажок показывает, откуда дует ветер.'),
 opt('Труба с дымом','💨','Дымоход выводит дым из печки на улицу, чтобы дома было тепло и чисто.'),
 opt('Солнечные панели','☀️','Панели превращают солнечный свет в электричество. Дом сам даёт себе свет!')])
 ];
 const titles={
 straw:{name:'Дом поросёнка',icon:'🐷',text:'Волк справился бы за секунду! Попробуй материалы покрепче.'},
 wobbly:{name:'Шаткий домик',icon:'🏚️',text:'Одно слабое место — и дом не выдержал испытание.'},
 sturdy:{name:'Домик-крепыш',icon:'🛡️',text:'Все испытания ему нипочём! Добавь красоты — и будет идеально.'},
 fortress:{name:'Крепость',icon:'🏰',text:'Самое надёжное из всего! Но на красоту не осталось монет.'},
 palace:{name:'Дворец',icon:'👑',text:'Надёжно и невероятно красиво. Ты сэкономил на каждом шагу!'},
 perfect:{name:'Идеальный дом',icon:'🏆',text:'Выдержал всё и выглядит отлично. Ты настоящий строитель!'}
 };
 const cost=i=>i+1;
 const taps=i=>i+3;
 const strong=stages.flatMap((st,k)=>st.kind==='strong'?[k]:[]);
 const fearsOf=(k,i)=>Object.keys(stages[k].options[i].fears);
 const product=n=>n?product(n-1).flatMap(p=>[0,1,2].map(i=>[...p,i])):[[]];
 const combos=(a,n)=>n?a.flatMap((x,i)=>combos(a.slice(i+1),n-1).map(c=>[x,...c])):[[]];
 const sum=a=>a.reduce((n,i)=>n+cost(i),0);
 // Every way to choose the strong stages so that no trial of the forecast breaks anything.
 const sturdyPicks=forecast=>product(strong.length).filter(p=>p.every((i,n)=>!forecast.some(h=>h in stages[strong[n]].options[i].fears)));
 const minSafeCost=forecast=>Math.min(...sturdyPicks(forecast).map(sum));
 // A forecast is playable when three stars stay possible and neither "all cheap" nor "all middle" survives it.
 function playable(forecast){
  const safe=sturdyPicks(forecast);
  return safe.length>0&&Math.min(...safe.map(sum))<=BUDGET-PRETTY_GOAL&&![0,1].some(v=>safe.some(p=>p.every(i=>i===v)));
 }
 const forecasts=combos(Object.keys(hazards),TRIALS).filter(playable);
 // The hurricane is the finale of every game; the other trials come in random order before it.
 function draw(rng=Math.random){
  const pool=forecasts.filter(f=>f.includes(FINALE)),f=pool[Math.floor(rng()*pool.length)].filter(h=>h!==FINALE);
  for(let i=f.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[f[i],f[j]]=[f[j],f[i]];}
  return[...f,FINALE];
 }
 function create(forecast=draw()){
  if(!Array.isArray(forecast)||forecast.length!==TRIALS||new Set(forecast).size!==TRIALS||!forecast.every(h=>hazards[h]))throw Error('Неверный прогноз.');
  return{forecast:[...forecast],picks:[]};
 }
 const coins=s=>BUDGET-sum(s.picks);
 const finished=s=>s.picks.length===stages.length;
 // Every stage still to come needs at least one coin, so a pick must leave that much.
 const canPick=(s,i)=>Number.isInteger(i)&&i>=0&&i<3&&!finished(s)&&coins(s)-cost(i)>=stages.length-s.picks.length-1;
 function pick(s,i){if(!canPick(s,i))throw Error('Не хватит монет на остальные этапы.');s.picks.push(i);return s;}
 const beauty=s=>s.picks.reduce((n,i,k)=>stages[k].kind==='pretty'?n+cost(i):n,0);
 const targets=h=>stages.filter(st=>st.options.some(o=>h in o.fears)).map(st=>st.name);
 // One entry per trial, in order. A stage that already broke in an earlier trial cannot break again:
 // such a trial has no fails of its own and is flagged `already`.
 function trials(s){
  const gone=new Set();
  return s.forecast.map(h=>{
   const hit=strong.filter(k=>s.picks[k]!==undefined&&h in stages[k].options[s.picks[k]].fears);
   const fails=hit.filter(k=>!gone.has(stages[k].id)).map(k=>({stage:stages[k].id,text:stages[k].options[s.picks[k]].fears[h]}));
   fails.forEach(f=>gone.add(f.stage));
   return{hazard:h,passed:!hit.length,fails,already:hit.length>0&&!fails.length};
  });
 }
 function result(s){
  if(!finished(s))throw Error('Дом ещё не достроен.');
  const list=trials(s),broken=list.flatMap(t=>t.fails.map(f=>f.stage)),pretty=beauty(s);
  const stars={built:true,tough:!broken.length,pretty:pretty>=PRETTY_GOAL};
  const levels=strong.map(k=>s.picks[k]);
  const title=levels.every(i=>i===0)?'straw':broken.length?'wobbly':levels.every(i=>i===2)?'fortress':!stars.pretty?'sturdy':pretty>=PRETTY_GOAL+1?'palace':'perfect';
  const tip=broken.length?'Совет: красные значки — это то, чего боится материал. Выбирай карточки без красных значков.':!stars.pretty?'Совет: бери самое дешёвое, что не боится прогноза, — на красоту останется больше монет.':'';
  return{trials:list,broken,beauty:pretty,stars,starCount:Object.values(stars).filter(Boolean).length,title,tip};
 }
 const stageById=id=>stages.find(st=>st.id===id);
 const api={BUDGET,PRETTY_GOAL,TRIALS,FINALE,hazards,stages,titles,forecasts,cost,taps,fearsOf,minSafeCost,draw,create,coins,finished,canPick,pick,beauty,targets,trials,result,stage:stageById};
 if(typeof module!=='undefined')module.exports=api;
 root.BuildGame=api;
})(typeof window!=='undefined'?window:globalThis);
