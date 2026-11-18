// Mesin game, UI, toko, dan pengaturan
const $=id=>document.getElementById(id),fmt=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
const cv=$('c'),cx=cv.getContext('2d'),mini=$('mini').getContext('2d'),bigC=$('big');
let W,H;
function resize(){const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',resize);resize();

const save=loadSave();
let mode='menu',ship=null,t=0,wk=[],wkT=0;
const cam={x:1900,y:1300},keys={},ptr={on:false,x:0,y:0};
const ports=PORTS.map((p,i)=>({...p,id:i,dx:p.x+Math.cos(p.a)*p.r*1.6,dy:p.y+Math.sin(p.a)*p.r*1.6,q:[],tm:3+i}));
const isl=[...ports,...DECOR];
const cur=()=>SHIPS[save.sel];
const cnt=k=>ship.items.filter(i=>i.t===k).length;

function spawn(p){
 if(p.q.length>=8)return;let d;do{d=ports[Math.random()*ports.length|0]}while(d===p);
 const tp=Math.random()<.55?'p':'c';
 p.q.push({t:tp,dest:d.id,pay:Math.round(Math.hypot(p.x-d.x,p.y-d.y)/11*(tp==='p'?1.3:1))});
}
ports.forEach(p=>{for(let i=0;i<4;i++)spawn(p)});

function newShip(){const p=ports[0];ship={x:p.dx,y:p.dy,a:p.a+Math.PI,v:0,items:[],sid:save.sel};cam.x=ship.x;cam.y=ship.y;p.cool=0}

// suara sederhana
let ac;
function beep(k){if(!save.sound)return;try{ac=ac||new(window.AudioContext||webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime;o.connect(g);g.connect(ac.destination);
 if(k==='coin'){o.type='square';o.frequency.setValueAtTime(660,n);o.frequency.setValueAtTime(990,n+.08);g.gain.setValueAtTime(.05,n);g.gain.exponentialRampToValueAtTime(.001,n+.25);o.start(n);o.stop(n+.25)}
 else{o.type='sawtooth';o.frequency.value=110;g.gain.setValueAtTime(.07,n);g.gain.exponentialRampToValueAtTime(.001,n+.7);o.start(n);o.stop(n+.7)}}catch(e){}}
function toast(m){const e=$('toast');e.textContent=m;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),2800)}

function dock(p){
 const S=cur();let gain=0,out=0,inn=0;
 ship.items=ship.items.filter(i=>{if(i.dest===p.id){gain+=i.pay;out++;return false}return true});
 let np=cnt('p'),nc=cnt('c');
 p.q=p.q.filter(i=>{
  if(i.t==='p'&&np<S.pass){np++;ship.items.push(i);inn++;return false}
  if(i.t==='c'&&nc<S.cargo){nc++;ship.items.push(i);inn++;return false}
  return true});
 if(gain){save.money+=gain;writeSave(save);beep('coin')}
 if(out||inn){beep('horn');toast(`${p.name}: turun ${out}, naik ${inn}${gain?' · +'+fmt(gain):''}`)}
 else if(p.q.length&&!out){toast(`${p.name}: muatan penuh, antar dulu yang di kapal`)}
}

function update(dt){
 const S=cur();let thr=0,turn=0;
 if(keys.ArrowUp||keys.w)thr=1;if(keys.ArrowDown||keys.s)thr=-.6;
 if(keys.ArrowLeft||keys.a)turn=-1;if(keys.ArrowRight||keys.d)turn=1;
 if(ptr.on){const dx=ptr.x-(ship.x-cam.x+W/2),dy=ptr.y-(ship.y-cam.y+H/2);let df=Math.atan2(dy,dx)-ship.a;df=Math.atan2(Math.sin(df),Math.cos(df));turn=Math.max(-1,Math.min(1,df*3));thr=Math.hypot(dx,dy)>50?1:0}
 ship.a+=turn*dt*1.6*Math.min(1,.3+Math.abs(ship.v)/70);
 ship.v+=thr*S.speed*.8*dt;ship.v*=Math.pow(.45,dt);
 ship.x+=Math.cos(ship.a)*ship.v*dt;ship.y+=Math.sin(ship.a)*ship.v*dt;
 isl.forEach(i=>{const dx=ship.x-i.x,dy=ship.y-i.y,d=Math.hypot(dx,dy),an=Math.atan2(dy,dx),rb=edgeR(i,an)*1.12+12;
  if(d<rb){ship.x=i.x+Math.cos(an)*rb;ship.y=i.y+Math.sin(an)*rb;ship.v*=.6}});
 ship.x=Math.max(30,Math.min(WORLD.w-30,ship.x));ship.y=Math.max(30,Math.min(WORLD.h-30,ship.y));
 wkT+=dt;
 if(Math.abs(ship.v)>25&&wkT>.06){wkT=0;wk.push({x:ship.x-Math.cos(ship.a)*S.len*.45,y:ship.y-Math.sin(ship.a)*S.len*.45,l:1})}
 wk.forEach(w=>w.l-=dt*.8);wk=wk.filter(w=>w.l>0);
 ports.forEach(p=>{
  p.tm-=dt;if(p.tm<=0){p.tm=5+Math.random()*4;spawn(p)}
  p.cool=(p.cool||0)-dt;
  if(p.cool<=0&&Math.hypot(ship.x-p.dx,ship.y-p.dy)<85&&Math.abs(ship.v)<70){dock(p);p.cool=1.5}});
 cam.x+=(ship.x-cam.x)*.1;cam.y+=(ship.y-cam.y)*.1;
}

function targetPort(){
 if(ship.items.length){let b=null,bd=1e9;ship.items.forEach(i=>{const p=ports[i.dest],d=Math.hypot(p.dx-ship.x,p.dy-ship.y);if(d<bd){bd=d;b=p}});return b}
 let b=null,bd=1e9;ports.forEach(p=>{const d=Math.hypot(p.dx-ship.x,p.dy-ship.y)-p.q.length*120;if(p.q.length&&d<bd){bd=d;b=p}});return b;
}

function render(){
 const S=cur();
 if(mode!=='play'){cam.x=1900+Math.cos(t*.04)*1100;cam.y=1300+Math.sin(t*.06)*700}
 const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#127395');g.addColorStop(1,'#0a4766');cx.fillStyle=g;cx.fillRect(0,0,W,H);
 cx.save();cx.translate(W/2-cam.x,H/2-cam.y);
 if(save.waves){
  const st=110,x0=Math.floor((cam.x-W/2)/st)*st,y0=Math.floor((cam.y-H/2)/st)*st;
  cx.strokeStyle='rgba(255,255,255,.15)';cx.lineWidth=2;cx.beginPath();
  for(let gx=x0;gx<cam.x+W/2+st;gx+=st)for(let gy=y0;gy<cam.y+H/2+st;gy+=st){
   const ox=Math.sin(gx*.013+gy*.007)*34,oy=Math.cos(gx*.009-gy*.011)*34,x=gx+ox,y=gy+oy;
   cx.moveTo(x,y);cx.quadraticCurveTo(x+14,y-5+Math.sin(t*1.5+gx*.01+gy*.02)*3,x+28,y)}
  cx.stroke();
 }
 cx.strokeStyle='rgba(255,255,255,.5)';cx.lineWidth=3;cx.setLineDash([16,12]);cx.strokeRect(0,0,WORLD.w,WORLD.h);cx.setLineDash([]);
 isl.forEach(i=>{if(Math.abs(i.x-cam.x)<W/2+i.r*2&&Math.abs(i.y-cam.y)<H/2+i.r*2){drawIsland(cx,i);if(i.name)drawPort(cx,i,t)}});
 wk.forEach(w=>{cx.fillStyle=`rgba(255,255,255,${w.l*.35})`;cx.beginPath();cx.arc(w.x,w.y,3+(1-w.l)*11,0,7);cx.fill()});
 if(mode==='play'){
  drawShip(cx,S,ship.x,ship.y,ship.a,1);
  const tp=targetPort();
  if(tp){const an=Math.atan2(tp.dy-ship.y,tp.dx-ship.x),d=Math.hypot(tp.dx-ship.x,tp.dy-ship.y);
   if(d>140){cx.save();cx.translate(ship.x+Math.cos(an)*75,ship.y+Math.sin(an)*75);cx.rotate(an);cx.fillStyle='#f2b84b';cx.strokeStyle='#0a3d56';cx.lineWidth=2;
    cx.beginPath();cx.moveTo(14,0);cx.lineTo(-8,9);cx.lineTo(-8,-9);cx.closePath();cx.fill();cx.stroke();cx.restore()}}
 }
 cx.textAlign='center';cx.lineJoin='round';
 ports.forEach(p=>{if(Math.abs(p.x-cam.x)>W/2+200||Math.abs(p.y-cam.y)>H/2+250)return;
  const np=p.q.filter(i=>i.t==='p').length,nc=p.q.length-np,y=p.y-p.r*1.5;
  cx.font='bold 17px Trebuchet MS';cx.strokeStyle='#0a3d56';cx.lineWidth=4;cx.strokeText(p.name,p.x,y);cx.fillStyle='#fff';cx.fillText(p.name,p.x,y);
  cx.font='13px Trebuchet MS';const s=`👥 ${np}   📦 ${nc}`;cx.strokeText(s,p.x,y+18);cx.fillStyle='#f6e7b4';cx.fillText(s,p.x,y+18)});
 cx.restore();
 if(mode!=='play'){const k=Math.min(4,W/230);drawShip(cx,S,W*.7,H*.55+Math.sin(t*1.3)*6,-.25+Math.sin(t*.9)*.04,k)}
 else hud();
}

function hud(){
 const S=cur();
 $('hMoney').textContent=fmt(save.money);
 $('hPass').textContent=`Penumpang ${cnt('p')}/${S.pass}`;
 $('hCargo').textContent=`Kargo ${cnt('c')}/${S.cargo}`;
 const m={};ship.items.forEach(i=>m[i.dest]=(m[i.dest]||0)+1);
 const s=Object.keys(m).map(d=>`${ports[d].name} ×${m[d]}`).join(' · ');
 const el=$('hDest');if(el.textContent!==(s&&'Tujuan: '+s))el.textContent=s?'Tujuan: '+s:'';
 if(save.mini)drawMap(mini,200,133,false);
 if(!$('mapov').classList.contains('hide'))drawMap(bigC.getContext('2d'),bigC.width,bigC.height,true);
}
function drawMap(c,w,h,big){
 const sx=w/WORLD.w,sy=h/WORLD.h,want=new Set(ship.items.map(i=>i.dest));
 c.fillStyle='#0c4b69';c.fillRect(0,0,w,h);
 isl.forEach(i=>{c.fillStyle=i.name?'#4f9a56':'#d9c58a';c.beginPath();c.arc(i.x*sx,i.y*sy,Math.max(3,i.r*sx*1.1),0,7);c.fill()});
 c.textAlign='center';
 ports.forEach(p=>{const x=p.dx*sx,y=p.dy*sy,w2=want.has(p.id);c.fillStyle=w2?'#f2b84b':'#fff';c.beginPath();c.arc(x,y,w2?(big?7:4):(big?4:2.5),0,7);c.fill();
  if(big){c.fillStyle='#fff';c.font='bold 14px Trebuchet MS';c.fillText(`${p.name} (${p.q.length})`,x,y-12)}});
 c.save();c.translate(ship.x*sx,ship.y*sy);c.rotate(ship.a);c.fillStyle='#e2563f';c.beginPath();
 const z=big?1.6:1;c.moveTo(6*z,0);c.lineTo(-4*z,4*z);c.lineTo(-4*z,-4*z);c.fill();c.restore();
 c.strokeStyle='rgba(255,255,255,.5)';c.strokeRect(.5,.5,w-1,h-1);
}
function openMap(){const s=Math.min(innerWidth*.92,innerHeight*.88*1.5);bigC.width=s;bigC.height=s/1.5;bigC.style.width=s+'px';bigC.style.height=s/1.5+'px';$('mapov').classList.remove('hide')}
function toggleMap(){$('mapov').classList.contains('hide')?openMap():$('mapov').classList.add('hide')}

// layar
function show(id){['menu','shop','settings'].forEach(s=>$(s).classList.toggle('hide',s!==id));$('hud').classList.add('hide');$('mapov').classList.add('hide');mode='menu';if(id==='menu')$('mMoney').textContent='Uang: '+fmt(save.money)}
function play(){if(!ship||ship.sid!==save.sel)newShip();mode='play';['menu','shop','settings'].forEach(s=>$(s).classList.add('hide'));$('hud').classList.remove('hide');$('mini').classList.toggle('hide',!save.mini);toast('Sandar di dermaga untuk naik muatan')}
$('bPlay').onclick=play;$('bShop').onclick=()=>{renderShop();show('shop')};$('bSet').onclick=()=>{syncSet();show('settings')};
$('shopBack').onclick=$('setBack').onclick=$('bMenu').onclick=()=>show('menu');
$('bMap').onclick=toggleMap;$('mapov').onclick=()=>$('mapov').classList.add('hide');

function renderShop(){
 $('shopMoney').textContent=fmt(save.money);const g=$('shopList');g.innerHTML='';
 const bar=(l,v,m)=>`<div class="bar"><span>${l}</span><em><i style="width:${v/m*100}%"></i></em></div>`;
 SHIPS.forEach(s=>{
  const own=save.owned.includes(s.id),el=document.createElement('div');el.className='card'+(save.sel===s.id?' on':'');
  el.innerHTML=`<canvas width="240" height="110"></canvas><h3>${s.name}</h3>${bar('Kecepatan',s.speed,240)}${bar('Penumpang',s.pass,40)}${bar('Kargo',s.cargo,26)}<button></button>`;
  const c=el.querySelector('canvas').getContext('2d'),gr=c.createLinearGradient(0,0,0,110);gr.addColorStop(0,'#127395');gr.addColorStop(1,'#0a4766');c.fillStyle=gr;c.fillRect(0,0,240,110);
  drawShip(c,s,120,55,0,1.6);
  const b=el.querySelector('button');
  b.textContent=save.sel===s.id?'Dipakai':own?'Pakai':'Beli '+fmt(s.price);
  b.disabled=save.sel===s.id||(!own&&save.money<s.price);
  b.onclick=()=>{if(!own){save.money-=s.price;save.owned.push(s.id)}save.sel=s.id;writeSave(save);renderShop()};
  g.appendChild(el)});
}
function syncSet(){$('sSound').checked=save.sound;$('sMini').checked=save.mini;$('sWave').checked=save.waves}
$('sSound').onchange=e=>{save.sound=e.target.checked;writeSave(save)};
$('sMini').onchange=e=>{save.mini=e.target.checked;writeSave(save)};
$('sWave').onchange=e=>{save.waves=e.target.checked;writeSave(save)};
$('sReset').onclick=()=>{if(confirm('Hapus semua kemajuan?')){Object.assign(save,DEF,{owned:[0]});writeSave(save);ship=null;syncSet()}};

// kontrol
addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=true;
 if(mode==='play'){if(k.startsWith('Arrow')||k===' ')e.preventDefault();if(k==='m')toggleMap();if(k==='Escape'){$('mapov').classList.contains('hide')?show('menu'):toggleMap()}}});
addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false});
cv.addEventListener('pointerdown',e=>{ptr.on=true;ptr.x=e.clientX;ptr.y=e.clientY});
cv.addEventListener('pointermove',e=>{ptr.x=e.clientX;ptr.y=e.clientY});
addEventListener('pointerup',()=>ptr.on=false);addEventListener('pointercancel',()=>ptr.on=false);

show('menu');syncSet();
let last=performance.now();
(function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;if(mode==='play')update(dt);render();requestAnimationFrame(loop)})(last);
