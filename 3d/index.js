import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// === Scene, Camera, Renderer ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(60, 50, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Light ===
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(80, 100, -80);
scene.add(sunLight);

// === Ground (พื้นรวม) ===
const groundGeo = new THREE.PlaneGeometry(250, 250);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// === River (แม่น้ำตรงกลาง) ===
const riverGeo = new THREE.PlaneGeometry(250, 20);
const riverMat = new THREE.MeshPhongMaterial({
  color: 0x1e90ff,
  metalness: 0.7,
  roughness: 0.3,
  transparent: true,
  opacity: 0.9,
});
const river = new THREE.Mesh(riverGeo, riverMat);
river.rotation.x = -Math.PI / 2;
river.position.y = 0.03;
river.position.z = 0; // 🟦 อยู่ตรงกลาง
scene.add(river);

// === Mountains (ภูเขา ด้านหลังสุด) ===
function createMountain(x, z, size) {
  const geo = new THREE.ConeGeometry(size, size * 1.8, 8);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x556b2f,
    flatShading: true,
  });
  const cone = new THREE.Mesh(geo, mat);
  cone.position.set(x, size, z);
  scene.add(cone);
}
// ขยับไปหลังแม่น้ำ
createMountain(-50, 80, 15);
createMountain(-10, 90, 18);
createMountain(40, 85, 12);
createMountain(70, 95, 16);

// === Sun (พระอาทิตย์) ===
const sunGeo = new THREE.SphereGeometry(6, 16, 16);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.position.set(90, 80, 100);
scene.add(sun);

// === Trees (ต้นไม้ ฝั่งซ้ายแม่น้ำ z > 20) ===
function createTree(x, z, scale = 1) {
  const trunkGeo = new THREE.CylinderGeometry(0.4 * scale, 0.5 * scale, 2.5 * scale);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(x, 1.2 * scale, z);

  const leavesGeo = new THREE.ConeGeometry(1.4 * scale, 3 * scale, 8);
  const leavesMat = new THREE.MeshStandardMaterial({
    color: 0x228b22,
    flatShading: true,
  });
  const leaves = new THREE.Mesh(leavesGeo, leavesMat);
  leaves.position.set(x, 2.8 * scale, z);

  scene.add(trunk, leaves);
}
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 6; j++) {
    const x = -40 + j * 12;
    const z = 25 + i * 10; // 🌳 ฝั่งซ้ายเหนือแม่น้ำ
    createTree(x, z, 1 + Math.random() * 0.3);
  }
}

// === House (บ้านฝั่งต้นไม้) ===
function createHouse(x, z) {
  const baseGeo = new THREE.BoxGeometry(6, 4, 6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xcd853f });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(x, 2, z);

  const roofGeo = new THREE.ConeGeometry(5, 3, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(x, 5, z);
  roof.rotation.y = Math.PI / 4;

  scene.add(base, roof);
}
createHouse(20, 40);

// === Rice Field (ท้องนา ฝั่งขวาแม่น้ำ z < -40) ===
const fieldGeo = new THREE.PlaneGeometry(170, 44);
const fieldMat = new THREE.MeshStandardMaterial({
  color: 0x9acd32,
  roughness: 0.6,
  metalness: 0.2,
});
const field = new THREE.Mesh(fieldGeo, fieldMat);
field.rotation.x = -Math.PI / 2;
field.position.set(0, 0.05, -60); // 🌾 ยกขึ้นจากพื้นเล็กน้อย
scene.add(field);

// === Rice Stalks (ต้นข้าวเส้นๆ) ===
const riceGroup = new THREE.Group();
const riceMat = new THREE.LineBasicMaterial({ color: 0x2e8b57 });
for (let i = 0; i < 400; i++) {
  const x = (Math.random() - 0.5) * 160;
  const z = -60 + (Math.random() - 0.5) * 40;
  const y = 0.05; // 🌾 ให้ยอดต้นข้าวอยู่เหนือท้องนาเล็กน้อย
  const height = 0.5 + Math.random() * 0.3;
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(x, y, z),
    new THREE.Vector3(x, y + height, z),
  ]);
  const line = new THREE.Line(geo, riceMat);
  riceGroup.add(line);
}
scene.add(riceGroup);

// === Rocks (ก้อนหินสุ่มรอบๆ) ===
function createRock(x, z, scale = 1) {
  const geo = new THREE.DodecahedronGeometry(scale);
  const mat = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const rock = new THREE.Mesh(geo, mat);
  rock.position.set(x, scale, z);
  scene.add(rock);
}
for (let i = 0; i < 12; i++) {
  const z = (Math.random() - 0.5) * 180;
  const x = -60 + Math.random() * 120;
  createRock(x, z, 0.5 + Math.random() * 0.4);
}

// === Responsive Resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Animation ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
