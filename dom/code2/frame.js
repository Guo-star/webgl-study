var scene, camera, renderer, mesh;

var canvas = document.getElementById("canvas-frame"),
  width = canvas.clientWidth,
  height = canvas.clientHeight;

// 初始化
function init() {
  // 场景
  scene = new THREE.Scene();

  // 相机
  camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 1000);
  camera.position.set(0, 0, -5);
  camera.lookAt(0, 0, 0);

  // 几何体
  var material = new THREE.MeshBasicMaterial({
    color: 0xFF0000,
    wireframe: true
  });
  mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  scene.add(mesh)

  // 渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(width, height);
  canvas.appendChild(renderer.domElement);

  animate();
}

// 帧循环
function animate() {
  requestAnimationFrame(animate);
  // mesh.rotateX(0.1);
  // mesh.rotateY(0.1);
  renderer.render(scene, camera);
}

// 启动函数
window.onload = init;