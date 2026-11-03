/* Trials and damage: the weather of every hazard and the way each broken part falls apart. SVG strings, animated in style.css. */
window.Damage=(()=>{
 'use strict';
 const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 const int=Math.round;
 const many=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join('');
 const delay=(i,k,span)=>`animation-delay:-${(rnd(i+k)*span).toFixed(2)}s`;
 // How each hazard breaks each stage. The mode names the CSS class that animates the part.
 const modes={foundation:{quake:'sink',flood:'wash'},walls:{wind:'crumble',fire:'burn'},roof:{wind:'fly',fire:'burn',snow:'cave'}};

 // --- weather ---
 const tint=(c,o)=>`<rect class="tint" width="600" height="420" fill="${c}" style="--o:${o}"/>`;
 // The hurricane blows from left to right, ordinary rain falls a little to the left.
 const rain=(n,heavy)=>`<g class="rain${heavy?' heavy':''}">${many(n,i=>{const x=int(rnd(i)*(heavy?720:660)-(heavy?150:30));return `<line x1="${x}" y1="-30" x2="${x+(heavy?7:-8)}" y2="-6" style="${delay(i,50,.7)}"/>`;})}</g>`;
 const cloud=([x,y,s])=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="70" ry="26" fill="#2f3b4b"/><ellipse cx="-44" cy="8" rx="42" ry="20" fill="#384556"/><ellipse cx="46" cy="10" rx="48" ry="22" fill="#2a3544"/></g>`;
 const bolt=(pts,n)=>`<polygon class="bolt b${n}" points="${pts}"/>`;
 const flame=(x,y,s,d,cls='')=>`<g transform="translate(${x} ${y}) scale(${s})"><g class="flame ${cls}" style="animation-delay:${d}s"><path d="M0 0C-20-10-18-34-4-62C0-44 8-52 6-70C22-48 26-20 14-8C10-2 4 2 0 0Z" fill="#e8481c"/><path d="M0 0C-14-8-12-26-2-46C6-32 16-26 12-10C9-3 4 1 0 0Z" fill="#ff8a1f"/><path d="M0 0C-7-4-6-16 0-28C4-18 9-14 6-6C5-2 2 0 0 0Z" fill="#ffd23f"/></g></g>`;
 const wavePath=y=>`M-120 ${y}${'q30-12 60 0t60 0'.repeat(14)}V440H-120Z`;
 const plank=(x,y,r,w)=>`<g transform="translate(${x} ${y}) rotate(${r})"><g class="float" style="${delay(x,0,2)}"><rect x="${-w/2}" y="-5" width="${w}" height="10" rx="3" fill="#a9703c" stroke="#6b4326" stroke-width="2"/><path d="M${-w/2+10} -5v10M${w/2-14} -5v10" stroke="#6b4326" stroke-width="1.5"/></g></g>`;
 const barrel='<g transform="translate(372 314)"><g class="float" style="animation-delay:-.7s"><rect x="-13" y="-17" width="26" height="30" rx="7" fill="#b9743c" stroke="#6b4326" stroke-width="2"/><path d="M-13-6h26M-13 5h26" stroke="#6b4326" stroke-width="2"/></g></g>';
 const snowcap='<path class="snowcap" d="M164 94H436L448 116Q430 108 414 118Q398 108 382 118Q366 108 350 118Q334 108 318 118Q302 108 286 118Q270 108 254 118Q238 108 222 118Q206 108 190 118Q176 108 158 116Z" fill="#fff" stroke="#cfe0ee" stroke-width="2"/>';
 // Each layer is drawn over the whole scene while the trial runs. fail lists the "stage-mode" parts breaking now.
 const layers={
  wind:()=>`${tint('#1f2a38',.58)}<g class="clouds">${[[40,24,1.1],[200,14,1.3],[370,30,1.2],[540,18,1.1]].map(cloud).join('')}</g>${many(14,i=>`<path class="gust" d="M0 ${int(40+rnd(i+3)*320)}h${int(34+rnd(i+8)*40)}" style="${delay(i,0,.8)}"/>`)}${rain(70,true)}${many(10,i=>`<ellipse class="leaf" cx="-20" cy="${int(60+rnd(i+20)*260)}" rx="8" ry="4" fill="${['#6bb34a','#e0892f','#4f9a3a'][i%3]}" style="${delay(i,30,1.4)}"/>`)}${many(5,i=>`<rect class="leaf twig" x="-40" y="${int(80+rnd(i+60)*230)}" width="26" height="4" rx="2" fill="#7a5a34" style="${delay(i,70,1.6)}"/>`)}<rect class="flash" width="600" height="420"/>${bolt('96,40 68,140 94,140 72,232 136,112 108,112 130,40',1)}${bolt('480,30 450,120 476,120 456,200 516,92 490,92 510,30',2)}`,
  quake:fail=>`<path class="crack" d="M150 338l-30 24 16 12-26 30M452 342l32 22-18 14 30 28M300 350l-8 30 16 20"/>${many(9,i=>`<circle class="dust" cx="${40+i*65}" cy="334" r="${int(16+rnd(i)*14)}" style="animation-delay:${(i*.16).toFixed(2)}s"/>`)}${fail.includes('foundation-sink')?many(10,i=>`<rect class="pebble" x="${112+i*38}" y="${150+int(rnd(i)*40)}" width="10" height="7" rx="2" fill="#c9482f" style="--dy:${int(150+rnd(i+4)*30)}px;--d:${(1.3+rnd(i+9)*.9).toFixed(2)}s"/>`):''}`,
  fire:fail=>`${tint('#6b2410',.34)}<ellipse cx="300" cy="430" rx="400" ry="130" fill="url(#fireglow)"/>${[[34,372,1.2],[78,392,1],[120,354,.9],[566,372,1.2],[522,394,1],[478,356,.9]].map(([x,y,s],i)=>flame(x,y,s,i*.17)).join('')}${many(5,i=>`<circle class="smokeb" cx="${[40,110,500,570,300][i]}" cy="330" r="18" style="animation-delay:${(i*.5).toFixed(1)}s"/>`)}${many(14,i=>`<circle class="spark" cx="${int(40+rnd(i)*520)}" cy="${int(330+rnd(i+3)*60)}" r="2.2" style="--x:${int(rnd(i+9)*60-30)}px;${delay(i,20,1.4)}"/>`)}${fail.includes('walls-burn')?many(7,i=>flame(166+i*44,300,1.4,i*.11,'onfire')):''}${fail.includes('roof-burn')?many(6,i=>flame(192+i*48,180,1.3,i*.13,'onfire')):''}`,
  flood:()=>`${tint('#2f4a63',.32)}${rain(34)}<g class="water"><g class="swell"><path d="${wavePath(306)}" fill="#3e9be0" fill-opacity=".82"/></g><g class="swell w2"><path d="${wavePath(318)}" fill="#7cc4f5" fill-opacity=".55"/></g><g class="swell w3"><path d="M-120 306${'q30-10 60 0t60 0'.repeat(14)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-dasharray="14 22"/></g>${plank(118,312,-8,74)}${plank(484,318,10,64)}${barrel}<g transform="translate(250 318)"><g class="float" style="animation-delay:-1.2s"><text font-size="26" text-anchor="middle">🦆</text></g></g></g>`,
  snow:()=>`${tint('#8aa0b8',.3)}<rect class="snowfloor" y="326" width="600" height="94" fill="#fff"/>${many(46,i=>`<circle class="flake" cx="${int(rnd(i+60)*600)}" cy="-10" r="${(2+rnd(i+90)*2.5).toFixed(1)}" style="${delay(i,0,3)};animation-duration:${(2.4+rnd(i+5)*1.6).toFixed(1)}s"/>`)}`
 };

 // --- walls: twelve blocks (6 x 2) that fall and pile up ---
 function wall(art,mode){
  const burn=mode==='burn';
  return `<defs><g id="wallart">${art}</g></defs>${many(12,i=>{
   const x=150+(i%6)*50,y=176+(i>5?62:0),low=i>5;
   const dx=int((rnd(i+40)-.5)*50),dy=low?int(rnd(i+20)*8)-3:55+int(rnd(i+20)*14),r=int((rnd(i+70)-.5)*(low?36:110)),t=(rnd(i+10)*.35).toFixed(2);
   return `<clipPath id="wc${i}"><rect x="${x}" y="${y}" width="50" height="62"/></clipPath><g class="chunk" style="--dx:${dx}px;--dy:${dy}px;--r:${r}deg;--t:${t}s;transform-origin:${x+25}px ${y+31}px"><use href="#wallart" clip-path="url(#wc${i})"/>${burn?`<rect class="soot" x="${x}" y="${y}" width="50" height="62"/>`:''}</g>`;
  })}`;
 }
 const strawBits=burn=>many(80,i=>`<path d="M${int(130+rnd(i)*350)} ${int(268+rnd(i+200)*32)}l${int(8+rnd(i+5)*12)} ${int(rnd(i+7)*16-8)}" stroke="${burn?['#3b2d22','#15100c','#54402f'][i%3]:i%3?'#d6a93d':'#fbe9a6'}" stroke-width="2.6" stroke-linecap="round"/>`);
 const logHeap=burn=>many(9,i=>{
  const w=int(84+rnd(i+2)*28),f=burn?(i%2?'#2a1c13':'#1d130d'):(i%2?'#c68642':'#b97a3a'),s=burn?'#0f0a07':'#7d4b20';
  return `<g transform="translate(${int(165+i*34+rnd(i)*10)} ${int(290-rnd(i+4)*16-(i%3)*4)}) rotate(${int((rnd(i+8)-.5)*56)})"><rect x="${-w/2}" y="-7.5" width="${w}" height="15" rx="7" fill="${f}" stroke="${s}" stroke-width="2"/><ellipse cx="${w/2-3}" rx="5" ry="6.5" fill="${burn?'#3a2a1f':'#e6b883'}" stroke="${s}" stroke-width="1.5"/></g>`;
 });
 const brickHeap=burn=>many(22,i=>`<rect x="${int(140+rnd(i)*310)}" y="${int(274+rnd(i+30)*24)}" width="34" height="16" rx="2" fill="${burn?'#2a211b':'#cf5b3f'}" stroke="${burn?'#0f0a07':'#8f3a27'}" stroke-width="2" transform="rotate(${int((rnd(i+8)-.5)*50)} ${int(150+rnd(i)*310)} 290)"/>`);
 const heap='M118 304Q150 270 215 278Q270 252 330 274Q395 262 442 282Q472 292 492 304Z';
 const smolder=(xs,y)=>`<g class="smolder">${xs.map((x,i)=>`<circle cx="${x}" cy="${y}" r="16" style="animation-delay:${i}s"/>`).join('')}</g>`;
 const embers=()=>many(16,i=>`<circle class="ember" cx="${int(150+rnd(i+50)*300)}" cy="${int(278+rnd(i+60)*22)}" r="${(2+rnd(i)*1.8).toFixed(1)}" style="${delay(i,0,.8)}"/>`);
 // What is left of a fallen wall depends on what it was built of: straw, logs or bricks.
 function rubble(material,mode,cls){
  const burn=mode==='burn',body=[()=>`<path d="${heap}" fill="${burn?'#2b221b':'#e9c95c'}" stroke="${burn?'#120d09':'#c99b2d'}" stroke-width="3"/>${strawBits(burn)}`,()=>logHeap(burn),()=>brickHeap(burn)][material]();
  const puffs=cls==='fail'?many(9,i=>`<circle class="puff${burn?' ash':''}" cx="${130+i*42}" cy="${296+int(rnd(i+5)*14)}" r="${int(16+rnd(i+9)*14)}" style="--t:${(rnd(i+3)*.4).toFixed(2)}s"/>`):'';
  return `<g class="rubble ${cls} ${mode}"><ellipse cx="305" cy="303" rx="195" ry="9" fill="#000" opacity=".2"/>${body}${burn?embers():''}</g>${puffs?`<g class="puffs ${mode}">${puffs}</g>`:''}${burn&&cls==='dead'?smolder([210,300,390],270):''}`;
 }
 // Mud and a water line on the wall after a flood.
 const stain='<path class="stain" d="M150 272Q165 260 180 270T210 268T240 272T270 264T300 272T330 266T360 272T390 264T420 272T450 268V300H150Z"/>';
 const mud='<g class="mud"><ellipse cx="226" cy="352" rx="70" ry="12"/><ellipse cx="424" cy="372" rx="80" ry="14"/><ellipse cx="330" cy="400" rx="120" ry="11"/><ellipse cx="96" cy="336" rx="40" ry="8"/></g>';

 // --- foundation: cracks run up the house, the ground opens below it ---
 // Cracks run through the gaps between windows and door; a pale edge makes them look cut into the wall.
 const crackLines='<path d="M252 300l-5-18 7-14-6-16 8-14-5-18 6-12M247 282l-9-6M254 268l9-5"/><path d="M346 300l6-16-7-14 7-16-6-14 6-18M352 284l9-4"/><path d="M180 204l12-14 10 8 14-12"/><path d="M406 204l-10-12 12-8-8-10"/><path d="M236 296l8 14-9 12M372 296l-6 16 11 10"/><path d="M156 300l8-14-5-12M444 300l-8-14 5-12"/>';
 const cracks=`<g class="cracks"><g class="hl" transform="translate(1.6 0)">${crackLines}</g>${crackLines}</g>`;
 const fissure=cls=>`<path class="fissure ${cls}" d="M104 330L150 326L190 336L240 328L300 340L360 330L420 338L470 326L500 332V346L440 342L380 350L320 346L260 352L200 344L140 348L104 340Z"/>`;

 // --- roof: the branches fly apart, burn down to the rafters, or cave in under the snow ---
 const rafters=`<g class="rafters"><path d="M106 192L170 94M494 192L430 94M170 94H430M132 152H468M300 94V152"/>${many(9,i=>`<path d="M${112+i*47} 192L${int(172+i*32.4)} 94"/>`)}</g>`;
 function fly(roof,extra){
  return `<defs><g id="roofart">${roof}</g></defs>${many(5,i=>{
   const x=100+i*80,dx=int(120+rnd(i+11)*200),dy=-int(50+rnd(i+13)*220),r=int((rnd(i+15)-.5)*260),t=(i*.05+rnd(i+17)*.15).toFixed(2);
   return `<clipPath id="rc${i}"><rect x="${x}" y="86" width="80" height="112"/></clipPath><g class="chunk" style="--dx:${dx}px;--dy:${dy}px;--r:${r}deg;--t:${t}s;--op:0;transform-origin:${x+40}px 140px"><use href="#roofart" clip-path="url(#rc${i})"/></g>`;
  })}<g class="chunk" style="--dx:210px;--dy:-260px;--r:70deg;--t:.1s;--op:0;transform-origin:300px 70px">${extra}</g>`;
 }
 const hole='<g class="hole"><path d="M226 136L250 110L270 124L292 104L314 120L338 106L362 124L380 118L376 152L358 172L330 160L304 178L280 162L252 174L234 162Z" fill="#1d140f"/><path d="M244 160L296 126M336 118L356 170M262 172L330 134" stroke="#8a5a35" stroke-width="7" stroke-linecap="round"/><path d="M250 176Q300 146 356 172Z" fill="#fff"/><g fill="#fff"><circle cx="250" cy="110" r="9"/><circle cx="292" cy="104" r="10"/><circle cx="338" cy="106" r="9"/><circle cx="378" cy="120" r="9"/><circle cx="228" cy="138" r="8"/></g><g fill="#c9482f" stroke="#9c3220" stroke-width="1.5"><path d="M214 146l14-8 6 12z"/><path d="M386 140l14-4-2 14z"/><path d="M300 190l12-6 4 12z"/></g></g>';

 return{rnd,modes,layers,wall,rubble,stain,mud,cracks,fissure,rafters,fly,hole,snowcap,smolder,mode:(stage,hazard)=>modes[stage]?.[hazard]};
})();
