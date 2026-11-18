// Data kapal, pelabuhan, pulau, dan penyimpanan
const WORLD={w:4200,h:2800};
const SHIPS=[
 {id:0,kind:'sail',name:'Perahu Pinisi',price:0,speed:150,pass:6,cargo:4,len:48,hull:'#8a5a34',deck:'#d9b27c',cab:'#f3e7d0',acc:'#e2563f'},
 {id:1,kind:'ferry',name:'Feri Bahari',price:1500,speed:185,pass:22,cargo:6,len:60,hull:'#1d5f8a',deck:'#e9eef2',cab:'#ffffff',acc:'#f2b84b'},
 {id:2,kind:'cargo',name:'Kargo Samudra',price:3200,speed:165,pass:6,cargo:26,len:74,hull:'#b23a2e',deck:'#3b4a56',cab:'#f4f4f4',acc:'#f2b84b'},
 {id:3,kind:'cruise',name:'Pesiar Nusantara',price:6500,speed:240,pass:40,cargo:16,len:82,hull:'#f6f6f2',deck:'#c9a24a',cab:'#ffffff',acc:'#0a3d56'}
];
// a = arah dermaga (radian) dari pusat pulau
const PORTS=[
 {name:'Surabaya',x:700,y:650,r:130,a:.5,s:1},
 {name:'Benoa',x:1800,y:380,r:110,a:1.9,s:2},
 {name:'Labuan Bajo',x:2950,y:640,r:120,a:2.4,s:3},
 {name:'Makassar',x:3600,y:1650,r:130,a:3.4,s:4},
 {name:'Banyuwangi',x:1450,y:1500,r:115,a:-.6,s:5},
 {name:'Ambon',x:2650,y:2250,r:125,a:-2.2,s:6},
 {name:'Ternate',x:3650,y:2450,r:95,a:3.9,s:7}
];
const DECOR=[
 {x:1150,y:1000,r:70,s:8},{x:2250,y:1050,r:90,s:9},{x:3200,y:1200,r:60,s:10},{x:450,y:1650,r:100,s:11},
 {x:1900,y:2000,r:80,s:12},{x:800,y:2300,r:90,s:13},{x:3950,y:700,r:70,s:14},{x:2300,y:1600,r:55,s:15}
];
const DEF={money:0,owned:[0],sel:0,sound:true,mini:true,waves:true};
function loadSave(){try{return Object.assign({},DEF,{owned:[0]},JSON.parse(localStorage.getItem('kapalkapal')||'{}'))}catch(e){return Object.assign({},DEF,{owned:[0]})}}
function writeSave(s){try{localStorage.setItem('kapalkapal',JSON.stringify(s))}catch(e){}}
