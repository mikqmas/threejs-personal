import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { InteractionManager } from 'three.interactive';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';


const container = document.getElementById( 'container' );
const stats = new Stats();
// container.appendChild( stats.dom );

const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

const pmremGenerator = new THREE.PMREMGenerator( renderer );

const group = new TWEEN.Group();
const scene = new THREE.Scene();

// CSS renderer
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.top = 0;
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(cssRenderer.domElement);

// div & iframe
const width = 1792
const height = 1120

const element = document.createElement('div');
element.style.width = width + 'px';
element.style.height = height + 'px';
element.style.backgroundColor = 'red';

const iframe = document.createElement('iframe');
iframe.src = 'https://mikqmas.github.io/'; // Replace with your desired URL
iframe.style.width = '100%';
iframe.style.height = '100%';
iframe.style.border = 'none';
iframe.style.backgroundColor = 'blue';
element.append(iframe);


const css3DObject = new CSS3DObject(element);
const ratio = height / width;
css3DObject.scale.set(1/width,(1/height) * ratio, 1);
const imgGeo = new THREE.PlaneGeometry(1, ratio);
const imgMat = new THREE.MeshBasicMaterial({
    opacity: 0,
    color: new THREE.Color(0xffffff),
    blending: THREE.NoBlending,
    transparent: true,
});

const webMesh = new THREE.Mesh(imgGeo, imgMat);
webMesh.add(css3DObject);
webMesh.scale.set(5,5,5);
webMesh.position.set(0,3,0);
scene.add(webMesh);


// BG
scene.background = new THREE.Color( 0xbfe3dd );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

// Light
const light = createLight();
scene.add(light);

const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, .1, 100 );
camera.position.set( 3, 3, 8 );

const interactionManager = new InteractionManager(
    renderer, 
    camera,
    renderer.domElement
);

// Orbit Controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 1.2, 0 );
controls.enablePan = false;
controls.enableDamping = true;

// GLB Model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'jsm/libs/draco/gltf/' );
const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );
let cabinet;
loader.load( 'models/arcade_cabinet.glb', function(gltf) {
    cabinet = gltf.scene;
    // scene.add(cabinet);
})

// Button
const cube = addCube();
cube.addEventListener("click", (event) => {
    event.stopPropagation();
    controls.enabled = false;
    const tween = new TWEEN.Tween(camera.position)
        .to({x: 0, y: 1.5, z: 1.3}, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        // .onUpdate(() =>
        //   camera.position.set(coords.x, coords.y, camera.position.z)
        // )
        .onComplete(() => {controls.enabled = true;})
        .start();
    group.add(tween);
});

interactionManager.add(cube);
// scene.add(cube);

renderer.setAnimationLoop(animate);

window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
};

function animate(time) {
    stats.update();
    controls.update();
    renderer.render( scene, camera );
    cssRenderer.render(scene, camera);
    interactionManager.update();
    group.update(time);

}

function addCube() {
    // geometry
    const geo = new THREE.BoxGeometry(1,1,1);
    // material
    const material = new THREE.MeshToonMaterial({color: 0xff0000});
    // mesh
    return new THREE.Mesh(geo, material);
}


function createLight() {
    const light = new THREE.PointLight(0xffffff, 100, 1000);
    light.position.set(4,4,4);
    return light;
}