// Data kapal, pelabuhan, dan penyimpanan
const SHIPS=[
 {id:0,kind:'sail',name:'Perahu Layar',price:0,speed:150,pass:6,cargo:4,len:150,h:16,hull:'#1f4e79',bot:'#b8372b',acc:'#e2563f'},
 {id:1,kind:'tug',name:'Kapal Tunda',price:1200,speed:170,pass:8,cargo:12,len:180,h:24,hull:'#d8402f',bot:'#7a1d14',acc:'#ffffff'},
 {id:2,kind:'ferry',name:'Feri Bahari',price:2600,speed:200,pass:26,cargo:8,len:250,h:26,hull:'#f4f6f7',bot:'#1d5f8a',acc:'#2c86c7'},
 {id:3,kind:'cargo',name:'Kargo Samudra',price:4800,speed:185,pass:8,cargo:30,len:320,h:34,hull:'#2b303b',bot:'#b23a2e',acc:'#e2563f'},
 {id:4,kind:'cruise',name:'Pesiar Nusantara',price:9000,speed:260,pass:46,cargo:16,len:370,h:36,hull:'#fbfcfc',bot:'#1c3b5c',acc:'#1c3b5c'}
];
const NAMES=['Surabaya','Benoa','Labuan Bajo','Makassar','Banyuwangi','Ambon','Ternate'];
const PORTS=NAMES.map((name,i)=>({name,x:700+i*3000,s:i}));
const WORLD={w:700+(NAMES.length-1)*3000+700};
const DEF={money:0,owned:[0],sel:0,sound:true,mini:true,waves:true,vol:.7};
function loadSave(){try{return Object.assign({},DEF,{owned:[0]},JSON.parse(localStorage.getItem('kapalkapal2')||'{}'))}catch(e){return Object.assign({},DEF,{owned:[0]})}}
function writeSave(s){try{localStorage.setItem('kapalkapal2',JSON.stringify(s))}catch(e){}}

// Gambar tampak samping: langit, pulau, laut, pelabuhan, kapal
const R=(c,x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)};
function drawBack(c,W,H,yH,cx,t){
 const g=c.createLinearGradient(0,0,0,yH);g.addColorStop(0,'#8fb5c4');g.addColorStop(1,'#e0eae6');c.fillStyle=g;c.fillRect(0,0,W,yH+2);
 c.fillStyle='rgba(255,255,255,.55)';
 for(let i=0;i<7;i++){const m=W+400,x=(((i*430-cx*.06+t*6)%m)+m)%m-200,y=yH*(.12+.07*(i%3));c.beginPath();c.ellipse(x,y,70,16,0,0,7);c.ellipse(x+40,y-8,45,14,0,0,7);c.fill()}
 c.fillStyle='#a9c0c9';c.beginPath();c.moveTo(0,yH);
 for(let x=0;x<=W;x+=20){const wx=x+cx*.15;c.lineTo(x,yH-34-22*Math.sin(wx*.004)-14*Math.sin(wx*.013))}
 c.lineTo(W,yH);c.fill();
 const sp=1700,f=.5;
 for(let i=Math.floor((cx*f-300)/sp);i<=Math.floor((cx*f+W+300)/sp);i++){
  const x=i*sp+420+Math.abs(i*97%300)-cx*f,w=240+Math.abs(i*53%140),hh=50+Math.abs(i*29%40);
  R(c,x-w/2-10,yH-5,w+20,6,'#d9c58a');
  c.fillStyle='#4b9a64';c.beginPath();c.moveTo(x-w/2,yH-4);c.quadraticCurveTo(x,yH-hh*2,x+w/2,yH-4);c.fill();
  for(let j=0;j<3;j++){const px=x-w*.25+j*w*.25,py=yH-hh*.9+Math.abs(j-1)*hh*.35;
   c.strokeStyle='#6b4a2c';c.lineWidth=3;c.beginPath();c.moveTo(px,yH-4);c.lineTo(px+4,py);c.stroke();
   c.fillStyle='#2f7a3c';c.beginPath();c.ellipse(px+4,py,16,6,0,0,7);c.fill()}}
}
function drawSea(c,W,H,yH,cx,t,waves){
 const g=c.createLinearGradient(0,yH,0,H);g.addColorStop(0,'#3aa58f');g.addColorStop(.5,'#1f7a7a');g.addColorStop(1,'#0f4e5c');
 c.fillStyle=g;c.fillRect(0,yH,W,H-yH);R(c,0,yH,W,5,'rgba(255,255,255,.25)');
 if(!waves)return;
 for(let r=0;r<9;r++){const y=yH+(H-yH)*Math.pow((r+.6)/9.4,1.4),amp=1.5+r*.9;
  c.strokeStyle=`rgba(255,255,255,${.08+r*.014})`;c.lineWidth=1.5+r*.35;c.beginPath();
  for(let x=0;x<=W+12;x+=12){const yy=y+Math.sin((x+cx*(.8+r*.05))*(.02-r*.001)+t*(1+r*.12)+r)*amp;x?c.lineTo(x,yy):c.moveTo(x,yy)}
  c.stroke()}
}
function drawPort(c,p,sx,yH,u,t){
 const v=p.s%3,X=x=>sx+x*u;
 R(c,X(-230),yH,460*u,9*u,'#6b4a2c');R(c,X(-230),yH,460*u,3*u,'#8a6540');
 for(let x=-220;x<=220;x+=44)R(c,X(x),yH+9*u,6*u,24*u,'#4b3a28');
 const silo=x=>{R(c,X(x),yH-130*u,44*u,130*u,'#c9d0d3');R(c,X(x),yH-130*u,12*u,130*u,'#e3e8ea');c.fillStyle='#aab3b7';c.beginPath();c.ellipse(X(x+22),yH-130*u,22*u,7*u,0,0,7);c.fill()};
 const tower=x=>{R(c,X(x),yH-170*u,56*u,170*u,'#a9503c');c.fillStyle='#6b3a30';c.beginPath();c.moveTo(X(x-6),yH-170*u);c.lineTo(X(x+28),yH-215*u);c.lineTo(X(x+62),yH-170*u);c.fill();
  c.fillStyle='#f3e7d0';c.beginPath();c.arc(X(x+28),yH-140*u,12*u,0,7);c.fill();
  for(let i=0;i<3;i++){R(c,X(x+10),yH-110*u+i*28*u,12*u,16*u,'#f3e7d0');R(c,X(x+34),yH-110*u+i*28*u,12*u,16*u,'#f3e7d0')}};
 const house=(x,w,col,hh)=>{R(c,X(x),yH-hh*u,w*u,hh*u,col);c.fillStyle='#5b6a73';
  for(let i=0;i<w/40;i++){c.beginPath();c.moveTo(X(x+i*40),yH-hh*u);c.lineTo(X(x+i*40+40),yH-hh*u);c.lineTo(X(x+i*40+40),yH-(hh+22)*u);c.fill()}
  R(c,X(x+w*.35),yH-hh*.6*u,w*.3*u,hh*.6*u,'rgba(0,0,0,.25)')};
 const crane=x=>{c.strokeStyle='#e2a02f';c.lineWidth=6*u;c.beginPath();c.moveTo(X(x),yH);c.lineTo(X(x),yH-150*u);c.lineTo(X(x+90),yH-150*u);c.stroke();
  c.lineWidth=2*u;c.beginPath();c.moveTo(X(x+80),yH-150*u);c.lineTo(X(x+80),yH-100*u+Math.sin(t*1.5)*6*u);c.stroke()};
 if(v===0){silo(-200);silo(-150);silo(-100);house(10,160,'#7c4a3c',70);crane(180)}
 else if(v===1){tower(-190);house(-110,150,'#3e6a8a',80);crane(90)}
 else{house(-200,140,'#8a5a3a',60);tower(-40);silo(40);silo(90);crane(170)}
}
function hullPath(c,L,h,d){c.beginPath();c.moveTo(-L/2,-h);c.lineTo(L/2+h*.6,-h);c.quadraticCurveTo(L/2+h*.1,d*.1,L/2-h*.5,d);c.lineTo(-L/2+h*.7,d);c.quadraticCurveTo(-L/2-h*.1,d*.2,-L/2,-h);c.closePath()}
function wins(c,x,y,w,hh,n,f){const g=w/n;for(let i=0;i<n;i++)R(c,x+g*(i+.2),y,g*.6,hh,f)}
function ring(c,x,y,r){c.fillStyle='#ff8a2a';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x,y,r*.45,0,7);c.fill()}
// y = garis air, kapal menghadap kanan (dir=-1 membalik)
function drawShip(c,s,x,y,dir,k){
 const L=s.len*k,h=s.h*k,d=h*.5,T=-h,K=s.kind,W='#fff',G='#2b4a5e';
 const tri=(a,b,e,f)=>{c.fillStyle=f;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(e[0],e[1]);c.fill()};
 c.save();c.translate(x,y);c.scale(dir,1);
 if(K==='sail'){R(c,-L*.06-1.5*k,-L*.95,3*k,L*.95-h,'#d9d9d9')}
 hullPath(c,L,h,d);c.fillStyle=s.hull;c.fill();
 c.save();c.clip();R(c,-L,0,L*2,d*2,s.bot);R(c,-L,-h*.5,L*2,h*.12,s.acc);c.restore();
 hullPath(c,L,h,d);c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1.5;c.stroke();
 if(K==='sail'){
  tri([-L*.09,T],[-L*.09,-L*.9],[-L*.46,T],W);tri([-L*.09,T],[-L*.09,T-L*.2],[-L*.32,T],s.acc);
  tri([-L*.03,T],[-L*.03,-L*.78],[L*.4,T],'#cfe8f5');tri([-L*.06,-L*.95],[-L*.06,-L*.9],[-L*.12,-L*.925],s.acc);
 }else if(K==='tug'){
  R(c,-L*.3,T-h*1.05,L*.34,h*1.05,W);R(c,-L*.2,T-h*1.9,L*.2,h*.85,W);
  wins(c,-L*.28,T-h*.85,L*.3,h*.3,3,G);wins(c,-L*.19,T-h*1.7,L*.18,h*.35,3,G);
  R(c,-L*.1,T-h*2.6,L*.07,h*.7,'#222');R(c,-L*.1,T-h*2.2,L*.07,h*.2,'#d8402f');R(c,L*.12,T-h*2.3,2*k,h*2.3,'#ddd');
  c.fillStyle='#ffd34d';c.beginPath();c.arc(L*.12+k,T-h*2.3,3*k,0,7);c.fill();
  c.fillStyle='#111';for(let i=0;i<3;i++){c.beginPath();c.arc(L*.34+i*L*.05,T+h*.4,h*.18,0,7);c.fill()}
 }else if(K==='ferry'){
  R(c,-L*.42,T-h*.9,L*.74,h*.9,W);R(c,-L*.42,T-h*.95,L*.74,3*k,s.acc);wins(c,-L*.4,T-h*.7,L*.7,h*.3,14,'#3a6a8f');
  R(c,-L*.34,T-h*1.7,L*.56,h*.8,W);R(c,-L*.34,T-h*1.75,L*.56,3*k,s.acc);wins(c,-L*.32,T-h*1.5,L*.52,h*.3,11,'#3a6a8f');
  R(c,L*.04,T-h*2.3,L*.14,h*.6,W);wins(c,L*.05,T-h*2.15,L*.12,h*.25,4,G);
  R(c,-L*.2,T-h*2.5,L*.08,h*.8,'#f2b84b');R(c,-L*.2,T-h*2.5,L*.08,h*.18,s.acc);
  [-.3,-.1,.1,.3].forEach(q=>ring(c,L*q,-h*.78,h*.15));
 }else if(K==='cargo'){
  R(c,-L*.46,T-h*2.6,L*.15,h*2.6,'#f4f4f4');for(let i=0;i<4;i++)wins(c,-L*.45,T-h*2.4+i*h*.55,L*.13,h*.25,3,G);
  R(c,-L*.4,T-h*3.3,L*.05,h*.7,s.acc);
  const col=['#e2563f','#2f7fb5','#f2b84b','#4f9a56','#8e5bb5'];
  for(let i=0;i<5;i++)for(let r=0;r<3;r++){R(c,-L*.28+i*L*.13,T-(r+1)*h*.62,L*.12,h*.58,col[(i*2+r)%5]);R(c,-L*.28+i*L*.13,T-(r+1)*h*.62,L*.12,2*k,'rgba(255,255,255,.35)')}
  [-.3,0,.3].forEach(q=>ring(c,L*q,-h*.78,h*.14));
 }else{
  for(let i=0;i<4;i++){const x0=-L*.42+i*L*.05,w=L*.82-i*L*.1,y0=T-(i+1)*h*.62;
   R(c,x0,y0,w,h*.6,W);R(c,x0,y0,w,2*k,'#d4dde2');wins(c,x0+4*k,y0+h*.18,w-8*k,h*.22,20-i*3,'#2c86c7')}
  R(c,-L*.08,T-h*3.6,L*.06,h*.9,'#f08a2a');R(c,-L*.08,T-h*3.6,L*.06,h*.15,'#1c3b5c');R(c,L*.1,T-h*3.6,2*k,h*1.1,'#ddd');
 }
 c.restore();
}

// Mesin game tampak samping, UI, toko, dan pengaturan
const $=id=>document.getElementById(id),fmt=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
const cv=$('c'),cx=cv.getContext('2d'),mini=$('mini').getContext('2d'),gc=$('gauge').getContext('2d'),bigC=$('big');
let W,H,yH,yS,sc;
function resize(){const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);yH=H*.5;yS=H*.66;sc=Math.max(.55,Math.min(1.2,W/1000,H/650))}
addEventListener('resize',resize);resize();

const save=loadSave();
let mode='menu',ship=null,t=0,wk=[],wkT=0,off=0;
const keys={},pedal={gas:false,brake:false};
const ports=PORTS.map((p,i)=>({...p,id:i,q:[],tm:3+i,cool:0}));
const cur=()=>SHIPS[save.sel],cnt=k=>ship.items.filter(i=>i.t===k).length;

function spawn(p){
 if(p.q.length>=8)return;let d;do{d=ports[Math.random()*ports.length|0]}while(d===p);
 const tp=Math.random()<.55?'p':'c';
 p.q.push({t:tp,dest:d.id,pay:Math.round(Math.abs(p.x-d.x)/20*(tp==='p'?1.3:1))});
}
ports.forEach(p=>{for(let i=0;i<4;i++)spawn(p)});
function newShip(){ship={x:ports[0].x-220,v:0,dir:1,items:[],sid:save.sel};off=W*.36}

// ===== Suara (WebAudio, tanpa file): laut, mesin, ombak, klakson, lonceng, burung camar =====
const A={
 ac:null,h:null,gt:3,
 init(){
  if(this.ac){if(this.ac.state==='suspended')this.ac.resume();return}
  try{
   const ac=new(window.AudioContext||webkitAudioContext)();this.ac=ac;
   this.m=ac.createGain();this.m.connect(ac.destination);this.vol();
   const nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=nb.getChannelData(0);
   for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
   const noise=(type,f,q)=>{const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q||1;
    const g=ac.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(this.m);s.start();return{g,fl}};
   this.amb=noise('lowpass',420);
   const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.11;lg.gain.value=.05;lfo.connect(lg);lg.connect(this.amb.g.gain);lfo.start();
   this.wake=noise('bandpass',1400,.7);
   this.eg=ac.createGain();this.eg.gain.value=0;
   const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;
   this.o1=ac.createOscillator();this.o1.type='sawtooth';this.o2=ac.createOscillator();this.o2.type='square';
   this.o1.connect(lp);this.o2.connect(lp);lp.connect(this.eg);this.eg.connect(this.m);this.o1.start();this.o2.start();
   this.cl=ac.createOscillator();const cg=ac.createGain();cg.gain.value=.02;this.cl.connect(cg);cg.connect(this.eg.gain);this.cl.start();
  }catch(e){this.ac=null}
 },
 vol(){if(this.m)this.m.gain.setTargetAtTime(save.sound?save.vol:0,this.ac.currentTime,.05)},
 tick(dt){
  const ac=this.ac;if(!ac)return;
  const n=ac.currentTime,pl=mode==='play',S=cur();
  const r=pl?Math.min(1,ship.v/S.speed):0,gas=pl&&(keys.ArrowUp||keys.w||pedal.gas),brk=pl&&(keys.ArrowDown||keys.s||keys[' ']||pedal.brake);
  this.amb.g.gain.setTargetAtTime(pl?.16:.22,n,.3);
  this.wake.g.gain.setTargetAtTime(.02+r*.2+(brk&&r>.15?.08:0),n,.15);
  this.wake.fl.frequency.setTargetAtTime(900+r*1400,n,.2);
  const base={tug:46,ferry:56,cargo:38,cruise:64}[S.kind]||50,eng=pl&&S.kind!=='sail';
  this.eg.gain.setTargetAtTime(eng?.05+r*.07+(gas?.03:0):0,n,.2);
  this.o1.frequency.setTargetAtTime(base*(1+r*1.1),n,.15);this.o2.frequency.setTargetAtTime(base*.5*(1+r*1.1),n,.15);
  this.cl.frequency.setTargetAtTime(S.kind==='tug'||S.kind==='cargo'?5+r*9:11+r*14,n,.2);
  this.gt-=dt;if(this.gt<=0){this.gt=7+Math.random()*9;this.gull()}
 },
 hornOn(){
  if(!this.ac||this.h)return;const ac=this.ac,n=ac.currentTime,g=ac.createGain(),lp=ac.createBiquadFilter();
  lp.type='lowpass';lp.frequency.value=1000;g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(.22,n+.06);
  const f={sail:[330,415],tug:[150,190],ferry:[120,150],cargo:[82,103],cruise:[98,123]}[cur().kind];
  const os=f.flatMap(x=>[x,x*1.005]).map(x=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=x;o.connect(lp);o.start();return o});
  lp.connect(g);g.connect(this.m);this.h={g,os};
 },
 hornOff(){
  const h=this.h;if(!h)return;const n=this.ac.currentTime;this.h=null;
  h.g.gain.cancelScheduledValues(n);h.g.gain.setValueAtTime(h.g.gain.value,n);h.g.gain.linearRampToValueAtTime(0,n+.25);h.os.forEach(o=>o.stop(n+.3));
 },
 horn(d){this.hornOn();setTimeout(()=>this.hornOff(),d*1000)},
 tone(f,d,type,v,f2){
  const ac=this.ac;if(!ac)return;const n=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);
  g.gain.setValueAtTime(v||.1,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(this.m);o.start(n);o.stop(n+d+.02);
 },
 coin(){this.tone(988,.12,'square',.05);setTimeout(()=>this.tone(1480,.3,'square',.05),90)},
 ding(){this.tone(1318,1.2,'sine',.12);this.tone(1760,.8,'sine',.06)},
 click(){this.tone(700,.06,'square',.03,400)},
 gull(){this.tone(1900,.18,'sine',.035,1300);setTimeout(()=>this.tone(1700,.22,'sine',.03,1100),240)}
};
addEventListener('pointerdown',()=>A.init());addEventListener('keydown',()=>A.init());
addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button:not(.pedal):not(#bHorn)'))A.click()});
const hb=$('bHorn');hb.addEventListener('pointerdown',e=>{e.preventDefault();A.init();A.hornOn()});
['pointerup','pointercancel','pointerleave'].forEach(ev=>hb.addEventListener(ev,()=>A.hornOff()));
function toast(m){const e=$('toast');e.textContent=m;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),2800)}

function dock(p){
 const S=cur();let gain=0,out=0,inn=0;
 ship.items=ship.items.filter(i=>{if(i.dest===p.id){gain+=i.pay;out++;return false}return true});
 let np=cnt('p'),nc=cnt('c');
 p.q=p.q.filter(i=>{
  if(i.t==='p'&&np<S.pass){np++;ship.items.push(i);inn++;return false}
  if(i.t==='c'&&nc<S.cargo){nc++;ship.items.push(i);inn++;return false}
  return true});
 if(gain){save.money+=gain;writeSave(save);A.coin()}
 if(out||inn){A.ding();A.horn(.7);toast(`${p.name}: turun ${out}, naik ${inn}${gain?' · +'+fmt(gain):''}`)}
 else if(p.q.length)toast(`${p.name}: muatan penuh, antar dulu yang ada di kapal`);
}

function update(dt){
 const S=cur(),gas=keys.ArrowUp||keys.w||pedal.gas,brk=keys.ArrowDown||keys.s||keys[' ']||pedal.brake;
 if(gas)ship.v+=S.speed*.3*dt;
 ship.v*=Math.pow(.8,dt);ship.v=Math.min(ship.v,S.speed);
 if(brk)ship.v=Math.max(0,ship.v-(90+ship.v*.8)*dt);
 if(ship.v<40){if(keys.ArrowLeft||keys.a)ship.dir=-1;if(keys.ArrowRight||keys.d)ship.dir=1}
 ship.x+=ship.dir*ship.v*dt;
 if(ship.x<120||ship.x>WORLD.w-120){ship.x=Math.max(120,Math.min(WORLD.w-120,ship.x));ship.v=0}
 wkT+=dt;if(ship.v>20&&wkT>.07){wkT=0;wk.push({x:ship.x-ship.dir*S.len*sc*.45,l:1})}
 wk.forEach(w=>w.l-=dt*.7);wk=wk.filter(w=>w.l>0);
 ports.forEach(p=>{p.tm-=dt;if(p.tm<=0){p.tm=5+Math.random()*4;spawn(p)}
  p.cool-=dt;if(p.cool<=0&&Math.abs(ship.x-p.x)<150&&ship.v<40){dock(p);p.cool=1.5}});
}

function render(){
 const S=cur(),menu=mode!=='play';let camX;
 if(menu)camX=ports[0].x-W*.3+Math.sin(t*.2)*30;
 else{off+=((ship.dir>0?W*.36:W*.64)-off)*.04;camX=ship.x-off}
 drawBack(cx,W,H,yH,camX,t);drawSea(cx,W,H,yH,camX,t,save.waves);
 cx.textAlign='center';cx.lineJoin='round';
 ports.forEach(p=>{const sx=p.x-camX;if(sx<-500||sx>W+500)return;
  drawPort(cx,p,sx,yH,sc,t);
  cx.strokeStyle='rgba(255,255,255,.7)';cx.lineWidth=2.5;cx.setLineDash([12,10]);cx.beginPath();cx.ellipse(sx,yS+10*sc,150,14*sc,0,0,7);cx.stroke();cx.setLineDash([]);
  const np=p.q.filter(i=>i.t==='p').length,nc=p.q.length-np,y=yH-255*sc;
  cx.font='bold 20px Georgia';cx.strokeStyle='#0a3d56';cx.lineWidth=4;cx.strokeText(p.name,sx,y);cx.fillStyle='#fff';cx.fillText(p.name,sx,y);
  cx.font='14px Trebuchet MS';const s=`👥 ${np}   📦 ${nc}`;cx.strokeText(s,sx,y+20);cx.fillStyle='#fff3c4';cx.fillText(s,sx,y+20)});
 const bob=Math.sin(t*1.6)*3*sc+Math.sin(t*2.7)*1.2*sc,k=menu?sc*1.4:sc,sx=menu?W*.7:ship.x-camX,y=yS+bob;
 wk.forEach(w=>{cx.fillStyle=`rgba(255,255,255,${w.l*.5})`;cx.beginPath();cx.ellipse(w.x-camX,yS+5*sc,8+(1-w.l)*18,3+(1-w.l)*3,0,0,7);cx.fill()});
 drawShip(cx,S,sx,y,menu?1:ship.dir,k);
 // air di depan lambung
 const L=S.len*k,d=S.h*k*.5;
 cx.fillStyle='rgba(24,108,112,.8)';cx.beginPath();cx.moveTo(sx-L*.6,y+d+10);
 for(let x=sx-L*.6;x<=sx+L*.6;x+=8)cx.lineTo(x,y+Math.sin(x*.05+t*3)*2);
 cx.lineTo(sx+L*.6,y+d+10);cx.fill();
 cx.strokeStyle='rgba(255,255,255,.55)';cx.lineWidth=2;cx.beginPath();
 for(let x=sx-L*.6;x<=sx+L*.6;x+=8){const yy=y+Math.sin(x*.05+t*3)*2;x>sx-L*.6?cx.lineTo(x,yy):cx.moveTo(x,yy)}cx.stroke();
 if(!menu)hud();
}

function hud(){
 const S=cur();
 $('hMoney').textContent=fmt(save.money);
 $('hPass').textContent=`Penumpang ${cnt('p')}/${S.pass}`;
 $('hCargo').textContent=`Kargo ${cnt('c')}/${S.cargo}`;
 let np=ports[0];ports.forEach(p=>{if(Math.abs(p.x-ship.x)<Math.abs(np.x-ship.x))np=p});
 $('hPort').textContent=Math.abs(np.x-ship.x)<900?'⚓ '+np.name:'Laut Lepas';
 const m={};ship.items.forEach(i=>m[i.dest]=(m[i.dest]||0)+1);
 const s=Object.keys(m).map(d=>{const p=ports[d],dx=p.x-ship.x;return `${p.name} ×${m[d]} ${dx>0?'▶':'◀'}${Math.round(Math.abs(dx)/10)} m`}).join(' · ');
 const el=$('hDest');if(el.textContent!==(s?'Tujuan: '+s:''))el.textContent=s?'Tujuan: '+s:'';
 if(save.mini)drawRoute(mini,260,56,false);
 if(!$('mapov').classList.contains('hide'))drawRoute(bigC.getContext('2d'),bigC.width,bigC.height,true);
 drawGauge(ship.v/6,S.speed/6);
}
function drawGauge(kn,mx){
 const c=gc,x0=110,y0=112,r=98,A=a=>Math.PI+a/45*Math.PI;c.clearRect(0,0,220,125);
 let g=c.createRadialGradient(x0,y0,10,x0,y0,r+8);g.addColorStop(0,'#143b52');g.addColorStop(1,'#08202e');
 c.fillStyle=g;c.beginPath();c.arc(x0,y0,r+8,Math.PI,0);c.closePath();c.fill();
 c.strokeStyle='#f2b84b';c.lineWidth=3;c.beginPath();c.arc(x0,y0,r+5,Math.PI,0);c.stroke();
 g=c.createLinearGradient(x0-r,0,x0+r,0);g.addColorStop(0,'#4ee08a');g.addColorStop(.6,'#f2b84b');g.addColorStop(1,'#e2563f');
 c.strokeStyle=g;c.lineWidth=6;c.beginPath();c.arc(x0,y0,r-8,Math.PI,A(mx));c.stroke();
 c.fillStyle='#fff';c.textAlign='center';c.font='bold 11px Trebuchet MS';
 for(let i=0;i<=45;i+=5){const a=A(i),m=i%10===0,co=Math.cos(a),si=Math.sin(a);
  c.strokeStyle=m?'#fff':'#9bb';c.lineWidth=m?2.5:1.5;c.beginPath();c.moveTo(x0+co*(r-14),y0+si*(r-14));c.lineTo(x0+co*(r-(m?24:19)),y0+si*(r-(m?24:19)));c.stroke();
  if(m)c.fillText(i,x0+co*(r-38),y0+si*(r-38)+4)}
 const a=A(Math.min(45,kn));c.strokeStyle='#ff5a43';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);c.lineTo(x0+Math.cos(a)*(r-16),y0+Math.sin(a)*(r-16));c.stroke();
 c.fillStyle='#f2b84b';c.beginPath();c.arc(x0,y0,9,0,7);c.fill();
 c.fillStyle='#fff';c.font='bold 22px Trebuchet MS';c.fillText(Math.round(kn),x0,y0-32);c.font='10px Trebuchet MS';c.fillStyle='#9fe3d0';c.fillText('KNOT',x0,y0-20);
}
function drawRoute(c,w,h,big){
 c.clearRect(0,0,w,h);c.fillStyle='rgba(8,34,48,.85)';c.fillRect(0,0,w,h);
 const p0=big?50:14,X=x=>p0+(w-2*p0)*x/WORLD.w,my=h*(big?.55:.55),want=new Set(ship.items.map(i=>i.dest));
 c.strokeStyle='#5fc7c0';c.lineWidth=big?4:3;c.beginPath();c.moveTo(X(0),my);c.lineTo(X(WORLD.w),my);c.stroke();
 c.textAlign='center';
 ports.forEach((p,i)=>{const x=X(p.x),w2=want.has(p.id);c.fillStyle=w2?'#f2b84b':'#fff';c.beginPath();c.arc(x,my,w2?(big?9:5):(big?6:3.5),0,7);c.fill();
  if(big){c.fillStyle='#fff';c.font='bold 15px Trebuchet MS';c.fillText(p.name,x,my+(i%2?34:-18));c.font='13px Trebuchet MS';c.fillStyle='#f6e7b4';c.fillText(`${p.q.length} menunggu`,x,my+(i%2?52:-36))}});
 const sx=X(ship.x),z=big?1.7:1;c.fillStyle='#e2563f';c.beginPath();c.moveTo(sx,my-13*z);c.lineTo(sx-6*z,my-4*z);c.lineTo(sx+6*z,my-4*z);c.fill();
 c.strokeStyle='rgba(255,255,255,.5)';c.strokeRect(.5,.5,w-1,h-1);
}
function toggleMap(){const o=$('mapov');if(o.classList.contains('hide')){const w=Math.min(innerWidth*.94,1100);bigC.width=w;bigC.height=230;bigC.style.width=w+'px';bigC.style.height='230px';o.classList.remove('hide')}else o.classList.add('hide')}

// layar
function show(id){['menu','shop','settings'].forEach(s=>$(s).classList.toggle('hide',s!==id));$('hud').classList.add('hide');$('mapov').classList.add('hide');mode='menu';pedal.gas=pedal.brake=false;if(id==='menu')$('mMoney').textContent='Uang: '+fmt(save.money)}
function play(){if(!ship||ship.sid!==save.sel)newShip();mode='play';['menu','shop','settings'].forEach(s=>$(s).classList.add('hide'));$('hud').classList.remove('hide');$('mini').classList.toggle('hide',!save.mini);toast('Tahan GAS untuk maju, REM untuk berhenti, H untuk klakson. Sandar di cincin putih')}
$('bPlay').onclick=play;$('bShop').onclick=()=>{renderShop();show('shop')};$('bSet').onclick=()=>{syncSet();show('settings')};
$('shopBack').onclick=$('setBack').onclick=$('bMenu').onclick=()=>show('menu');
$('bMap').onclick=toggleMap;$('mapov').onclick=()=>$('mapov').classList.add('hide');
$('bFlip').onclick=()=>{if(ship.v<40)ship.dir*=-1;else toast('Kurangi kecepatan dulu untuk memutar haluan')};
[['bGas','gas'],['bBrake','brake']].forEach(([id,k])=>{const b=$(id),on=v=>e=>{e.preventDefault();if(v)try{b.setPointerCapture(e.pointerId)}catch(x){}pedal[k]=v;b.classList.toggle('on',v)};
 b.addEventListener('pointerdown',on(true));['pointerup','pointercancel'].forEach(ev=>b.addEventListener(ev,on(false)))});

function renderShop(){
 $('shopMoney').textContent=fmt(save.money);const g=$('shopList');g.innerHTML='';
 const bar=(l,v,m)=>`<div class="bar"><span>${l}</span><em><i style="width:${v/m*100}%"></i></em></div>`;
 SHIPS.forEach(s=>{
  const own=save.owned.includes(s.id),el=document.createElement('div');el.className='card'+(save.sel===s.id?' on':'');
  el.innerHTML=`<canvas width="260" height="130"></canvas><h3>${s.name}</h3>${bar('Kecepatan',s.speed,260)}${bar('Penumpang',s.pass,46)}${bar('Kargo',s.cargo,30)}<button></button>`;
  const c=el.querySelector('canvas').getContext('2d'),gr=c.createLinearGradient(0,0,0,130);gr.addColorStop(0,'#9fc3cf');gr.addColorStop(.7,'#e0eae6');gr.addColorStop(.7,'#3aa58f');gr.addColorStop(1,'#1f6f74');c.fillStyle=gr;c.fillRect(0,0,260,130);
  const k=Math.min(215/s.len,95/(s.kind==='sail'?s.len*.95:s.h*3.7));
  drawShip(c,s,130,96,1,k);c.fillStyle='rgba(24,108,112,.8)';c.fillRect(0,96,260,34);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(0,96,260,2);
  const b=el.querySelector('button');
  b.textContent=save.sel===s.id?'Dipakai':own?'Pakai':'Beli '+fmt(s.price);
  b.disabled=save.sel===s.id||(!own&&save.money<s.price);
  b.onclick=()=>{if(!own){save.money-=s.price;save.owned.push(s.id)}save.sel=s.id;writeSave(save);renderShop()};
  g.appendChild(el)});
}
function syncSet(){$('sSound').checked=save.sound;$('sMini').checked=save.mini;$('sWave').checked=save.waves;$('sVol').value=Math.round(save.vol*100)}
$('sSound').onchange=e=>{save.sound=e.target.checked;writeSave(save);A.vol()};
$('sVol').oninput=e=>{save.vol=e.target.value/100;writeSave(save);A.vol()};
$('sMini').onchange=e=>{save.mini=e.target.checked;writeSave(save)};
$('sWave').onchange=e=>{save.waves=e.target.checked;writeSave(save)};
$('sReset').onclick=()=>{if(confirm('Hapus semua kemajuan?')){Object.assign(save,DEF,{owned:[0]});writeSave(save);ship=null;syncSet()}};

addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=true;
 if(mode==='play'){if(k.startsWith('Arrow')||k===' ')e.preventDefault();if(k==='m')toggleMap();if(k==='h')A.hornOn();if(k==='Escape'){$('mapov').classList.contains('hide')?show('menu'):toggleMap()}}});
addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false;if(k==='h')A.hornOff()});

show('menu');syncSet();
let last=performance.now();
(function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;if(mode==='play')update(dt);A.tick(dt);render();requestAnimationFrame(loop)})(last);
