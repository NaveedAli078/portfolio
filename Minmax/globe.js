// Scene

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer({
canvas:document.getElementById("earthCanvas"),
alpha:true,
antialias:true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

camera.position.z = 4;

// =====================
// EARTH
// =====================

const earthGeometry =
new THREE.SphereGeometry(
1,
64,
64
);

const loader =
new THREE.TextureLoader();

const earthTexture =
loader.load(
'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
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

scene.add(earth);

// =====================
// SATELLITE
// =====================

const satelliteGeometry =
new THREE.BoxGeometry(
0.12,
0.12,
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

scene.add(satellite);

// =====================
// LIGHTS
// =====================

const light =
new THREE.PointLight(
0xffffff,
2
);

light.position.set(
5,
3,
5
);

scene.add(light);

const ambient =
new THREE.AmbientLight(
0xffffff,
0.5
);

scene.add(ambient);

// =====================
// ANIMATION
// =====================

let angle = 0;

function animate(){

requestAnimationFrame(
animate
);

earth.rotation.y += 0.002;

angle += 0.01;

satellite.position.x =
Math.cos(angle)*2;

satellite.position.z =
Math.sin(angle)*2;

renderer.render(
scene,
camera
);

}

animate();

// =====================
// RESPONSIVE
// =====================

window.addEventListener(
'resize',
()=>{

camera.aspect =
window.innerWidth/
window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(
window.innerWidth,
window.innerHeight);

});