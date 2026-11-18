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
const DEF={money:0,owned:[0],sel:0,sound:true,mini:true,waves:true};
function loadSave(){try{return Object.assign({},DEF,{owned:[0]},JSON.parse(localStorage.getItem('kapalkapal2')||'{}'))}catch(e){return Object.assign({},DEF,{owned:[0]})}}
function writeSave(s){try{localStorage.setItem('kapalkapal2',JSON.stringify(s))}catch(e){}}
