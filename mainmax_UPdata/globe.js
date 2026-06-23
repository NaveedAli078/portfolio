// =====================================================
// GLOBE.JS
// 3D EARTH SYSTEM FOR GIS PORTFOLIO
// =====================================================

// =====================================
// CHECK THREE.JS
// =====================================

if(typeof THREE === "undefined"){

console.error(
"Three.js not loaded."
);

}
else{

// =====================================
// SCENE
// =====================================

const scene =
new THREE.Scene();

const camera =
new THREE.PerspectiveCamera(

75,

window.innerWidth /
window.innerHeight,

0.1,

1000

);

const renderer =
new THREE.WebGLRenderer({

canvas:
document.getElementById(
"earthCanvas"
),

alpha:true,

antialias:true

});

renderer.setPixelRatio(
window.devicePixelRatio
);

renderer.setSize(

window.innerWidth,

window.innerHeight

);

camera.position.z = 4;

// =====================================
// TEXTURE LOADER
// =====================================

const textureLoader =
new THREE.TextureLoader();

// =====================================
// EARTH
// =====================================

const earthGeometry =
new THREE.SphereGeometry(

1,

64,

64

);

const earthTexture =
textureLoader.load(

"https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"

);

const earthMaterial =
new THREE.MeshStandardMaterial({

map:earthTexture

});

const earth =
new THREE.Mesh(

earthGeometry,

earthMaterial

);

scene.add(
earth
);

// =====================================
// CLOUD LAYER
// =====================================

const cloudGeometry =
new THREE.SphereGeometry(

1.02,

64,

64

);

const cloudTexture =
textureLoader.load(

"https://threejs.org/examples/textures/planets/earth_clouds_1024.png"

);

const cloudMaterial =
new THREE.MeshStandardMaterial({

map:cloudTexture,

transparent:true,

opacity:0.5

});

const clouds =
new THREE.Mesh(

cloudGeometry,

cloudMaterial

);

scene.add(
clouds
);

// =====================================
// ATMOSPHERE GLOW
// =====================================

const atmosphereGeometry =
new THREE.SphereGeometry(

1.08,

64,

64

);

const atmosphereMaterial =
new THREE.MeshBasicMaterial({

color:0x00e5ff,

transparent:true,

opacity:0.15,

side:THREE.BackSide

});

const atmosphere =
new THREE.Mesh(

atmosphereGeometry,

atmosphereMaterial

);

scene.add(
atmosphere
);

// =====================================
// SATELLITE BODY
// =====================================

const satelliteGeometry =
new THREE.BoxGeometry(

0.15,

0.15,

0.3

);

const satelliteMaterial =
new THREE.MeshStandardMaterial({

color:0x00e5ff

});

const satellite =
new THREE.Mesh(

satelliteGeometry,

satelliteMaterial

);

scene.add(
satellite
);

// =====================================
// SOLAR PANELS
// =====================================

const panelGeometry =
new THREE.BoxGeometry(

0.4,

0.02,

0.15

);

const panelMaterial =
new THREE.MeshStandardMaterial({

color:0x1e90ff

});

const leftPanel =
new THREE.Mesh(

panelGeometry,

panelMaterial

);

leftPanel.position.x =
-0.3;

satellite.add(
leftPanel
);

const rightPanel =
new THREE.Mesh(

panelGeometry,

panelMaterial

);

rightPanel.position.x =
0.3;

satellite.add(
rightPanel
);

// =====================================
// ORBIT RING
// =====================================

const orbitGeometry =
new THREE.RingGeometry(

1.95,

2.0,

128

);

const orbitMaterial =
new THREE.MeshBasicMaterial({

color:0x00e5ff,

side:THREE.DoubleSide,

transparent:true,

opacity:0.15

});

const orbit =
new THREE.Mesh(

orbitGeometry,

orbitMaterial

);

orbit.rotation.x =
Math.PI / 2;

scene.add(
orbit
);

// =====================================
// STARS
// =====================================

const starsGeometry =
new THREE.BufferGeometry();

const starVertices = [];

for(let i=0;i<5000;i++){

const x =
( Math.random() - 0.5 ) * 2000;

const y =
( Math.random() - 0.5 ) * 2000;

const z =
( Math.random() - 0.5 ) * 2000;

starVertices.push(
x,y,z
);

}

starsGeometry.setAttribute(

'position',

new THREE.Float32BufferAttribute(

starVertices,

3

)

);

const starsMaterial =
new THREE.PointsMaterial({

size:1,

color:0xffffff

});

const stars =
new THREE.Points(

starsGeometry,

starsMaterial

);

scene.add(
stars
);

// =====================================
// LIGHTING
// =====================================

const ambientLight =
new THREE.AmbientLight(

0xffffff,

0.5

);

scene.add(
ambientLight
);

const pointLight =
new THREE.PointLight(

0xffffff,

2

);

pointLight.position.set(

5,

3,

5

);

scene.add(
pointLight
);

// =====================================
// MOUSE INTERACTION
// =====================================

let mouseX = 0;
let mouseY = 0;

document.addEventListener(
"mousemove",
(event)=>{

mouseX =
(event.clientX /
window.innerWidth)
* 2 - 1;

mouseY =
(event.clientY /
window.innerHeight)
* 2 - 1;

});

// =====================================
// ANIMATION
// =====================================

let angle = 0;

function animate(){

requestAnimationFrame(
animate
);

// Earth rotation

earth.rotation.y +=
0.0015;

clouds.rotation.y +=
0.0025;

// Satellite orbit

angle += 0.01;

satellite.position.x =

Math.cos(angle) * 2;

satellite.position.z =

Math.sin(angle) * 2;

satellite.position.y =

Math.sin(angle * 2)
* 0.2;

// Satellite self rotation

satellite.rotation.y +=
0.02;

// Stars slow rotation

stars.rotation.y +=
0.0001;

// Mouse camera effect

camera.position.x =
mouseX * 0.2;

camera.position.y =
-mouseY * 0.2;

camera.lookAt(
scene.position
);

renderer.render(

scene,

camera

);

}

animate();

// =====================================
// RESPONSIVE
// =====================================

window.addEventListener(

"resize",

()=>{

camera.aspect =

window.innerWidth /

window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(

window.innerWidth,

window.innerHeight

);

}

);

}

// =====================================================
// END OF GLOBE.JS
// =====================================================