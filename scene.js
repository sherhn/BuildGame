/* Cartoon house in front view, drawn as SVG strings. No images or remote assets. Damage lives in damage.js. */
window.Scene=(()=>{
 'use strict';
 const colors=[
 {id:'red',name:'Красный',hex:'#ef4b5f'},{id:'orange',name:'Оранжевый',hex:'#ff9a3c'},{id:'green',name:'Зелёный',hex:'#2fbf71'},
 {id:'blue',name:'Синий',hex:'#3b8cf0'},{id:'purple',name:'Фиолетовый',hex:'#9b5de5'},{id:'pink',name:'Розовый',hex:'#ff6fb1'}];
 const ids=['foundation','walls','roof','windows','yard','extra'];
 // x, y, width, height of every part: the area that is revealed while it is being built.
 const box={foundation:[96,286,408,48],walls:[140,170,320,134],roof:[96,86,408,110],windows:[140,196,320,112],yard:[0,200,600,220],extra:[160,6,280,150]};
 const {rnd}=Damage;
 const int=v=>Math.round(v);
 const ROOF='M106 192L170 94H430L494 192Z';

 const sand=()=>{
  let g='<path d="M100 332Q116 316 140 306Q172 294 218 296H382Q428 294 460 306Q484 316 500 332Z" fill="#f0d48c" stroke="#d2ad60" stroke-width="3"/><path d="M150 302Q220 296 300 298T450 302" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>';
  for(let i=0;i<46;i++)g+=`<circle cx="${int(150+rnd(i)*300)}" cy="${int(311+rnd(i+90)*16)}" r="${(1.4+rnd(i+9)*1.6).toFixed(1)}" fill="#cfa85a" opacity=".75"/>`;
  return g;
 };
 const stones=()=>{
  const tone=['#a8aeb5','#bcc1c7','#979ea6'];let g='';
  for(let row=0;row<2;row++){
   let x=128,i=0;
   while(x<472){
    let w=row&&!i?22:34+int(rnd(row*9+i)*18);
    if(472-(x+w)<14)w=472-x;
    g+=`<rect x="${x}" y="${296+row*15}" width="${w}" height="15" rx="6" fill="${tone[(i+row)%3]}" stroke="#6f767e" stroke-width="1.5"/><path d="M${x+5} ${299+row*15}h${Math.max(0,w-12)}" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>`;
    x+=w;i++;
   }
  }
  return g;
 };
 const slab=()=>'<rect x="120" y="296" width="360" height="32" rx="5" fill="#cdd3d8" stroke="#8f989f" stroke-width="3"/><rect x="123" y="299" width="354" height="8" rx="3" fill="#e7ebee"/><path d="M210 310V326M300 310V326M390 310V326" stroke="#aab3ba" stroke-width="2"/><path d="M123 322H477" stroke="#000" stroke-opacity=".12" stroke-width="4"/>';

 // Light comes from the left: a soft shade to the right and a little darkness where the wall meets the ground.
 const shade='<rect x="150" y="176" width="300" height="124" fill="url(#wallshade)"/><rect x="150" y="176" width="300" height="124" fill="url(#wallao)"/>';
 const straw=()=>{
  let g='<rect x="150" y="176" width="300" height="124" fill="#f2d36b" stroke="#c99b2d" stroke-width="3"/>';
  for(let i=0;i<90;i++)g+=`<path d="M${int(158+rnd(i)*274)} ${int(182+rnd(i+200)*112)}l${int(7+rnd(i+5)*9)} ${int(rnd(i+7)*14-7)}" stroke="${i%3?'#d6a93d':'#fbe9a6'}" stroke-width="2.6" stroke-linecap="round"/>`;
  return g+shade;
 };
 const logs=()=>{
  let g='';
  for(let r=0;r<8;r++){
   const y=176+r*15.5,end=x=>`<ellipse cx="${x}" cy="${y+7.5}" rx="5" ry="6.5" fill="#e6b883" stroke="#7d4b20" stroke-width="1.5"/>`;
   g+=`<rect x="143" y="${y}" width="314" height="15" rx="7" fill="${r%2?'#c68642':'#b97a3a'}" stroke="#7d4b20" stroke-width="2"/><path d="M156 ${y+4}H444" stroke="#fff" stroke-opacity=".18" stroke-width="2" stroke-linecap="round"/>${end(150)}${end(450)}`;
  }
  return g+shade;
 };
 const bricks=()=>`<rect x="150" y="176" width="300" height="124" fill="url(#brick)" stroke="#8f3a27" stroke-width="3"/>${shade}`;

 const roofTop=inner=>`${inner}<path d="${ROOF}" fill="url(#roofshade)"/><path d="${ROOF}" fill="none" stroke="#0003" stroke-width="4" stroke-linejoin="round"/><path d="M110 189L494 189" stroke="#fff" stroke-opacity=".28" stroke-width="3"/><rect x="166" y="90" width="268" height="9" rx="4" fill="#0003"/><rect x="170" y="92" width="260" height="3" rx="1.5" fill="#fff" opacity=".3"/><rect x="150" y="192" width="300" height="9" fill="#000" opacity=".16"/>`;
 const branches=()=>{
  const c=['#4f7f2f','#8cbf4a','#a6d35a','#5f8f33'];
  let g=`<path d="${ROOF}" fill="#6f9a3a"/><g clip-path="url(#roofclip)">`;
  for(let i=0;i<80;i++){const x=int(106+rnd(i)*388),y=int(92+rnd(i+300)*100);g+=`<ellipse cx="${x}" cy="${y}" rx="10" ry="4.5" transform="rotate(${int(rnd(i+9)*160-80)} ${x} ${y})" fill="${c[i%4]}"/>`;}
  return roofTop(`${g}</g><path d="M130 160L250 108M300 180L410 118M200 182L360 100" stroke="#7a5a34" stroke-width="3" stroke-linecap="round"/>`);
 };
 const tiles=()=>roofTop(`<path d="${ROOF}" fill="url(#tiles)"/>`);
 const metal=()=>roofTop(`<path d="${ROOF}" fill="url(#metal)"/><path d="${ROOF}" fill="url(#sheen)"/>`);

 const WX=[176,362],WY=208;
 const pane=x=>`<rect x="${x-4}" y="${WY-4}" width="70" height="66" rx="6" fill="#fff" stroke="#9fb4c4" stroke-width="2"/><rect x="${x}" y="${WY}" width="62" height="58" rx="3" fill="url(#glassG)"/><rect x="${x}" y="${WY}" width="62" height="9" rx="3" fill="#2d5f86" opacity=".22"/><path d="M${x+31} ${WY}V${WY+58}M${x} ${WY+29}H${x+62}" stroke="#fff" stroke-width="4"/><path d="M${x+7} ${WY+22}L${x+22} ${WY+7}M${x+36} ${WY+50}L${x+54} ${WY+34}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/><rect x="${x-7}" y="${WY+62}" width="76" height="6" rx="2" fill="#eef2f5" stroke="#9fb4c4" stroke-width="1.5"/>`;
 const door=(c,inner)=>`<rect x="262" y="298" width="76" height="6" rx="2" fill="#d4d9dd" stroke="#8f989f" stroke-width="1.5"/><rect x="270" y="230" width="60" height="70" rx="5" fill="${c}" stroke="#0005" stroke-width="3"/><rect x="270" y="270" width="60" height="30" rx="4" fill="#000" opacity=".1"/>${inner}<circle cx="322" cy="270" r="4" fill="#ffd84d" stroke="#a37b00"/><circle cx="321" cy="269" r="1.4" fill="#fff"/>`;
 const panels='<rect x="278" y="240" width="18" height="24" rx="3" fill="#fff" opacity=".28"/><rect x="304" y="240" width="18" height="24" rx="3" fill="#fff" opacity=".28"/><rect x="278" y="272" width="44" height="20" rx="3" fill="#fff" opacity=".18"/>';
 const plain=c=>WX.map(pane).join('')+door(c,panels);
 const shutters=c=>{
  const slat=sx=>Array.from({length:7},(_,k)=>`M${sx+3} ${WY+4+k*9}H${sx+15}`).join('');
  const blooms=x=>['#ff6fb1','#ffd23f','#fff','#ff7b54','#c77dff'].map((f,k)=>`<circle cx="${x+4+k*14}" cy="${WY+66}" r="5" fill="${f}"/>`).join('');
  return WX.map(x=>`${pane(x)}${[x-24,x+70].map(sx=>`<rect x="${sx}" y="${WY-4}" width="18" height="66" rx="3" fill="${c}" stroke="#0004" stroke-width="2"/><path d="${slat(sx)}" stroke="#fff" stroke-opacity=".4" stroke-width="2"/>`).join('')}<rect x="${x-6}" y="${WY+66}" width="74" height="12" rx="3" fill="#8a5a35"/>${blooms(x)}`).join('')
   +door(c,'<circle cx="300" cy="252" r="10" fill="url(#glassG)" stroke="#fff" stroke-width="3"/><rect x="280" y="272" width="40" height="20" rx="3" fill="#fff" opacity=".18"/>');
 };
 // Stained glass: a gold diamond with a red heart on blue, green corners, dark lead between the pieces.
 const stained=c=>{
  const arch=x=>`M${x} ${WY+58}V${WY+31}A31 31 0 0 1 ${x+62} ${WY+31}V${WY+58}Z`;
  const win=x=>{
   const cx=x+31,cy=WY+30;
   return `<clipPath id="arch${x}"><path d="${arch(x)}"/></clipPath><g clip-path="url(#arch${x})"><rect x="${x}" y="${WY}" width="62" height="58" fill="#2f5fb8"/><path d="M${x} ${WY}h22l-22 22zM${x+62} ${WY}h-22l22 22zM${x} ${WY+58}h22l-22-22zM${x+62} ${WY+58}h-22l22-22z" fill="#3fae6a"/><path d="M${cx} ${cy-23}L${cx+23} ${cy}L${cx} ${cy+23}L${cx-23} ${cy}Z" fill="#ffd24a"/><path d="M${cx} ${cy-12}L${cx+12} ${cy}L${cx} ${cy+12}L${cx-12} ${cy}Z" fill="#e0475b"/><path d="M${cx} ${WY}V${WY+58}M${x} ${cy}H${x+62}M${cx} ${cy-23}L${cx+23} ${cy}L${cx} ${cy+23}L${cx-23} ${cy}ZM${cx} ${cy-12}L${cx+12} ${cy}L${cx} ${cy+12}L${cx-12} ${cy}Z" fill="none" stroke="#1d2433" stroke-opacity=".75" stroke-width="2.4" stroke-linejoin="round"/><path d="M${x+8} ${WY+24}L${x+22} ${WY+8}" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/></g><path d="${arch(x)}" fill="none" stroke="#fff" stroke-width="4"/><rect x="${x-6}" y="${WY+60}" width="74" height="6" rx="2" fill="#eef2f5" stroke="#9fb4c4" stroke-width="1.5"/>`;
  };
  return WX.map(win).join('')
   +`<rect x="262" y="298" width="76" height="6" rx="2" fill="#d4d9dd" stroke="#8f989f" stroke-width="1.5"/><path d="M268 300V258A32 28 0 0 1 332 258V300Z" fill="${c}" stroke="#fff" stroke-width="4"/><path d="M268 300V258A32 28 0 0 1 332 258V300Z" fill="url(#wallao)"/><path d="M277 300V261A23 20 0 0 1 323 261V300Z" fill="none" stroke="#ffd84d" stroke-width="3"/><circle cx="318" cy="272" r="4" fill="#ffd84d" stroke="#a37b00"/>`
   +'<g class="decor flicker"><circle cx="346" cy="254" r="15" fill="#ffe98a" opacity=".4"/><path d="M346 238V244" stroke="#6b4b2a" stroke-width="3"/><rect x="341" y="244" width="10" height="16" rx="3" fill="#ffe98a" stroke="#8a6a1e" stroke-width="2"/></g>';
 };

 const flower=(x,y,c)=>`<path d="M${x} ${y}V${y+14}" stroke="#2e8b3d" stroke-width="2.5"/><path d="M${x} ${y+10}q-8-2-9-8M${x} ${y+11}q8-2 9-8" fill="none" stroke="#2e8b3d" stroke-width="2"/><circle cx="${x}" cy="${y}" r="5" fill="${c}"/><circle cx="${x}" cy="${y}" r="2" fill="#ffe27a"/>`;
 const bed=x=>`<rect x="${x}" y="332" width="92" height="14" rx="6" fill="#7b5230"/><rect x="${x}" y="332" width="92" height="5" rx="3" fill="#a07048"/>${['#ff6fb1','#ffd23f','#fff','#ff7b54','#c77dff'].map((c,k)=>flower(x+10+k*18,326+(k%2)*3,c)).join('')}`;
 // The crown sways (see .tree in style.css) around the foot of the trunk, which is the origin of this group.
 const tree=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="16" cy="4" rx="44" ry="10" fill="#1f5a1c" opacity=".28"/><g class="tree"><rect x="-8" y="-70" width="16" height="72" rx="5" fill="#8a5a35"/><rect x="2" y="-70" width="6" height="72" rx="3" fill="#6b4326" opacity=".45"/><path d="M0-40L-18-60M2-52L20-72" stroke="#8a5a35" stroke-width="5" stroke-linecap="round"/><circle cy="-92" r="38" fill="#37a24b"/><circle cx="-26" cy="-72" r="26" fill="#43b257"/><circle cx="26" cy="-74" r="26" fill="#2b8a40"/><circle cx="14" cy="-84" r="22" fill="#2f9444"/><circle cx="-8" cy="-104" r="15" fill="#5fd078" opacity=".75"/><circle cx="-22" cy="-82" r="9" fill="#6fe08a" opacity=".6"/><circle cx="24" cy="-66" r="5" fill="#e8483c"/><circle cx="-4" cy="-62" r="5" fill="#e8483c"/></g></g>`;
 const path='<path d="M272 326H328L352 420H248Z" fill="#e8d5a8" stroke="#c9b07e" stroke-width="3"/><path d="M262 352H338M255 382H345M251 408H349" stroke="#c9b07e" stroke-width="3"/><path d="M278 326L258 420" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>';
 const fence=()=>{
  let g='<rect x="0" y="390" width="244" height="5" fill="#eef3f6"/><rect x="0" y="406" width="244" height="5" fill="#eef3f6"/><rect x="356" y="390" width="244" height="5" fill="#eef3f6"/><rect x="356" y="406" width="244" height="5" fill="#eef3f6"/>';
  for(let x=6;x<594;x+=22){if(x>238&&x<346)continue;g+=`<path d="M${x} 380L${x+7} 372L${x+14} 380V416H${x}Z" fill="#fff" stroke="#c3ced6" stroke-width="1.5"/><path d="M${x+7} 372L${x+14} 380V416H${x+7}Z" fill="#dfe8ee"/>`;}
  return g;
 };
 const fountain='<g class="decor"><ellipse cx="505" cy="352" rx="46" ry="13" fill="#b9c2c9" stroke="#8b959d" stroke-width="3"/><ellipse cx="505" cy="350" rx="38" ry="9" fill="#6fc3ff"/><rect x="499" y="320" width="12" height="30" rx="4" fill="#b9c2c9" stroke="#8b959d" stroke-width="2"/><ellipse cx="505" cy="322" rx="16" ry="5" fill="#cfd6db" stroke="#8b959d" stroke-width="2"/><path class="jet" d="M505 318Q480 296 468 340M505 318Q530 296 542 340M505 318V292" fill="none" stroke="#bfe9ff" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 6"/></g>';

 const flag=c=>`<path d="M300 94V46" stroke="#6b4b2a" stroke-width="4" stroke-linecap="round"/><path class="decor wave" d="M300 48L348 60L300 76Z" fill="${c}" stroke="#0004" stroke-width="2"/>`;
 const chimney='<rect x="370" y="60" width="32" height="84" fill="url(#brick)" stroke="#8f3a27" stroke-width="3"/><rect x="386" y="60" width="16" height="84" fill="#000" opacity=".14"/><rect x="364" y="54" width="44" height="12" rx="3" fill="#8d3d2c"/><rect x="368" y="138" width="36" height="8" fill="#000" opacity=".22"/><g class="decor"><circle class="smoke s1" cx="386" cy="44" r="9"/><circle class="smoke s2" cx="386" cy="44" r="9"/><circle class="smoke s3" cx="386" cy="44" r="9"/></g>';
 const solar=()=>{
  let g='';
  for(let r=0;r<2;r++)for(let k=0;k<4;k++){const x=202+k*50,y=110+r*32;g+=`<rect x="${x}" y="${y}" width="46" height="28" rx="2" fill="#1f4e8c" stroke="#d3e2f0" stroke-width="2"/><path d="M${x+15} ${y}V${y+28}M${x+31} ${y}V${y+28}M${x} ${y+14}H${x+46}" stroke="#4d86c6" stroke-width="1.5"/><path d="M${x+4} ${y+8}L${x+14} ${y+3}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`;}
  return g;
 };

 // One drawing per stage; the index of the choice picks the variant.
 const parts={
  foundation:p=>[sand,stones,slab][p](),
  walls:p=>[straw,logs,bricks][p](),
  roof:p=>[branches,tiles,metal][p](),
  windows:(p,c)=>[plain,shutters,stained][p](c),
  yard:p=>`${bed(160)}${bed(348)}${p>0?`${path}${tree(62,338,1)}${fence()}`:''}${p>1?`${fountain}<text x="190" y="372" font-size="34">🐕</text>${tree(552,336,.7)}`:''}`,
  extra:(p,c)=>[flag(c),chimney,solar()][p]
 };

 const defs=`<defs>
 <clipPath id="roofclip"><path d="${ROOF}"/></clipPath>
 <pattern id="brick" width="40" height="28" patternUnits="userSpaceOnUse"><rect width="40" height="28" fill="#cf5b3f"/><rect x="2" y="2" width="16" height="10" fill="#dc6d50" opacity=".6"/><rect x="22" y="16" width="14" height="10" fill="#dc6d50" opacity=".6"/><path d="M0 0H40M0 14H40M20 0V14M0 14V28M40 14V28" stroke="#f1e3d3" stroke-width="2.4"/></pattern>
 <pattern id="tiles" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#c9482f"/><g fill="#e2673f" stroke="#9c3220" stroke-width="2"><circle cx="0" cy="0" r="12"/><circle cx="24" cy="0" r="12"/><circle cx="12" cy="12" r="12"/><circle cx="0" cy="24" r="12"/><circle cx="24" cy="24" r="12"/></g></pattern>
 <pattern id="metal" width="26" height="10" patternUnits="userSpaceOnUse"><rect width="26" height="10" fill="#557a9d"/><rect width="3" height="10" fill="#a9c6df"/><rect x="3" width="3" height="10" fill="#37566f"/></pattern>
 <linearGradient id="sheen" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
 <linearGradient id="wallshade" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
 <linearGradient id="wallao" x2="0" y2="1"><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
 <linearGradient id="roofshade" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
 <linearGradient id="glassG" x2="0" y2="1"><stop offset="0" stop-color="#e8f7ff"/><stop offset="1" stop-color="#94cdf2"/></linearGradient>
 <radialGradient id="fireglow"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".75"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
 </defs>`;

 const cone=x=>`<g transform="translate(${x} 0)"><path d="M0 382l8-24 8 24z" fill="#ff7a1a"/><rect x="-3" y="380" width="22" height="5" rx="2" fill="#e8620a"/><path d="M4 368h8" stroke="#fff" stroke-width="3"/></g>`;
 const dirt=`<path d="M100 330Q108 300 150 298H450Q492 300 500 330Q490 354 450 356H150Q110 354 100 330Z" fill="#b98a5c"/><path d="M130 320h18M200 340h22M330 316h20M410 342h24M280 330h16" stroke="#9a6f45" stroke-width="3" stroke-linecap="round"/><path d="M112 300V334M488 300V334" stroke="#f2c94c" stroke-width="5"/><path d="M112 332H488" stroke="#ffd23f" stroke-width="3" stroke-dasharray="14 8"/>`;
 const sign='<path d="M52 382V350M108 382V350" stroke="#8a5a35" stroke-width="5"/><rect x="30" y="326" width="96" height="34" rx="5" fill="#ffd23f" stroke="#2b2b2b" stroke-width="3"/><text x="78" y="349" text-anchor="middle" font-size="16" font-weight="800" fill="#2b2b2b">СТРОЙКА</text>'+cone(134)+cone(470)+'<g><rect x="412" y="372" width="30" height="10" fill="#cf5b3f" stroke="#8f3a27" stroke-width="2"/><rect x="418" y="362" width="30" height="10" fill="#d96a4c" stroke="#8f3a27" stroke-width="2"/><rect x="408" y="382" width="34" height="10" fill="#cf5b3f" stroke="#8f3a27" stroke-width="2"/></g>';
 const crane='<g class="crane"><path d="M528 322V118M552 322V118" stroke="#f2a900" stroke-width="4"/><path d="M528 322L552 300L528 280L552 260L528 240L552 220L528 200L552 180L528 160L552 140L528 118" fill="none" stroke="#f2a900" stroke-width="2.5"/><rect x="440" y="118" width="150" height="14" fill="#ffc933" stroke="#c78a00" stroke-width="3"/><rect x="574" y="118" width="24" height="24" fill="#6b7280"/><rect x="520" y="94" width="40" height="24" rx="4" fill="#ffc933" stroke="#c78a00" stroke-width="3"/><rect x="546" y="99" width="10" height="11" fill="#bfe9ff"/><g class="swing"><path d="M510 132V176" stroke="#444" stroke-width="2"/><rect x="496" y="176" width="28" height="12" rx="2" fill="#c94f3a" stroke="#7d2e20" stroke-width="2"/></g></g>';

 // current = {stage, pick, mode:'ghost'|'building'}: the part being chosen or built right now.
 // trial: the hazard happening now. fail / dead: "stage-mode" strings for parts breaking now / already broken.
 function house({picks=[],color=colors[0].hex,current=null,progress=0,pop=-1,trial=null,fail=[],dead=[]}={}){
  const placed={};
  const put=(stage,pick,cls)=>{const id=ids[stage];placed[id]=`<g class="part ${id} ${cls}" data-part="${id}"${cls==='building'?' clip-path="url(#reveal)"':''}>${parts[id](pick,color)}</g>`;};
  picks.forEach((p,i)=>put(i,p,i===pop?'pop':''));
  if(current)put(current.stage,current.pick,current.mode==='ghost'?'ghost':'building');
  const [bx,by,bw,bh]=current?box[ids[current.stage]]:[0,0,0,0];
  const state=id=>{
   const f=fail.find(x=>x.startsWith(id+'-')),d=f||dead.find(x=>x.startsWith(id+'-'));
   return d?{mode:d.slice(id.length+1),cls:f?'fail':'dead'}:null;
  };
  const base=state('foundation'),walls=state('walls'),roof=state('roof');
  const cls=s=>s?` ${s.cls} ${s.mode}`:'';
  const art=`${placed.walls||''}${placed.windows||''}`;
  // A flood leaves a water line on the wall once it has gone down.
  const body=walls?Damage.wall(art,walls.mode):art+(base&&base.mode==='wash'&&base.cls==='dead'&&placed.walls?Damage.stain:'');
  const roofArt=placed.roof||'',extraArt=placed.extra||'',snow=trial==='snow'&&placed.roof?Damage.snowcap:'';
  const top=!roof?roofArt+extraArt+snow
   :roof.mode==='fly'?Damage.rafters+Damage.fly(roofArt,extraArt)
   :roof.mode==='burn'?`${Damage.rafters}<g class="burnable">${roofArt}${extraArt}<path class="soot" d="${ROOF}"/></g>${roof.cls==='dead'?Damage.smolder([240,300,360],100):''}`
   :roofArt+extraArt+snow+Damage.hole;
  // When the walls go, the roof comes down with them.
  const drop=walls&&{cls:walls.cls,mode:walls.mode==='burn'?'drop late':'drop'};
  const sunk=base&&base.mode==='sink';
  return `<svg class="${['fg',trial&&'hz-'+trial].filter(Boolean).join(' ')}" viewBox="0 0 600 420" role="img" aria-label="Твой дом: построено ${picks.length} из ${ids.length}">${defs}
 <clipPath id="reveal"><rect id="reveal-rect" x="${bx}" width="${bw}" y="${by+bh*(1-progress)}" height="${bh*progress}" data-y="${by}" data-h="${bh}"/></clipPath>
 ${picks.length<6?crane:''}${picks.length<3?`<g class="site">${dirt}${sign}</g>`:''}
 ${base&&base.mode==='wash'&&base.cls==='dead'?Damage.mud:''}${sunk?Damage.fissure(base.cls):''}
 ${picks.length?'<ellipse cx="322" cy="332" rx="216" ry="11" fill="#1f5a1c" opacity=".26"/>':''}
 <g class="house"><g class="tilt${cls(base)}">${placed.foundation||''}<g class="body${cls(walls)}">${body}</g><g class="top${cls(drop)}"><g class="roofx${cls(roof)}">${top}</g></g>${walls?Damage.rubble(picks[1],walls.mode,walls.cls):''}${sunk?Damage.cracks:''}</g></g>
 ${placed.yard||''}
 ${trial?Damage.layers[trial](fail):''}</svg>`;
 }

 // Reveal the part under construction from the bottom up: p goes from 0 to 1.
 function progress(svg,p){
  const r=svg&&svg.querySelector('#reveal-rect');
  if(!r)return;
  const y=+r.dataset.y,h=+r.dataset.h;
  r.setAttribute('y',y+h*(1-p));
  r.setAttribute('height',h*p);
 }

 const house3=(x,y,c)=>`<g opacity=".75"><rect x="${x}" y="${y}" width="22" height="14" fill="${c}"/><path d="M${x-3} ${y}L${x+11} ${y-10}L${x+25} ${y}Z" fill="#b8826c"/></g>`;
 const backdrop=()=>`<svg class="bg" viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
 <defs><linearGradient id="skyG" x2="0" y2="1"><stop offset="0" stop-color="#6fc2ff"/><stop offset="1" stop-color="#dff4ff"/></linearGradient><linearGradient id="grassG" x2="0" y2="1"><stop offset="0" stop-color="#86dd62"/><stop offset="1" stop-color="#58bb48"/></linearGradient><radialGradient id="sunG"><stop offset="0" stop-color="#fff6b0" stop-opacity=".7"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/></radialGradient></defs>
 <rect width="600" height="420" fill="url(#skyG)"/>
 <circle cx="80" cy="64" r="96" fill="url(#sunG)"/>
 <g class="sun decor">${Array.from({length:12},(_,i)=>`<line x1="80" y1="22" x2="80" y2="12" transform="rotate(${i*30} 80 64)" stroke="#ffd84d" stroke-width="5" stroke-linecap="round"/>`).join('')}<circle cx="80" cy="64" r="30" fill="#ffd84d"/><circle cx="80" cy="64" r="22" fill="#ffe680"/></g>
 <g class="cloud decor c1" fill="#fff"><ellipse cx="262" cy="73" rx="40" ry="7" fill="#d8e9f6"/><ellipse cx="260" cy="66" rx="34" ry="16"/><ellipse cx="290" cy="56" rx="28" ry="18"/><ellipse cx="234" cy="60" rx="22" ry="13"/></g>
 <g class="cloud decor c2" fill="#fff" opacity=".92"><ellipse cx="442" cy="44" rx="32" ry="6" fill="#d8e9f6"/><ellipse cx="440" cy="38" rx="26" ry="12"/><ellipse cx="464" cy="30" rx="20" ry="13"/><ellipse cx="420" cy="42" rx="16" ry="9"/></g>
 <path d="M0 300Q90 232 200 270T400 255T600 280V330H0Z" fill="#9bdc8d"/>${house3(160,262,'#e9d9b8')}${house3(404,254,'#f0e2c2')}${house3(436,262,'#d9e6c8')}
 <g fill="#6fb561">${[[40,268,11],[56,274,9],[318,262,10],[336,266,8],[512,276,10],[540,282,12],[96,264,8]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
 <path d="M0 318Q120 272 260 306T600 300V340H0Z" fill="#79c96a"/>
 <rect y="318" width="600" height="102" fill="url(#grassG)"/>
 <g fill="#fff" opacity=".06">${[326,346,366,386,406].map(y=>`<rect y="${y}" width="600" height="10"/>`).join('')}</g>
 <g stroke="#3f9f3a" stroke-width="2.5" stroke-linecap="round" fill="none">${Array.from({length:16},(_,i)=>{const x=int(10+rnd(i+40)*580),y=int(345+rnd(i+70)*68);return `<path d="M${x} ${y}l-3-8M${x} ${y}v-10M${x} ${y}l3-8"/>`;}).join('')}</g></svg>`;

 return{colors,ids,house,progress,backdrop,box:stage=>box[ids[stage]],mode:Damage.mode};
})();
