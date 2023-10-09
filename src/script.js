import * as THREE from "three";
// import * as dat from "lil-gui";
import gsap from 'gsap';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

THREE.ColorManagement.enabled = false;

// textures
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/5.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

/**
 * Debug
 */
// const gui = new dat.GUI();

const parameters = {
  materialColor: "#f23a7b",
};

// gui.addColor(parameters, "materialColor").onChange(() => {
//   material.color.set(parameters.materialColor);
//   particleMaterial.color.set(parameters.materialColor)
// });

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture, //with this mesh toon material wont be appearing a proper mixing of the three colors takes place,so to avoid this we will chnge the texture property-->>magfilter:nearestfilter
});

// objects
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 10, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.6, 0.25, 100, 16),
  material
);
const mesh4=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5,50,50),material);
const meshes = [mesh1, mesh2,mesh4];
// mesh2.visible=false;
// mesh3.visible=false;
mesh2.material.transparent=true;
mesh2.material.opacity=0.8;

// lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

// const directionalLightCameraHelper=new THREE.CameraHelper(directionalLight);
// scene.add(directionalLightCameraHelper)

// Positioning
const objectDistance = 4;
mesh1.position.y = -objectDistance * 0;
mesh2.position.y = -objectDistance * 1-1;
mesh3.position.y = -objectDistance * 2;
mesh4.position.y=-objectDistance*3-1.5;

mesh1.position.x = 2;
mesh2.position.x = 0;
mesh3.position.x = 2;
mesh4.position.x=-1.7;

scene.add(mesh1, mesh2, mesh3,mesh4);


// Particles

const count = 600;
const positions = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random()-0.5)*10;
  positions[i3 + 1] = objectDistance*0.5-Math.random()*objectDistance*meshes.length;
  positions[i3 + 2] = (Math.random()-0.5)*10;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  'position',new THREE.Float32BufferAttribute(positions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  size: 0.025,
  sizeAttenuation:true,
  
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let scrollY = window.scrollY;
let currentSection=0;
let newSection=0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  newSection=Math.round(scrollY/sizes.height);
  // console.log(newSection);
  if(newSection!=currentSection)
  {
    currentSection=newSection;
    gsap.to(meshes[currentSection].rotation,{
        duration: 1.5,
        ease: 'power2.inOut',
        x: '+=6',
        y: '+=3',
        z: '+=1.5'
    })
  }
    // console.log(scrollY);
    // console.log(sizes.height)
});

let cursor ={};
cursor.x=0;
cursor.y=0;

window.addEventListener('mousemove', (event) => {
  //   console.log("mouse moved");
  cursor.x = (event.clientX / sizes.width) - 0.5;
  cursor.y =(event.clientY / sizes.height) - 0.5;
    // console.log(cursor.x);
    // console.log(cursor.y);
});

// camera group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

// const controls = new OrbitControls(camera,canvas);
// controls.enableDamping=true;
/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, //means a transparent canvas
});
// renderer.setClearAlpha(0.5);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.setClearColor('#1e1a20');

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
/**
 * Animate
 */
const clock = new THREE.Clock();
let currentTime =0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - currentTime;
  currentTime = elapsedTime;
  // controls.update();
  camera.position.y = -(scrollY/sizes.height)*objectDistance/1.2;

  //   parallax effect
  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * deltaTime * 5;
  cameraGroup.position.y +=
    (parallaxY-cameraGroup.position.y) * deltaTime * 5;

  // Animation
  for (const mesh of meshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y +=  deltaTime * 0.1;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// reveal animation on sections

function reveal() {
  var reveals = document.querySelectorAll(".reveal");
  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 150;
    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    } else {
      reveals[i].classList.remove("active");
    }
  }
}

window.addEventListener("scroll", reveal);

// To check the scroll position on page load
reveal();

const menuBtn=document.querySelector('.menu-btn');
const navBar=document.querySelector('.right');
menuBtn.addEventListener('click',()=>{
  const currentDisplay=navBar.style.display;
  if(currentDisplay==='none')
  {
    navBar.style.display='block';
  }
  else{
    navBar.style.display='none';
  }
}
)
  
