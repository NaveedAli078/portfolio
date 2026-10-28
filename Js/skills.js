const D=[
{k:"rs",i:"🛰️",c:"#2f8f9d",t:"Remote Sensing Data",d:"Multi-sensor imagery",g:[
["🌍 Optical","Landsat, Sentinel-2, MODIS, SuperView, Planet Labs"],
["📡 SAR","Sentinel-1, K-S1, PRSS-S1"],
["🌡️ Thermal","Landsat, HJ-1, Terra, NOAA-20/21, PRSS-1"],
["🌈 Hyperspectral","EMIT (NASA), PRISMA, PRSS-1"],
["🔦 LiDAR","GEDI (NASA), ICESat-2"]]},
{k:"gis",i:"🗺️",c:"#4a78b5",t:"GIS Platforms & Software",d:"Desktop, cloud & database",g:[
["🖥️ Desktop","QGIS, ArcMap, ArcGIS Pro, Global Mapper"],
["🧪 Image processing","SNAP"],
["☁️ Cloud","Google Earth Engine, ArcGIS Online"],
["🗄️ Database","PostgreSQL / PostGIS"]]},
{k:"code",i:"🐍",c:"#c28a2b",t:"Programming",d:"Scripting & geospatial libraries",g:[
["🐍 Python","Python fundamentals"],
["📦 Libraries","Pandas, NumPy, GeoPandas, Matplotlib, Rasterio, Shapely"],
["📓 Geo-notebooks","geemap, leafmap"],
["🌐 Frontend","HTML, CSS"],
["📈 R","R (basic)"]]},
{k:"ai",i:"🤖",c:"#8a5fb0",t:"GeoAI & Machine Learning",d:"Statistics to deep learning",g:[
["📊 Foundations","Statistical basics, EDA"],
["⚙️ Machine learning","scikit-learn basics"],
["🌲 Supervised","Random Forest, SVM"],
["🧩 Unsupervised","K-Means, Clustering, PCA, DBSCAN"],
["✅ Workflow","Model training & validation"],
["🧠 Deep learning","DL basics, CNN basics"]]},
{k:"res",i:"🔬",c:"#4f9a6a",t:"Research Skills",d:"Fieldwork, writing & communication",g:[
["📍 Fieldwork","QField, OvitalMap, Google Earth Pro"],
["✍️ Writing","Scientific report writing, LaTeX, Canva, Blinders Books"],
["💡 Thinking","Spatial statistics & analytical thinking, Information design, Data storytelling"],
["💬 AI","Prompt engineering"]]},
{k:"viz",i:"📊",c:"#c0634a",t:"Data Visualization",d:"Analysis into visuals",g:[
["🖼️ Dashboards","Dashboards, Streamlit apps"],
["🧊 Maps","2D / 3D map visualization"],
["🎬 Motion","Animation for mapping"]]}
];
const $=id=>document.getElementById(id),grid=$("grid"),tabs=$("tabs");
const esc=s=>s.replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]));
tabs.innerHTML='<button class="tab on" data-k="all">✨ All</button>'+D.map(x=>`<button class="tab" data-k="${x.k}">${x.i} ${x.t}</button>`).join("");
grid.innerHTML=D.map((x,n)=>{const cnt=x.g.reduce((a,[,b])=>a+b.split(", ").length,0);
return `<div class="card" data-k="${x.k}" style="--c:${x.c};animation-delay:${n*70}ms"><div class="hd"><span class="ic">${x.i}</span><h3>${x.t}<small>${x.d}</small></h3><span class="n">${cnt}</span><span class="ch">▾</span></div><div class="bd">${x.g.map(([a,b])=>`<div class="grp"><div class="sg">${a}</div><div class="chips">${b.split(", ").map(c=>`<span class="chip" data-t="${esc(c)}">${esc(c)}</span>`).join("")}</div></div>`).join("")}</div></div>`}).join("");
let key="all";
function apply(){const q=$("q").value.trim().toLowerCase();let any=false;
grid.querySelectorAll(".card").forEach(card=>{let vis=false;
card.querySelectorAll(".grp").forEach(g=>{let gv=false;
g.querySelectorAll(".chip").forEach(c=>{const t=c.dataset.t,i=q?t.toLowerCase().indexOf(q):-1,ok=!q||i>-1;
c.classList.toggle("hide",!ok);
c.innerHTML=ok&&q?esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+q.length))+"</mark>"+esc(t.slice(i+q.length)):esc(t);
if(ok)gv=true});
g.classList.toggle("hide",!gv);if(gv)vis=true});
if(q&&vis)card.classList.remove("shut");
const show=vis&&(key==="all"||card.dataset.k===key);card.classList.toggle("hide",!show);if(show)any=true});
$("none").classList.toggle("hide",any)}
tabs.onclick=e=>{const b=e.target.closest(".tab");if(!b)return;key=b.dataset.k;tabs.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on",t===b));apply()};
$("q").oninput=apply;
grid.onclick=e=>{const h=e.target.closest(".hd");if(h)h.parentElement.classList.toggle("shut")};
$("tg").onclick=()=>{const r=document.documentElement,cur=r.dataset.theme||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"),nx=cur==="dark"?"light":"dark";r.dataset.theme=nx;$("tg").textContent=nx==="dark"?"☀️":"🌙"};
if(matchMedia("(prefers-color-scheme:dark)").matches)$("tg").textContent="☀️";
