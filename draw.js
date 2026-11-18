// Gambar kapal, pulau, dan pelabuhan
function edgeR(i,a){return i.r*(1+.13*Math.sin(3*a+i.s)+.07*Math.sin(5*a+i.s*2))}
function islandPath(c,i,k){c.beginPath();for(let n=0;n<=48;n++){const a=n/48*Math.PI*2,r=edgeR(i,a)*k,x=i.x+Math.cos(a)*r,y=i.y+Math.sin(a)*r;n?c.lineTo(x,y):c.moveTo(x,y)}c.closePath()}
function drawIsland(c,i){
 islandPath(c,i,1.38);c.fillStyle='rgba(130,225,215,.32)';c.fill();
 islandPath(c,i,1.12);c.fillStyle='#ecd9a0';c.fill();
 islandPath(c,i,.88);c.fillStyle='#4f9a56';c.fill();
 islandPath(c,i,.5);c.fillStyle='#3d8447';c.fill();
 const n=Math.floor(i.r/7);
 for(let k=0;k<n;k++){const a=k*2.39996+i.s,rr=Math.sqrt((k+.5)/n)*.66*edgeR(i,a),x=i.x+Math.cos(a)*rr,y=i.y+Math.sin(a)*rr,s=6+k%3*2;
  c.fillStyle='#2b6f38';c.beginPath();c.arc(x,y,s,0,7);c.fill();c.fillStyle='#5bb064';c.beginPath();c.arc(x-1.5,y-1.5,s*.55,0,7);c.fill()}
}
function drawPort(c,p,t){
 const a=p.a,e=edgeR(p,a),x0=p.x+Math.cos(a)*e*.9,y0=p.y+Math.sin(a)*e*.9;
 c.lineCap='butt';c.strokeStyle='#6b4a2c';c.lineWidth=15;c.beginPath();c.moveTo(x0,y0);c.lineTo(p.dx,p.dy);c.stroke();
 c.strokeStyle='#b88a58';c.lineWidth=10;c.stroke();
 c.fillStyle='#b88a58';c.beginPath();c.arc(p.dx,p.dy,18,0,7);c.fill();c.strokeStyle='#6b4a2c';c.lineWidth=3;c.stroke();
 for(let k=-1;k<=1;k++){const b=a+k*.55+.25,rr=p.r*.55,hx=p.x+Math.cos(b)*rr,hy=p.y+Math.sin(b)*rr;
  c.fillStyle='#f3e7d0';c.fillRect(hx-9,hy-6,18,13);c.fillStyle='#c4452f';c.fillRect(hx-11,hy-9,22,6)}
 c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2.5;c.setLineDash([10,10]);c.beginPath();c.arc(p.dx,p.dy,80+Math.sin(t*3)*4,0,7);c.stroke();c.setLineDash([]);
}
function hullPath(c,L,W,sc){c.beginPath();c.moveTo(-L/2*sc,-W/2*sc);c.lineTo(L*.2*sc,-W/2*sc);c.quadraticCurveTo(L/2*sc,-W*.35*sc,L/2*sc,0);c.quadraticCurveTo(L/2*sc,W*.35*sc,L*.2*sc,W/2*sc);c.lineTo(-L/2*sc,W/2*sc);c.closePath()}
function drawShip(c,s,x,y,a,k){
 const L=s.len*k,W=L*.36;
 c.save();c.translate(x+3*k,y+4*k);c.rotate(a);hullPath(c,L,W,1);c.fillStyle='rgba(0,0,0,.22)';c.fill();c.restore();
 c.save();c.translate(x,y);c.rotate(a);
 hullPath(c,L,W,1);c.fillStyle=s.hull;c.fill();c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1.5*k;c.stroke();
 hullPath(c,L,W,.84);c.fillStyle=s.deck;c.fill();c.strokeStyle=s.acc;c.lineWidth=2*k;c.stroke();
 const box=(bx,by,w,h,f)=>{c.fillStyle=f;c.fillRect(bx,by,w,h);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=k;c.strokeRect(bx,by,w,h)};
 const funnel=(fx)=>{c.fillStyle=s.acc;c.beginPath();c.arc(fx,0,W*.12,0,7);c.fill();c.fillStyle='#222';c.beginPath();c.arc(fx,0,W*.06,0,7);c.fill()};
 if(s.kind==='sail'){
  c.fillStyle='#f6ecd4';c.strokeStyle='#8a6a3c';c.lineWidth=1.2*k;
  c.beginPath();c.moveTo(-L*.2,0);c.quadraticCurveTo(L*.05,-W*.95,L*.3,-W*.1);c.lineTo(-L*.2,0);c.fill();c.stroke();
  c.beginPath();c.moveTo(L*.3,0);c.quadraticCurveTo(L*.38,W*.5,L*.42,W*.05);c.lineTo(L*.3,0);c.fill();c.stroke();
  c.fillStyle='#5a3a20';c.beginPath();c.arc(-L*.2,0,W*.07,0,7);c.fill();
  box(-L*.44,-W*.2,L*.18,W*.4,s.cab);
 }else if(s.kind==='ferry'){
  box(-L*.3,-W*.27,L*.34,W*.54,s.cab);
  c.fillStyle='#2b4a5e';for(let i=0;i<4;i++)c.fillRect(-L*.27+i*L*.075,-W*.2,L*.05,W*.4);
  box(-L*.3,-W*.27,L*.34,W*.54,'rgba(255,255,255,0)');funnel(-L*.13);
  c.fillStyle=s.acc;for(let r=0;r<2;r++)for(let i=0;i<4;i++){c.beginPath();c.arc(L*.1+i*L*.07,(r?1:-1)*W*.2,W*.06,0,7);c.fill()}
 }else if(s.kind==='cargo'){
  box(-L*.42,-W*.3,L*.17,W*.6,s.cab);funnel(-L*.33);
  const col=['#e2563f','#2f7fb5','#f2b84b','#4f9a56'];
  for(let i=0;i<4;i++)for(let r=0;r<3;r++)box(-L*.18+i*L*.13,-W*.36+r*W*.245,L*.115,W*.22,col[(i+r*2)%4]);
 }else{
  box(-L*.38,-W*.3,L*.46,W*.6,s.cab);box(-L*.26,-W*.2,L*.24,W*.4,'#e8eef2');
  c.fillStyle='#2b4a5e';for(let i=0;i<6;i++)c.fillRect(-L*.36+i*L*.065,-W*.28,L*.04,W*.05);
  funnel(-L*.14);funnel(-L*.04);
  box(L*.16,-W*.18,L*.17,W*.36,'#4fc3e8');
  c.fillStyle=s.acc;for(let i=0;i<3;i++){c.fillRect(L*.15+i*L*.06,-W*.3,L*.04,W*.06);c.fillRect(L*.15+i*L*.06,W*.24,L*.04,W*.06)}
 }
 c.restore();
}
