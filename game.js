// Data kapal, pelabuhan, dan penyimpanan
// Kecepatan kapal dalam km/j. Dunia: 1 km/j = 1.8 px/detik, jadi 1 km = 6480 px.
const PX=1.8,KM=6480;
const SHIPS=[
 {id:0,kind:'sail',name:'Perahu Layar',price:0,speed:200,acc:.9,pass:6,cargo:4,len:150,h:16,hull:'#1f4e79',bot:'#b8372b',acc2:'#e2563f'},
 {id:1,kind:'tug',name:'Kapal Tunda',price:1500,speed:210,acc:1.3,pass:8,cargo:12,len:180,h:24,hull:'#d8402f',bot:'#7a1d14',acc2:'#ffffff'},
 {id:2,kind:'ferry',name:'Feri Bahari',price:3500,speed:240,acc:1,pass:26,cargo:8,len:250,h:26,hull:'#f4f6f7',bot:'#1d5f8a',acc2:'#2c86c7'},
 {id:3,kind:'cargo',name:'Kargo Samudra',price:6500,speed:230,acc:.75,pass:8,cargo:30,len:320,h:34,hull:'#2b303b',bot:'#b23a2e',acc2:'#e2563f'},
 {id:4,kind:'cruise',name:'Pesiar Nusantara',price:12000,speed:300,acc:.85,pass:46,cargo:16,len:370,h:36,hull:'#fbfcfc',bot:'#1c3b5c',acc2:'#1c3b5c'},
 {id:5,kind:'pinisi',name:'Pinisi Bahari',price:2200,speed:220,acc:1,pass:14,cargo:10,len:210,h:22,hull:'#8a5a34',bot:'#4a2c18',acc2:'#d9a441'},
 {id:6,kind:'speed',name:'Speedboat Kilat',price:5200,speed:360,acc:1.6,pass:4,cargo:2,len:110,h:12,hull:'#f2f5f7',bot:'#c8321f',acc2:'#1f6fb5'},
 {id:7,kind:'tanker',name:'Tanker Raksasa',price:9000,speed:250,acc:.6,pass:4,cargo:48,len:430,h:34,hull:'#8c2f2a',bot:'#1b1f26',acc2:'#f2b84b'},
 {id:8,kind:'navy',name:'KRI Garuda',price:17000,speed:380,acc:1.1,pass:20,cargo:14,len:340,h:28,hull:'#8b979f',bot:'#3e4852',acc2:'#c9d1d6'},
 {id:9,kind:'jet',name:'Jetfoil Kencana',price:26000,speed:430,acc:1.4,pass:60,cargo:10,len:260,h:22,hull:'#f6f9fb',bot:'#12507c',acc2:'#18b0c9'}
];
const NAMES=['Belawan','Tanjung Priok','Semarang','Surabaya','Benoa','Labuan Bajo','Makassar','Ambon','Ternate','Sorong'];
const GAPS=[34000,42000,30000,38000,46000,33000,40000,36000,44000]; // jarak antar pelabuhan (px) ~ 4.6 - 7 km
let _px=1800;
const PORTS=NAMES.map((name,i)=>{if(i)_px+=GAPS[i-1];return{name,x:_px,s:i}});
const WORLD={w:_px+1800};
const DEF={money:0,owned:[0],sel:0,sound:true,mini:true,waves:true,vol:.7};
function loadSave(){try{return Object.assign({},DEF,{owned:[0]},JSON.parse(localStorage.getItem('kapalkapal2')||'{}'))}catch(e){return Object.assign({},DEF,{owned:[0]})}}
function writeSave(s){try{localStorage.setItem('kapalkapal2',JSON.stringify(s))}catch(e){}}

// ===== Alat gambar & warna =====
const R=(c,x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const h2=v=>('0'+Math.round(v).toString(16)).slice(-2);
const mix=(a,b,t)=>{t=clamp(t,0,1);const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>h2(v+(B[i]-v)*t)).join('')};
const hsh=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const poly=(c,p,f)=>{c.fillStyle=f;c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath();c.fill()};
let NIGHT=0,GL=null; // GL = daftar cahaya lampu (digambar setelah filter malam)
function pushGlow(c,x,y,r,a,col){
 if(!GL||NIGHT<.25)return;const m=c.getTransform(),p=m.transformPoint({x,y});
 GL.push({x:p.x,y:p.y,r:r*Math.hypot(m.a,m.b),a:a*Math.min(1,(NIGHT-.25)/.5),c:col||'255,224,140'});
}

// Langit: siklus siang-malam
const KF=[[0,'#3c527d','#f5a77a',.35],[.1,'#5aa0d8','#d3e8ef',0],[.4,'#3b8fd6','#c0e4f1',0],[.62,'#5a9fd0','#f4e4ba',0],[.72,'#6a4f8e','#ff8c4c',.2],[.8,'#202860','#8c4c6c',.6],[.88,'#16245a','#34508a',1],[.96,'#1a2858','#3a4e86',.9],[1,'#3c527d','#f5a77a',.35]];
const DAY=300;
function getSky(t){
 const p=((t/DAY)+.2)%1;
 for(let i=0;i<KF.length-1;i++){const a=KF[i],b=KF[i+1];if(p>=a[0]&&p<=b[0]){let f=(p-a[0])/(b[0]-a[0]);f=f*f*(3-2*f);return{p,top:mix(a[1],b[1],f),bot:mix(a[2],b[2],f),n:a[3]+(b[3]-a[3])*f}}}
 return{p,top:KF[0][1],bot:KF[0][2],n:KF[0][3]};
}
const todName=p=>p<.08?'Fajar':p<.3?'Pagi':p<.55?'Siang':p<.7?'Sore':p<.78?'Senja':'Malam';

// Ombak: tinggi permukaan laut di posisi dunia u (dipakai laut & kapal agar kapal benar-benar menunggangi ombak)
function waveH(u,t,a){return a*(Math.sin(u*.012+t*1.7)+.45*Math.sin(u*.027-t*2.3)+1.6*Math.sin(u*.0045+t*.9)+.25*Math.sin(u*.06+t*3.1))}

function drawBack(c,W,H,yH,camX,t,S){
 const g=c.createLinearGradient(0,0,0,yH);g.addColorStop(0,S.top);g.addColorStop(1,S.bot);c.fillStyle=g;c.fillRect(0,0,W,yH+2);
 // bintang
 if(S.n>.3){for(let i=0;i<80;i++){const x=((hsh(i)*W*1.2-camX*.01)%W+W)%W,y=hsh(i+99)*yH*.8;c.fillStyle=`rgba(255,255,255,${(S.n-.3)/.7*(.5+.5*Math.sin(t*2+i*3))})`;c.fillRect(x,y,i%7?1.5:2.5,i%7?1.5:2.5)}}
 // matahari / bulan
 const u=S.p/.78;let mm=((S.p-.76)+1)%1/.3;
 S.la=0;
 if(u<=1){const sx=W*(.06+.88*u),sy=yH-Math.sin(u*Math.PI)*yH*.8,hh=Math.sin(u*Math.PI),col=mix('#ffb04a','#fff8d0',hh*1.4);
  const gl=c.createRadialGradient(sx,sy,4,sx,sy,150);gl.addColorStop(0,col+'cc');gl.addColorStop(.25,col+'44');gl.addColorStop(1,col+'00');c.fillStyle=gl;c.fillRect(sx-150,sy-150,300,300);
  c.fillStyle=col;c.beginPath();c.arc(sx,sy,24,0,7);c.fill();S.lx=sx;S.ly=sy;S.la=1}
 else if(mm<=1){const sx=W*(.06+.88*mm),sy=yH-Math.sin(mm*Math.PI)*yH*.78;
  const gl=c.createRadialGradient(sx,sy,4,sx,sy,90);gl.addColorStop(0,'rgba(200,220,255,.35)');gl.addColorStop(1,'rgba(200,220,255,0)');c.fillStyle=gl;c.fillRect(sx-90,sy-90,180,180);
  c.fillStyle='#eef2ff';c.beginPath();c.arc(sx,sy,18,0,7);c.fill();c.fillStyle='rgba(150,165,200,.5)';
  [[-5,-4,4],[5,3,5],[-2,7,3]].forEach(q=>{c.beginPath();c.arc(sx+q[0],sy+q[1],q[2],0,7);c.fill()});S.lx=sx;S.ly=sy;S.la=.55}
 const hz=(col,f)=>mix(col,S.bot,f);
 // awan (2 lapis)
 const cc=mix(mix('#ffffff',S.bot,.3),'#26305a',S.n*.75);
 for(let l=0;l<2;l++){c.fillStyle=cc;c.globalAlpha=.55+l*.2;
  for(let i=0;i<8;i++){const m=W+600,x=(((i*470+l*230-camX*(.04+l*.05)+t*(3+l*3))%m)+m)%m-300,y=yH*(.1+.08*((i*3+l)%4))+l*18,s=1+hsh(i+l*9)*.6;
   c.beginPath();c.ellipse(x,y,70*s,15*s,0,0,7);c.ellipse(x+42*s,y-9*s,46*s,15*s,0,0,7);c.ellipse(x-38*s,y-5*s,38*s,12*s,0,0,7);c.fill()}}
 c.globalAlpha=1;
 // pegunungan jauh
 const ridge=(par,col,base,a1,k1,a2,k2)=>{c.fillStyle=col;c.beginPath();c.moveTo(0,yH);
  for(let x=0;x<=W;x+=14){const wx=x+camX*par;c.lineTo(x,yH-base-a1*Math.pow(Math.abs(Math.sin(wx*k1)),1.35)-a2*Math.sin(wx*k2+1))}c.lineTo(W,yH);c.fill()};
 ridge(.05,hz('#8fa9c0',.5),26,78,.0012,10,.011);
 ridge(.12,hz('#6f93a8',.38),12,44,.0021,8,.017);
 // pulau dengan pohon kelapa & mercusuar
 const sp=1700,f=.5;
 for(let i=Math.floor((camX*f-300)/sp);i<=Math.floor((camX*f+W+300)/sp);i++){
  const x=i*sp+420+Math.abs(i*97%300)-camX*f,w=240+Math.abs(i*53%140),hh=50+Math.abs(i*29%40);
  R(c,x-w/2-10,yH-5,w+20,6,hz('#d9c58a',.2));
  c.fillStyle=hz('#3f8a58',.15);c.beginPath();c.moveTo(x-w/2,yH-4);c.quadraticCurveTo(x,yH-hh*2,x+w/2,yH-4);c.fill();
  c.fillStyle=hz('#2f6e44',.2);c.beginPath();c.moveTo(x+w*.05,yH-4);c.quadraticCurveTo(x+w*.2,yH-hh*1.6,x+w/2,yH-4);c.fill();
  if(Math.abs(i)%4===1){const lx=x+w*.28;poly(c,[[lx-5,yH-hh*.9],[lx+5,yH-hh*.9],[lx+3,yH-hh*.9-46],[lx-3,yH-hh*.9-46]],'#f4f4f4');R(c,lx-4,yH-hh*.9-28,8,8,'#d8402f');R(c,lx-4,yH-hh*.9-52,8,6,'#ffe8a0');
   if(S.n>.3)pushGlow(c,lx,yH-hh*.9-49,70,1,'255,230,140')}
  for(let j=0;j<3;j++){const px=x-w*.25+j*w*.25,py=yH-hh*.9+Math.abs(j-1)*hh*.35;
   c.strokeStyle='#6b4a2c';c.lineWidth=3;c.beginPath();c.moveTo(px,yH-4);c.lineTo(px+4,py);c.stroke();
   c.fillStyle=hz('#2f7a3c',.15);c.beginPath();c.ellipse(px+4,py,16,6,0,0,7);c.ellipse(px+4,py-3,5,11,0,0,7);c.fill()}}
 // kapal lalu-lalang di kejauhan
 const saveGL=GL;GL=null;
 for(let i=0;i<7;i++){const dirT=i%2?1:-1,m=W*2+1200,sx=((((i*1900)+dirT*(20+i*3)*t-camX*.25)%m)+m)%m-600,sh=SHIPS[[2,3,4,7,8,5,9][i]];
  c.globalAlpha=.8;drawShip(c,sh,sx,yH+3+(i%3)*5,dirT,.1+.025*(i%3),0);c.globalAlpha=1}
 GL=saveGL;
 // burung camar
 c.strokeStyle=mix('#2b3a46',S.bot,.3);c.lineWidth=1.8;c.lineCap='round';
 for(let i=0;i<3;i++){const m=W+400,bx=(((i*640-camX*.35+t*40*(1+i*.2))%m)+m)%m-200,by=yH*(.2+.1*i)+Math.sin(t*.5+i)*14;
  for(let j=0;j<4;j++){const px=bx+j*24,py=by+Math.abs(j-1.5)*9,wg=Math.sin(t*9+j*1.3+i)*5;c.beginPath();c.moveTo(px-8,py-wg);c.quadraticCurveTo(px-3,py-wg-3,px,py);c.quadraticCurveTo(px+3,py-wg-3,px+8,py-wg);c.stroke()}}
}

// Laut berlapis: lapisan jauh (f<1) digambar sebelum kapal, lapisan dekat sesudahnya
function seaLayer(c,W,H,yH,yS,camX,t,f,a,fill,foam,rough){
 const y0=yH+(yS-yH)*f,amp=a*Math.min(f,1.6)*(.4+.6*Math.min(1,f)),pts=[];
 c.beginPath();c.moveTo(-10,H+4);
 for(let x=-10;x<=W+12;x+=10){const y=y0+waveH(x+camX*f,t,amp);pts.push(x,y);c.lineTo(x,y)}
 c.lineTo(W+12,H+4);c.closePath();c.fillStyle=fill;c.fill();
 if(foam){c.beginPath();for(let i=0;i<pts.length;i+=2)i?c.lineTo(pts[i],pts[i+1]):c.moveTo(pts[i],pts[i+1]);
  c.strokeStyle=`rgba(255,255,255,${.2+rough*.35})`;c.lineWidth=1.2+f*1.1;c.stroke();
  if(rough>.35){c.beginPath();for(let i=2;i<pts.length-2;i+=2){const s=pts[i+3]-pts[i-1];if(pts[i+1]<y0-amp*1.3&&Math.abs(s)>.5){c.moveTo(pts[i]-6,pts[i+1]+2);c.lineTo(pts[i]+6,pts[i+1]+2)}}c.strokeStyle=`rgba(255,255,255,${rough*.55})`;c.lineWidth=2.5*Math.max(.6,f);c.stroke()}}
}
function drawSeaFar(c,W,H,yH,yS,camX,t,S,a,rough,hq){
 const g=c.createLinearGradient(0,yH,0,H);g.addColorStop(0,mix(S.bot,'#3aa5a0',.5));g.addColorStop(1,'#0f4e5c');c.fillStyle=g;c.fillRect(0,yH,W,H-yH);
 const fs=hq?[.1,.22,.36,.5,.64,.8]:[.3,.65];
 fs.forEach(f=>seaLayer(c,W,H,yH,yS,camX,t,f,a,mix(mix(S.bot,'#2c9aa6',.45+.5*f),'#176a78',f*.25),hq,rough));
 R(c,0,yH,W,2,'rgba(255,255,255,.3)');
 // kilau matahari / bulan di air
 if(S.la>0){const lx=S.lx,al=S.la*(1-S.n*.4);for(let i=0;i<30;i++){const dy=Math.pow(i/30,1.6),y=yH+4+dy*(H-yH),w=(10+90*dy)*(.4+.6*Math.abs(Math.sin(t*1.7+i*2.1))),x=lx+Math.sin(t*1.3+i*1.7)*(8+60*dy);
  c.fillStyle=`rgba(255,244,205,${al*(.7-dy*.45)})`;c.fillRect(x-w/2,y,w,1.5+dy*3)}}
}

// Pelabuhan
function drawPort(c,p,sx,yH,u,t){
 const v=p.s%4,X=x=>sx+x*u;
 R(c,X(-230),yH,460*u,9*u,'#6b4a2c');R(c,X(-230),yH,460*u,3*u,'#8a6540');
 for(let x=-220;x<=220;x+=44)R(c,X(x),yH+9*u,6*u,24*u,'#4b3a28');
 for(let x=-210;x<=210;x+=105){R(c,X(x),yH-34*u,3*u,34*u,'#3a3f46');c.fillStyle='#ffe7a0';c.beginPath();c.arc(X(x+1.5),yH-36*u,4*u,0,7);c.fill();pushGlow(c,X(x+1.5),yH-36*u,36*u,.9)}
 const flag=x=>{R(c,X(x),yH-72*u,2*u,72*u,'#ccc');for(let s=0;s<2;s++){c.fillStyle=s?'#fff':'#d8302a';c.beginPath();
   for(let i=0;i<=6;i++){const xx=X(x)+2*u+i*6*u,yy=yH-72*u+s*7*u+Math.sin(t*4+i*.9)*2.2*u*i/6;i?c.lineTo(xx,yy):c.moveTo(xx,yy)}
   for(let i=6;i>=0;i--){const xx=X(x)+2*u+i*6*u,yy=yH-72*u+(s+1)*7*u+Math.sin(t*4+i*.9)*2.2*u*i/6;c.lineTo(xx,yy)}c.fill()}};
 const silo=x=>{R(c,X(x),yH-130*u,44*u,130*u,'#c9d0d3');R(c,X(x),yH-130*u,12*u,130*u,'#e3e8ea');c.fillStyle='#aab3b7';c.beginPath();c.ellipse(X(x+22),yH-130*u,22*u,7*u,0,0,7);c.fill()};
 const tower=x=>{R(c,X(x),yH-170*u,56*u,170*u,'#a9503c');c.fillStyle='#6b3a30';c.beginPath();c.moveTo(X(x-6),yH-170*u);c.lineTo(X(x+28),yH-215*u);c.lineTo(X(x+62),yH-170*u);c.fill();
  c.fillStyle='#f3e7d0';c.beginPath();c.arc(X(x+28),yH-140*u,12*u,0,7);c.fill();
  for(let i=0;i<3;i++){const lit=NIGHT>.3;R(c,X(x+10),yH-110*u+i*28*u,12*u,16*u,lit?'#ffe08a':'#f3e7d0');R(c,X(x+34),yH-110*u+i*28*u,12*u,16*u,lit?'#ffe08a':'#f3e7d0');if(lit){pushGlow(c,X(x+16),yH-102*u+i*28*u,16*u,.7);pushGlow(c,X(x+40),yH-102*u+i*28*u,16*u,.7)}}};
 const house=(x,w,col,hh)=>{R(c,X(x),yH-hh*u,w*u,hh*u,col);c.fillStyle='#5b6a73';
  for(let i=0;i<w/40;i++){c.beginPath();c.moveTo(X(x+i*40),yH-hh*u);c.lineTo(X(x+i*40+40),yH-hh*u);c.lineTo(X(x+i*40+40),yH-(hh+22)*u);c.fill()}
  R(c,X(x+w*.35),yH-hh*.6*u,w*.3*u,hh*.6*u,'rgba(0,0,0,.25)')};
 const crane=x=>{c.strokeStyle='#e2a02f';c.lineWidth=6*u;c.beginPath();c.moveTo(X(x),yH);c.lineTo(X(x),yH-150*u);c.lineTo(X(x+90),yH-150*u);c.stroke();
  c.lineWidth=2*u;c.beginPath();c.moveTo(X(x+80),yH-150*u);c.lineTo(X(x+80),yH-100*u+Math.sin(t*1.5)*6*u);c.stroke()};
 const cols=['#e2563f','#2f7fb5','#f2b84b','#4f9a56','#8e5bb5'];
 const boxes=(x,n)=>{for(let i=0;i<n;i++)for(let j=0;j<=(i*7)%3;j++){R(c,X(x+i*42),yH-(j+1)*22*u,40*u,20*u,cols[(i*3+j)%5]);R(c,X(x+i*42),yH-(j+1)*22*u,40*u,3*u,'rgba(255,255,255,.3)')}};
 const gantry=x=>{c.strokeStyle='#2f6fb0';c.lineWidth=6*u;c.beginPath();c.moveTo(X(x),yH);c.lineTo(X(x),yH-160*u);c.moveTo(X(x+110),yH);c.lineTo(X(x+110),yH-160*u);c.moveTo(X(x-50),yH-160*u);c.lineTo(X(x+250),yH-160*u);c.stroke();
  const hx2=x+60+Math.sin(t*.7)*50;c.lineWidth=1.5*u;c.beginPath();c.moveTo(X(hx2),yH-160*u);c.lineTo(X(hx2),yH-110*u);c.stroke();R(c,X(hx2-18),yH-110*u,36*u,18*u,'#e2563f')};
 const light=x=>{const X0=X(x);poly(c,[[X0,yH],[X0+36*u,yH],[X0+29*u,yH-190*u],[X0+7*u,yH-190*u]],'#f4f4f4');
  for(let i=0;i<3;i++){const y1=yH-(i*2+.6)*27*u,y2=yH-(i*2+1.6)*27*u,w1=(1-(yH-y1)/190/1.3*.4)*0+0;poly(c,[[X0+(1.4+i*.1)*u*(1+(yH-y1)/190*0)+0,y1],[X0+36*u-(1.4)*u,y1],[X0+36*u-(7*(yH-y2)/190)*u-1*u,y2],[X0+(7*(yH-y2)/190)*u+1*u,y2]],'#d8402f')}
  R(c,X0+2*u,yH-196*u,32*u,6*u,'#444');R(c,X0+8*u,yH-214*u,20*u,18*u,'#ffe8a0');poly(c,[[X0+4*u,yH-214*u],[X0+18*u,yH-232*u],[X0+32*u,yH-214*u]],'#d8402f');
  pushGlow(c,X0+18*u,yH-205*u,120*u,1,'255,235,160');
  if(NIGHT>.3){c.save();c.globalAlpha=.25*Math.min(1,(NIGHT-.3)*2);const a=t*.9,dx=Math.cos(a);c.fillStyle='#fff4c0';c.beginPath();c.moveTo(X0+18*u,yH-205*u);c.lineTo(X0+18*u+dx*700*u,yH-232*u);c.lineTo(X0+18*u+dx*700*u,yH-178*u);c.fill();c.restore()}};
 const hut=(x,w,col)=>{R(c,X(x),yH-34*u,w*u,34*u,col);poly(c,[[X(x-5),yH-34*u],[X(x+w/2),yH-58*u],[X(x+w+5),yH-34*u]],'#8a3f2e');const lit=NIGHT>.3;R(c,X(x+w*.2),yH-24*u,9*u,10*u,lit?'#ffe08a':'#f3e7d0');if(lit)pushGlow(c,X(x+w*.2+4),yH-19*u,14*u,.7)};
 if(v===0){silo(-200);silo(-150);silo(-100);house(10,160,'#7c4a3c',70);crane(180)}
 else if(v===1){tower(-190);house(-110,150,'#3e6a8a',80);crane(90)}
 else if(v===2){boxes(-215,5);gantry(0);boxes(130,2)}
 else{light(-200);hut(-130,50,'#d9b86a');hut(-70,60,'#c07a54');hut(0,46,'#6aa0b0');house(70,150,'#8a5a3a',58)}
 flag(212);
}

function hullPath(c,L,h,d){c.beginPath();c.moveTo(-L/2,-h);c.lineTo(L/2+h*.6,-h);c.quadraticCurveTo(L/2+h*.1,d*.1,L/2-h*.5,d);c.lineTo(-L/2+h*.7,d);c.quadraticCurveTo(-L/2-h*.1,d*.2,-L/2,-h);c.closePath()}
function wins(c,x,y,w,hh,n,f){const g=w/n,lit=NIGHT>.3;for(let i=0;i<n;i++){const xx=x+g*(i+.2),on=lit&&((i*7)%5);R(c,xx,y,g*.6,hh,on?'#ffe08a':f);if(on&&i%2===0)pushGlow(c,xx+g*.3,y+hh/2,Math.max(5,hh*1.1),.55)}}
function ring(c,x,y,r){c.fillStyle='#ff8a2a';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x,y,r*.45,0,7);c.fill()}
// posisi cerobong asap (pecahan panjang, kelipatan tinggi) untuk asap
const FUNNEL={tug:[-.065,2.6],ferry:[-.16,2.5],cargo:[-.375,3.3],cruise:[-.05,3.6],tanker:[-.4,3.2],navy:[-.19,2.1]};
// y = garis air, kapal menghadap kanan (dir=-1 membalik), ang = kemiringan mengikuti ombak
function drawShip(c,s,x,y,dir,k,ang){
 const L=s.len*k,h=s.h*k,d=h*.5,T=-h,K=s.kind,W='#fff',G='#2b4a5e',A=s.acc2;
 const tri=(a,b,e,f)=>poly(c,[a,b,e],f);let mh=null;
 c.save();c.translate(x,y);c.rotate(ang||0);c.scale(dir,1);
 if(K==='sail'){R(c,-L*.06-1.5*k,-L*.95,3*k,L*.95-h,'#d9d9d9')}
 hullPath(c,L,h,d);c.fillStyle=s.hull;c.fill();
 c.save();c.clip();R(c,-L,0,L*2,d*2,s.bot);R(c,-L,-h*.5,L*2,h*.12,A);
 const hg=c.createLinearGradient(0,-h,0,d);hg.addColorStop(0,'rgba(255,255,255,.25)');hg.addColorStop(.45,'rgba(255,255,255,0)');hg.addColorStop(1,'rgba(0,0,0,.3)');c.fillStyle=hg;c.fillRect(-L,-h,L*2,h+d);
 if(K==='ferry'||K==='cargo'||K==='cruise'||K==='tanker'||K==='navy'||K==='jet'){c.fillStyle='rgba(20,40,60,.55)';for(let q=-L*.4;q<L*.38;q+=h*.9){c.beginPath();c.arc(q,-h*.22,h*.06,0,7);c.fill()}}
 c.restore();
 hullPath(c,L,h,d);c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1.5;c.stroke();
 if(K==='sail'){
  tri([-L*.09,T],[-L*.09,-L*.9],[-L*.46,T],W);tri([-L*.09,T],[-L*.09,T-L*.2],[-L*.32,T],A);
  tri([-L*.03,T],[-L*.03,-L*.78],[L*.4,T],'#cfe8f5');tri([-L*.06,-L*.95],[-L*.06,-L*.9],[-L*.12,-L*.925],A);mh=[-L*.06,-L*.95];
 }else if(K==='pinisi'){
  const mc='#5a3a22';
  R(c,-L*.46,T-h*.75,L*.2,h*.75,'#7a4a26');R(c,-L*.47,T-h*.8,L*.22,3*k,'#c9953f');R(c,-L*.43,T-h*.55,L*.05,h*.28,'#ffe2a0');R(c,-L*.36,T-h*.55,L*.05,h*.28,'#ffe2a0');
  R(c,-L*.14-1.5*k,-L*.98,3*k,L*.98-h,mc);R(c,L*.16-1.5*k,-L*.76,3*k,L*.76-h,mc);
  poly(c,[[-L*.14,T],[-L*.14,-L*.62],[-L*.4,-L*.5],[-L*.44,T]],'#f5e6c0');
  tri([-L*.14,-L*.62],[-L*.14,-L*.94],[-L*.34,-L*.6],A);
  poly(c,[[L*.16,T],[L*.16,-L*.5],[-L*.04,-L*.42],[-L*.08,T]],'#efdcae');
  tri([L*.16,-L*.5],[L*.16,-L*.72],[L*.02,-L*.48],'#e6c88a');
  tri([L*.16,-L*.72],[L*.66,T-h*.15],[L*.16,T],'#f7ecd0');tri([L*.16,-L*.5],[L*.5,T-h*.1],[L*.16,T],'#e2c78d');
  c.strokeStyle=mc;c.lineWidth=3*k;c.beginPath();c.moveTo(L*.4,T);c.lineTo(L*.68,T-h*.3);c.stroke();
  tri([-L*.14,-L*.98],[-L*.14,-L*.93],[-L*.22,-L*.955],'#d8302a');mh=[-L*.14,-L*.98];
 }else if(K==='tug'){
  R(c,-L*.3,T-h*1.05,L*.34,h*1.05,W);R(c,-L*.2,T-h*1.9,L*.2,h*.85,W);
  wins(c,-L*.28,T-h*.85,L*.3,h*.3,3,G);wins(c,-L*.19,T-h*1.7,L*.18,h*.35,3,G);
  R(c,-L*.1,T-h*2.6,L*.07,h*.7,'#222');R(c,-L*.1,T-h*2.2,L*.07,h*.2,'#d8402f');R(c,L*.12,T-h*2.3,2*k,h*2.3,'#ddd');
  c.fillStyle='#ffd34d';c.beginPath();c.arc(L*.12+k,T-h*2.3,3*k,0,7);c.fill();
  c.fillStyle='#111';for(let i=0;i<3;i++){c.beginPath();c.arc(L*.34+i*L*.05,T+h*.4,h*.18,0,7);c.fill()}mh=[L*.12,T-h*2.3];
 }else if(K==='ferry'){
  R(c,-L*.42,T-h*.9,L*.74,h*.9,W);R(c,-L*.42,T-h*.95,L*.74,3*k,A);wins(c,-L*.4,T-h*.7,L*.7,h*.3,14,'#3a6a8f');
  R(c,-L*.34,T-h*1.7,L*.56,h*.8,W);R(c,-L*.34,T-h*1.75,L*.56,3*k,A);wins(c,-L*.32,T-h*1.5,L*.52,h*.3,11,'#3a6a8f');
  R(c,L*.04,T-h*2.3,L*.14,h*.6,W);wins(c,L*.05,T-h*2.15,L*.12,h*.25,4,G);
  R(c,-L*.2,T-h*2.5,L*.08,h*.8,'#f2b84b');R(c,-L*.2,T-h*2.5,L*.08,h*.18,A);
  [-.3,-.1,.1,.3].forEach(q=>ring(c,L*q,-h*.78,h*.15));mh=[L*.11,T-h*2.3];
 }else if(K==='cargo'){
  R(c,-L*.46,T-h*2.6,L*.15,h*2.6,'#f4f4f4');for(let i=0;i<4;i++)wins(c,-L*.45,T-h*2.4+i*h*.55,L*.13,h*.25,3,G);
  R(c,-L*.4,T-h*3.3,L*.05,h*.7,A);
  const col=['#e2563f','#2f7fb5','#f2b84b','#4f9a56','#8e5bb5'];
  for(let i=0;i<5;i++)for(let r=0;r<3;r++){R(c,-L*.28+i*L*.13,T-(r+1)*h*.62,L*.12,h*.58,col[(i*2+r)%5]);R(c,-L*.28+i*L*.13,T-(r+1)*h*.62,L*.12,2*k,'rgba(255,255,255,.35)')}
  [-.3,0,.3].forEach(q=>ring(c,L*q,-h*.78,h*.14));mh=[-L*.38,T-h*3.3];
 }else if(K==='tanker'){
  R(c,-L*.46,T-h*2.5,L*.14,h*2.5,'#f2f2f2');for(let i=0;i<4;i++)wins(c,-L*.45,T-h*2.3+i*h*.55,L*.12,h*.25,3,G);
  R(c,-L*.43,T-h*3.2,L*.055,h*.75,'#222');R(c,-L*.43,T-h*2.8,L*.055,h*.18,A);
  R(c,-L*.3,T-h*.4,L*.72,3*k,'#ccd');for(let i=0;i<9;i++){R(c,-L*.28+i*L*.078,T-h*.38,2*k,h*.38,'#aab');R(c,-L*.28+i*L*.078,T-h*.34-h*.22,L*.05,h*.22,i%3?'#cfd6da':'#e2563f')}
  R(c,L*.08,T-h*1.1,2*k,h*1.1,'#bbb');R(c,L*.08,T-h*1.1,L*.14,2*k,'#bbb');R(c,L*.35,T-h*.8,L*.03,h*.8,'#bbb');
  mh=[-L*.4,T-h*3.2];
 }else if(K==='speed'){
  poly(c,[[-L*.18,T],[-L*.12,T-h*1.05],[L*.08,T-h*1.05],[L*.28,T]],W);
  poly(c,[[-L*.03,T-h*.92],[L*.07,T-h*.92],[L*.2,T-h*.08],[-L*.08,T-h*.08]],'#4a7f9f');
  R(c,-L*.14,T-h*.35,L*.34,3*k,A);R(c,-L*.53,T-h*.1,L*.11,h*.95,'#2a2a2a');R(c,-L*.53,T-h*.1,L*.11,h*.22,'#e2563f');
  R(c,-L*.06,T-h*1.9,1.5*k,h*.9,'#ddd');mh=[-L*.06,T-h*1.9];
 }else if(K==='navy'){
  poly(c,[[-L*.34,T],[-L*.32,T-h*.9],[-L*.22,T-h*1.55],[L*.12,T-h*1.55],[L*.22,T-h*.9],[L*.28,T]],'#9aa5ad');
  poly(c,[[-L*.1,T-h*1.55],[-L*.06,T-h*2.2],[L*.1,T-h*2.2],[L*.14,T-h*1.55]],'#aab4bb');
  wins(c,-L*.07,T-h*2.05,L*.17,h*.28,5,'#1f3340');wins(c,-L*.28,T-h*1.2,L*.5,h*.2,10,'#2a3b46');
  R(c,-L*.02,T-h*3.6,2.5*k,h*1.45,'#444');c.fillStyle='#555';c.beginPath();c.ellipse(L*.0,T-h*3.2,L*.05,h*.1,0,0,7);c.fill();
  R(c,-L*.23,T-h*2.1,L*.055,h*.6,'#555');R(c,-L*.23,T-h*1.6,L*.055,h*.08,'#222');
  R(c,L*.31,T-h*.55,L*.09,h*.55,'#6a7580');R(c,L*.38,T-h*.42,L*.1,2.2*k,'#555');
  R(c,-L*.47,T-h*.12,L*.17,h*.12,'#4a525a');c.fillStyle='#fff';c.font=`bold ${Math.max(5,h*.12)}px sans-serif`;c.textAlign='center';c.fillText('H',-L*.385,T-h*.02);
  for(let i=0;i<3;i++)R(c,L*.2-i*L*.045,T-h*.7,L*.035,h*.3,'#6a7580');
  mh=[-L*.02,T-h*3.6];
 }else if(K==='jet'){
  poly(c,[[-L*.42,T],[-L*.38,T-h*.95],[L*.2,T-h*.95],[L*.36,T]],W);
  wins(c,-L*.35,T-h*.8,L*.52,h*.34,18,'#2a5a8a');R(c,-L*.4,T-h*.42,L*.76,4*k,A);
  poly(c,[[-L*.04,T-h*.95],[0,T-h*1.55],[L*.16,T-h*1.55],[L*.2,T-h*.95]],'#f0f5f8');wins(c,-L*.0,T-h*1.45,L*.15,h*.3,4,'#2a4a6a');
  R(c,-L*.52,T-h*.35,L*.08,h*.35,'#555');R(c,L*.05,T-h*2.2,1.5*k,h*.65,'#ddd');mh=[L*.05,T-h*2.2];
 }else{
  for(let i=0;i<4;i++){const x0=-L*.42+i*L*.05,w=L*.82-i*L*.1,y0=T-(i+1)*h*.62;
   R(c,x0,y0,w,h*.6,W);R(c,x0,y0,w,2*k,'#d4dde2');wins(c,x0+4*k,y0+h*.18,w-8*k,h*.22,20-i*3,'#2c86c7')}
  R(c,-L*.08,T-h*3.6,L*.06,h*.9,'#f08a2a');R(c,-L*.08,T-h*3.6,L*.06,h*.15,'#1c3b5c');R(c,L*.1,T-h*3.6,2*k,h*1.1,'#ddd');mh=[L*.1,T-h*3.6];
 }
 if(mh&&NIGHT>.3){c.fillStyle='#fff';c.beginPath();c.arc(mh[0],mh[1],2*k+1,0,7);c.fill();pushGlow(c,mh[0],mh[1],22*k+10,.9,'255,255,230')}
 if(NIGHT>.3){pushGlow(c,L/2,T,16*k+6,.8,'60,255,120');pushGlow(c,-L/2,T,16*k+6,.8,'255,60,60')}
 c.restore();
}

// Mesin game tampak samping, UI, toko, dan pengaturan
const $=id=>document.getElementById(id),fmt=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
const fmtD=px=>{const k=px/KM;return k>=1?k.toFixed(1)+' km':Math.round(k*1000)+' m'};
const cv=$('c'),cx=cv.getContext('2d'),mini=$('mini').getContext('2d'),gc=$('gauge').getContext('2d'),bigC=$('big');
let W,H,yH,yS,sc,DPR=1,vig=null;
function resize(){const d=Math.min(devicePixelRatio||1,2);DPR=d;W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);yH=H*.5;yS=H*.66;sc=Math.max(.55,Math.min(1.2,W/1000,H/650));
 vig=cx.createRadialGradient(W/2,H/2,Math.min(W,H)*.4,W/2,H/2,Math.max(W,H)*.78);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,10,25,.38)')}
addEventListener('resize',resize);resize();

const save=loadSave();
let mode='menu',ship=null,t=0,off=0,fx=[],lines=[],fxT=0,smokeT=0,angS=0,storm=0,flash=0,bolt=0,wxState=0,lineT=0;
const keys={},pedal={gas:false,brake:false};
const ports=PORTS.map((p,i)=>({...p,id:i,q:[],tm:3+i*.7,cool:0}));
const cur=()=>SHIPS[save.sel],cnt=k=>ship.items.filter(i=>i.t===k).length;

function spawn(p){
 if(p.q.length>=12)return;let d;do{d=ports[Math.random()*ports.length|0]}while(d===p);
 const tp=Math.random()<.55?'p':'c';
 p.q.push({t:tp,dest:d.id,pay:Math.round(Math.abs(p.x-d.x)/100*(tp==='p'?1.3:1))});
}
ports.forEach(p=>{for(let i=0;i<6;i++)spawn(p)});
function newShip(){ship={x:ports[0].x-300,v:0,dir:1,items:[],sid:save.sel,cruise:false,rough:0};off=W*.36;fx=[];lines=[];angS=0}

// Cuaca: laut tenang dekat pelabuhan, makin ganas di laut lepas
function roughAt(x){let d=1e9;for(const p of ports)d=Math.min(d,Math.abs(p.x-x));
 const base=clamp((d-3500)/7000,0,1),zone=.35+.65*(.5+.5*Math.sin(x*.00004+1.3));return clamp(base*zone*1.15,0,1)}
// jarak henti (px) dari kecepatan v (km/j) sampai 25 km/j dengan rem penuh
const stopDist=v=>v>25?PX*(2*(v-25)-200*Math.log((100+v)/125)):0;
function nextPort(){let b=null,bd=1e12;ports.forEach(p=>{const dx=(p.x-ship.x)*ship.dir;if(dx>-120&&dx<bd){bd=dx;b=p}});return b?{p:b,d:Math.max(0,bd)}:null}

// ===== Suara (WebAudio, tanpa file): laut, mesin, ombak, hujan, klakson, lonceng, burung camar =====
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
   this.rain=noise('highpass',2600,.5);
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
  const r=pl?Math.min(1,ship.v/S.speed):0,gas=pl&&(keys.ArrowUp||keys.w||pedal.gas||ship.cruise),brk=pl&&(keys.ArrowDown||keys.s||keys[' ']||pedal.brake);
  this.amb.g.gain.setTargetAtTime(pl?.16+storm*.1:.22,n,.3);
  this.wake.g.gain.setTargetAtTime(.02+r*.2+(brk&&r>.15?.08:0),n,.15);
  this.wake.fl.frequency.setTargetAtTime(900+r*1400,n,.2);
  this.rain.g.gain.setTargetAtTime(pl?storm*.1:0,n,.4);
  const base={tug:46,ferry:56,cargo:38,cruise:64,speed:92,tanker:30,navy:60,jet:110}[S.kind]||50,eng=pl&&S.kind!=='sail'&&S.kind!=='pinisi';
  this.eg.gain.setTargetAtTime(eng?.05+r*.07+(gas?.03:0):0,n,.2);
  this.o1.frequency.setTargetAtTime(base*(1+r*1.1),n,.15);this.o2.frequency.setTargetAtTime(base*.5*(1+r*1.1),n,.15);
  this.cl.frequency.setTargetAtTime(S.kind==='tug'||S.kind==='cargo'||S.kind==='tanker'?5+r*9:11+r*14,n,.2);
  this.gt-=dt;if(this.gt<=0){this.gt=7+Math.random()*9;this.gull()}
 },
 hornOn(){
  if(!this.ac||this.h)return;const ac=this.ac,n=ac.currentTime,g=ac.createGain(),lp=ac.createBiquadFilter();
  lp.type='lowpass';lp.frequency.value=1000;g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(.22,n+.06);
  const f={sail:[330,415],pinisi:[260,330],tug:[150,190],ferry:[120,150],cargo:[82,103],cruise:[98,123],speed:[400,500],tanker:[70,88],navy:[110,140],jet:[200,250]}[cur().kind];
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
 thunder(){this.tone(70,1.6,'sawtooth',.18,24);this.tone(48,1.2,'square',.1,20)},
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
 let bonus=0;if(gain&&Math.abs(ship.x-p.x)<90){bonus=Math.round(gain*.1);gain+=bonus}
 if(gain){save.money+=gain;writeSave(save);A.coin()}
 if(out||inn){A.ding();A.horn(.7);toast(`${p.name}: turun ${out}, naik ${inn}${gain?' · +'+fmt(gain):''}${bonus?' (sandar sempurna +10%)':''}`)}
 else if(p.q.length)toast(`${p.name}: muatan penuh, antar dulu yang ada di kapal`);
}
function toggleCruise(){if(mode!=='play')return;ship.cruise=!ship.cruise;$('bCruise').classList.toggle('on',ship.cruise);toast(ship.cruise?'Autopilot aktif — mati otomatis saat mendekati pelabuhan':'Autopilot mati')}

const emit=(k,o)=>{if(fx.length<520)fx.push(Object.assign({k,l:1},o))};
function amp(r){return(1.5+6*r)*sc*(save.waves?1:.2)}
function update(dt){
 const S=cur(),brk=keys.ArrowDown||keys.s||keys[' ']||pedal.brake;
 if(brk&&ship.cruise){ship.cruise=false;$('bCruise').classList.remove('on')}
 const gas=keys.ArrowUp||keys.w||pedal.gas||ship.cruise;
 ship.rough+=(roughAt(ship.x)-ship.rough)*Math.min(1,dt*.8);
 const st=clamp((ship.rough-.55)/.3,0,1);storm=st;
 const lvl=ship.rough>.8?3:ship.rough>.55?2:ship.rough>.3?1:0;
 if(lvl!==wxState){if(lvl>wxState&&lvl>=2)toast(lvl===3?'⛈ Badai! Ombak tinggi memperlambat kapal':'🌊 Ombak mulai tinggi');wxState=lvl}
 const cap=S.speed*(1-ship.rough*.1*(1-Math.min(1,S.len/450)*.7));
 if(gas){if(ship.v<cap)ship.v=Math.min(cap,ship.v+S.speed*.22*S.acc*dt)}else ship.v*=Math.pow(.86,dt);
 if(ship.v>cap)ship.v=Math.max(cap,ship.v-60*dt);
 if(brk)ship.v=Math.max(0,ship.v-(50+ship.v*.5)*dt);
 if(ship.cruise){const n=nextPort();if(n&&n.d<stopDist(ship.v)*1.25+600){ship.cruise=false;$('bCruise').classList.remove('on');toast('Autopilot mati — bersiap sandar, tekan REM')}}
 if(ship.v<30){if(keys.ArrowLeft||keys.a)ship.dir=-1;if(keys.ArrowRight||keys.d)ship.dir=1}
 ship.x+=ship.dir*ship.v*PX*dt;
 if(ship.x<120||ship.x>WORLD.w-120){ship.x=Math.max(120,Math.min(WORLD.w-120,ship.x));ship.v=0}
 // efek: buih, percikan, asap, garis kecepatan, petir
 const vr=ship.v/450,wy=yS+waveH(ship.x,t,amp(ship.rough)),L=S.len*sc;
 fxT-=dt;if(fxT<=0&&ship.v>20){fxT=.05;emit('foam',{x:ship.x-ship.dir*L*.45,life:1.6,r:6+vr*16});
  const n=Math.ceil(ship.v/70);for(let i=0;i<n;i++)emit('spray',{x:ship.x+ship.dir*L*.48,y:wy,vx:ship.dir*ship.v*PX*(.1+Math.random()*.5)+(Math.random()-.5)*50,vy:-(50+Math.random()*170)*(.35+vr),life:.5+Math.random()*.6,r:1.5+Math.random()*2.5})}
 const fn=FUNNEL[S.kind];smokeT-=dt;if(fn&&smokeT<=0){smokeT=.1;emit('smoke',{x:ship.x+ship.dir*fn[0]*L,y:wy-(1+fn[1])*S.h*sc,vx:-ship.dir*10+(Math.random()-.5)*12,vy:-30-Math.random()*20,life:2.4,r:3*sc})}
 fx.forEach(p=>{p.l-=dt/p.life;if(p.k!=='foam'){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k==='spray')p.vy+=520*dt}});fx=fx.filter(p=>p.l>0);
 lineT-=dt;if(lineT<=0&&vr>.3){lineT=.07/vr;lines.push({x:Math.random()*W,y:yH+(H-yH)*(.15+Math.random()*.85),l:1,k:.6+Math.random()*.8})}
 lines.forEach(q=>{q.l-=dt*1.6;q.x-=ship.dir*ship.v*PX*q.k*dt*((q.y-yH)/(H-yH)+.2)});lines=lines.filter(q=>q.l>0);
 if(storm>.5&&Math.random()<dt*.15*storm){flash=1;bolt=W*(.15+Math.random()*.7);setTimeout(()=>A.thunder(),300+Math.random()*900)}
 flash=Math.max(0,flash-dt*3);
 ports.forEach(p=>{p.tm-=dt;if(p.tm<=0){p.tm=4+Math.random()*4;spawn(p)}
  p.cool-=dt;if(p.cool<=0&&Math.abs(ship.x-p.x)<260&&ship.v<30){dock(p);p.cool=1.5}});
}

function render(){
 const S=cur(),menu=mode!=='play';let camX;
 const sky=getSky(t);NIGHT=sky.n;GL=[];
 const vr=menu?0:Math.min(1,ship.v/450),rough=menu?.06:ship.rough,a=amp(rough),hq=save.waves;
 if(menu)camX=ports[0].x-W*.3+Math.sin(t*.2)*30;
 else{off+=((ship.dir>0?W*(.36-.1*vr):W*(.64+.1*vr))-off)*.05;camX=ship.x-off}
 const shk=menu?0:vr*(.5+rough*1.8);cx.save();if(shk)cx.translate((Math.random()-.5)*shk*2,(Math.random()-.5)*shk*2);
 cx.textAlign='center';cx.lineJoin='round';
 drawBack(cx,W,H,yH,camX,t,sky);drawSeaFar(cx,W,H,yH,yS,camX,t,sky,a,rough,hq);
 ports.forEach(p=>{const sx=p.x-camX;if(sx<-500||sx>W+500)return;drawPort(cx,p,sx,yH,sc,t)});
 // kapal + gerak mengikuti ombak
 const k=menu?sc*1.4:sc,sxp=menu?W*.7:ship.x-camX,xw=camX+sxp,Lh=S.len*k*.5;
 const wl=waveH(xw-Lh,t,a),wm=waveH(xw,t,a),wr=waveH(xw+Lh,t,a),y=yS+(wl+2*wm+wr)/4;
 const tg=clamp(Math.atan2(wr-wl,Lh*2)*.9-(menu?0:ship.dir*vr*.035),-.25,.25);angS+=(tg-angS)*.15;
 const dirS=menu?1:ship.dir;
 // buih jejak
 fx.forEach(p=>{if(p.k!=='foam')return;const xx=p.x-camX,yy=yS+waveH(p.x,t,a)+4*sc;cx.fillStyle=`rgba(255,255,255,${p.l*.5})`;cx.beginPath();cx.ellipse(xx,yy,p.r*(1+(1-p.l)*1.4),(2+(1-p.l)*3)*sc,0,0,7);cx.fill()});
 // bayangan kapal di air
 cx.fillStyle='rgba(0,30,40,.25)';cx.beginPath();cx.ellipse(sxp,y+S.h*k*.55,S.len*k*.5,4*k,0,0,7);cx.fill();
 // asap
 fx.forEach(p=>{if(p.k!=='smoke')return;cx.fillStyle=`rgba(75,78,86,${p.l*.4})`;cx.beginPath();cx.arc(p.x-camX,p.y,p.r*(1+(1-p.l)*5),0,7);cx.fill()});
 drawShip(cx,S,sxp,y,dirS,k,angS);
 seaLayer(cx,W,H,yH,yS,camX,t,1,a,'rgba(18,100,114,.8)',true,rough);
 // percikan di depan lambung
 fx.forEach(p=>{if(p.k!=='spray')return;cx.fillStyle=`rgba(255,255,255,${Math.min(1,p.l*1.4)*.85})`;cx.beginPath();cx.arc(p.x-camX,p.y,p.r,0,7);cx.fill()});
 const nf=hq?[1.3,1.7,2.2,2.9]:[1.6];
 nf.forEach((f,i)=>seaLayer(cx,W,H,yH,yS,camX,t,f,a,['rgba(22,128,138,.88)','rgba(19,111,125,.9)','rgba(15,94,108,.92)','rgba(11,76,90,.94)'][hq?i:1],true,rough));
 // garis kecepatan
 cx.lineCap='round';lines.forEach(q=>{cx.strokeStyle=`rgba(255,255,255,${q.l*.35})`;cx.lineWidth=1.5;cx.beginPath();cx.moveTo(q.x,q.y);cx.lineTo(q.x+dirS*vr*90*q.k,q.y);cx.stroke()});
 // zona sandar
 ports.forEach(p=>{const sx=p.x-camX;if(sx<-500||sx>W+500)return;
  const near=!menu&&Math.abs(ship.x-p.x)<260&&ship.v<30;
  cx.strokeStyle=near?'rgba(120,255,160,.95)':'rgba(255,255,255,.65)';cx.lineWidth=2.5;cx.setLineDash([12,10]);cx.beginPath();cx.ellipse(sx,yS+26*sc,260,12*sc,0,0,7);cx.stroke();cx.setLineDash([])});
 // hujan & kilat
 if(storm>.04){cx.fillStyle=`rgba(40,52,70,${storm*.35})`;cx.fillRect(0,0,W,H);
  cx.strokeStyle=`rgba(200,220,235,${.25+storm*.3})`;cx.lineWidth=1.2;cx.beginPath();
  const n=Math.floor(60+170*storm);for(let i=0;i<n;i++){const rx=((i*137.1-t*260)%W+W)%W,ry=((i*89.3+t*(1000+(i%3)*220))%H);cx.moveTo(rx,ry);cx.lineTo(rx-5,ry+17)}cx.stroke()}
 if(flash>.02){if(flash>.6){cx.strokeStyle=`rgba(255,255,255,${flash})`;cx.lineWidth=3;cx.beginPath();let bx=bolt,by=0;cx.moveTo(bx,by);while(by<yH){bx+=(Math.random()-.5)*50;by+=26;cx.lineTo(bx,by)}cx.stroke()}
  cx.fillStyle=`rgba(255,255,255,${flash*.35})`;cx.fillRect(0,0,W,H)}
 // filter malam + cahaya lampu
 if(NIGHT>.02){cx.globalCompositeOperation='multiply';cx.fillStyle=mix('#ffffff','#66749f',NIGHT);cx.fillRect(0,0,W,H);cx.globalCompositeOperation='source-over'}
 cx.restore();
 cx.fillStyle=vig;cx.fillRect(0,0,W,H);
 if(GL.length){cx.save();cx.setTransform(1,0,0,1,0,0);cx.globalCompositeOperation='lighter';
  GL.forEach(g=>{const r=Math.max(2,g.r),gr=cx.createRadialGradient(g.x,g.y,0,g.x,g.y,r);gr.addColorStop(0,`rgba(${g.c},${g.a})`);gr.addColorStop(1,`rgba(${g.c},0)`);cx.fillStyle=gr;cx.fillRect(g.x-r,g.y-r,r*2,r*2)});cx.restore()}
 // nama pelabuhan
 cx.textAlign='center';
 ports.forEach(p=>{const sx=p.x-camX;if(sx<-500||sx>W+500)return;
  const np=p.q.filter(i=>i.t==='p').length,nc=p.q.length-np,py=yH-255*sc;
  cx.font='bold 20px Georgia';cx.strokeStyle='#0a3d56';cx.lineWidth=4;cx.strokeText(p.name,sx,py);cx.fillStyle='#fff';cx.fillText(p.name,sx,py);
  cx.font='14px Trebuchet MS';const s=`👥 ${np}   📦 ${nc}`;cx.strokeText(s,sx,py+20);cx.fillStyle='#fff3c4';cx.fillText(s,sx,py+20)});
 if(!menu)hud(sky);
}

function hud(sky){
 const S=cur();
 $('hMoney').textContent=fmt(save.money);
 $('hPass').textContent=`Penumpang ${cnt('p')}/${S.pass}`;
 $('hCargo').textContent=`Kargo ${cnt('c')}/${S.cargo}`;
 let np=ports[0];ports.forEach(p=>{if(Math.abs(p.x-ship.x)<Math.abs(np.x-ship.x))np=p});
 $('hPort').textContent=Math.abs(np.x-ship.x)<3000?'⚓ '+np.name:'Laut Lepas';
 const m={};ship.items.forEach(i=>m[i.dest]=(m[i.dest]||0)+1);
 const s=Object.keys(m).map(d=>{const p=ports[d],dx=p.x-ship.x;return `${p.name} ×${m[d]} ${dx>0?'▶':'◀'} ${fmtD(Math.abs(dx))}`}).join(' · ');
 const el=$('hDest');if(el.textContent!==(s?'Tujuan: '+s:''))el.textContent=s?'Tujuan: '+s:'';
 const r=ship.rough,wl=r<.3?'🌤 Laut tenang':r<.55?'🌊 Ombak sedang':r<.8?'🌊 Ombak tinggi':'⛈ Badai';
 $('hWx').textContent=`${todName(sky.p)} · ${wl} · ${(.3+3.2*r).toFixed(1)} m`;
 const n=nextPort(),w=$('hWarn');
 if(n&&ship.v>60&&n.d<stopDist(ship.v)*1.7+900){w.textContent=`⚠ PERLAMBAT — ⚓ ${n.p.name} ${fmtD(n.d)}`;w.classList.add('on')}else w.classList.remove('on');
 if(save.mini)drawRoute(mini,260,56,false);
 if(!$('mapov').classList.contains('hide'))drawRoute(bigC.getContext('2d'),bigC.width,bigC.height,true);
 drawGauge(ship.v,S.speed);
}
function drawGauge(v,mx){
 const c=gc,x0=110,y0=112,r=98,MX=450,A=a=>Math.PI+Math.min(a,MX)/MX*Math.PI;c.clearRect(0,0,220,125);
 let g=c.createRadialGradient(x0,y0,10,x0,y0,r+8);g.addColorStop(0,'#143b52');g.addColorStop(1,'#08202e');
 c.fillStyle=g;c.beginPath();c.arc(x0,y0,r+8,Math.PI,0);c.closePath();c.fill();
 c.strokeStyle='#f2b84b';c.lineWidth=3;c.beginPath();c.arc(x0,y0,r+5,Math.PI,0);c.stroke();
 g=c.createLinearGradient(x0-r,0,x0+r,0);g.addColorStop(0,'#4ee08a');g.addColorStop(.6,'#f2b84b');g.addColorStop(1,'#e2563f');
 c.strokeStyle=g;c.lineWidth=6;c.lineCap='butt';c.beginPath();c.arc(x0,y0,r-8,Math.PI,A(mx));c.stroke();
 c.fillStyle='#fff';c.textAlign='center';c.font='bold 10px Trebuchet MS';
 for(let i=0;i<=450;i+=25){const a=A(i),m=i%50===0,co=Math.cos(a),si=Math.sin(a);
  c.strokeStyle=m?'#fff':'#9bb';c.lineWidth=m?2.5:1.2;c.beginPath();c.moveTo(x0+co*(r-14),y0+si*(r-14));c.lineTo(x0+co*(r-(m?24:19)),y0+si*(r-(m?24:19)));c.stroke();
  if(i%100===0)c.fillText(i,x0+co*(r-38),y0+si*(r-38)+4)}
 const a=A(v);c.strokeStyle='#ff5a43';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);c.lineTo(x0+Math.cos(a)*(r-16),y0+Math.sin(a)*(r-16));c.stroke();
 c.fillStyle='#f2b84b';c.beginPath();c.arc(x0,y0,9,0,7);c.fill();
 c.fillStyle='#fff';c.font='bold 22px Trebuchet MS';c.fillText(Math.round(v),x0,y0-32);c.font='10px Trebuchet MS';c.fillStyle='#9fe3d0';c.fillText('KM/J',x0,y0-20);
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
function show(id){['menu','shop','settings'].forEach(s=>$(s).classList.toggle('hide',s!==id));$('hud').classList.add('hide');$('mapov').classList.add('hide');mode='menu';pedal.gas=pedal.brake=false;storm=0;flash=0;if(ship){ship.cruise=false;$('bCruise').classList.remove('on')}if(id==='menu')$('mMoney').textContent='Uang: '+fmt(save.money)}
function play(){if(!ship||ship.sid!==save.sel)newShip();mode='play';['menu','shop','settings'].forEach(s=>$(s).classList.add('hide'));$('hud').classList.remove('hide');$('mini').classList.toggle('hide',!save.mini);toast('Tahan GAS (↑/W), REM (↓/S), C = autopilot, H = klakson. Sandar pelan di cincin putih')}
$('bPlay').onclick=play;$('bShop').onclick=()=>{renderShop();show('shop')};$('bSet').onclick=()=>{syncSet();show('settings')};
$('shopBack').onclick=$('setBack').onclick=$('bMenu').onclick=()=>show('menu');
$('bMap').onclick=toggleMap;$('mapov').onclick=()=>$('mapov').classList.add('hide');
$('bFlip').onclick=()=>{if(ship.v<30)ship.dir*=-1;else toast('Kurangi kecepatan dulu untuk memutar haluan')};
$('bCruise').onclick=toggleCruise;
[['bGas','gas'],['bBrake','brake']].forEach(([id,k])=>{const b=$(id),on=v=>e=>{e.preventDefault();if(v)try{b.setPointerCapture(e.pointerId)}catch(x){}pedal[k]=v;b.classList.toggle('on',v)};
 b.addEventListener('pointerdown',on(true));['pointerup','pointercancel'].forEach(ev=>b.addEventListener(ev,on(false)))});

function renderShop(){
 NIGHT=0;GL=null;
 $('shopMoney').textContent=fmt(save.money);const g=$('shopList');g.innerHTML='';
 const bar=(l,v,m,tx)=>`<div class="bar"><span>${l}</span><em><i style="width:${v/m*100}%"></i></em><small>${tx}</small></div>`;
 SHIPS.slice().sort((a,b)=>a.price-b.price).forEach(s=>{
  const own=save.owned.includes(s.id),el=document.createElement('div');el.className='card'+(save.sel===s.id?' on':'');
  el.innerHTML=`<canvas width="260" height="130"></canvas><h3>${s.name}</h3>${bar('Kecepatan',s.speed,450,s.speed+' km/j')}${bar('Penumpang',s.pass,60,s.pass)}${bar('Kargo',s.cargo,48,s.cargo)}${bar('Akselerasi',s.acc,1.6,'')}<button></button>`;
  const c=el.querySelector('canvas').getContext('2d'),gr=c.createLinearGradient(0,0,0,130);gr.addColorStop(0,'#9fc3cf');gr.addColorStop(.7,'#e0eae6');gr.addColorStop(.7,'#3aa58f');gr.addColorStop(1,'#1f6f74');c.fillStyle=gr;c.fillRect(0,0,260,130);
  const tall=s.kind==='sail'?s.len*.95:s.kind==='pinisi'?s.len:s.kind==='speed'?s.h*2.2:s.h*3.9;
  const k=Math.min(215/s.len,92/tall);
  drawShip(c,s,130,96,1,k,0);c.fillStyle='rgba(24,108,112,.8)';c.fillRect(0,96,260,34);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(0,96,260,2);
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
 if(mode==='play'){if(k.startsWith('Arrow')||k===' ')e.preventDefault();if(k==='m')toggleMap();if(k==='c'&&!e.repeat)toggleCruise();if(k==='h')A.hornOn();if(k==='Escape'){$('mapov').classList.contains('hide')?show('menu'):toggleMap()}}});
addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false;if(k==='h')A.hornOff()});

show('menu');syncSet();
let last=performance.now();
(function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;if(mode==='play')update(dt);A.tick(dt);render();requestAnimationFrame(loop)})(last);
