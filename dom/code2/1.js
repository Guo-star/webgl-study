var scene, camera, renderer, light;

var keyboard = {};

var canvas = document.getElementById("canvas-frame"),
  width = canvas.clientWidth,
  height = canvas.clientHeight;

// 初始化
function init() {
  // 场景
  scene = new THREE.Scene();

  // 相机
  camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 1000);
  camera.position.set(0, 1.6, -5);
  camera.lookAt(0, 0, 0);

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  light = new THREE.PointLight(0xffffff, 0.8, 18);
  light.position.set(-3, 6, -3);
  light.castShadow = true;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 25;
  scene.add(light);

  // 几何体
  geometry();

  // 渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(width, height);

  renderer.shadowMap.enabled = true; // 阴影
  renderer.shadowMap.type = THREE.PCFShadowMap; //THREE.BasicShadowMap; 阴影效果清晰程度
  canvas.appendChild(renderer.domElement);

  animate();
}

// 帧循环
function animate() {
  requestAnimationFrame(animate);

  // 上 38，下 40，左 37，右 39
  if (keyboard[37]) {
    camera.rotateY(Math.PI * 0.02);
  }
  if (keyboard[39]) {
    camera.rotateY(-Math.PI * 0.02);
  }

  // mesh.rotateX(0.1);
  mesh.rotateY(0.01);
  crateMesh.rotateY(0.01);
  renderer.render(scene, camera);
}

// 几何体
var mesh, floorMesh, crateMesh;

function geometry() {
  // 立方体
  var USE_WIREFRAME = false;

  mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
    color: 0xFF4444,
    wireframe: USE_WIREFRAME
  }));
  mesh.position.y += 1;
  // mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh)

  // 地板
  floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(15, 15, 15, 15), new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: USE_WIREFRAME
  }));
  floorMesh.rotateX(-Math.PI / 2)
  floorMesh.receiveShadow = true;
  scene.add(floorMesh)

  //木箱
  var textureLoader = new THREE.TextureLoader();
  var crateTexure = textureLoader.load("./crate0/crate0_diffuse.jpg");
  var crateNormalMap = textureLoader.load("./crate0/crate0_normal.jpg")

  crateMesh = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: crateTexure,
    normalMap: crateNormalMap
  }))
  crateMesh.castShadow = true;
  crateMesh.receiveShadow = true;
  crateMesh.position.set(2.5, 1.5, 2.5)
  scene.add(crateMesh);

  //帐篷
  var mtlLoader = new THREE.MTLLoader();
  var objLoader = new THREE.OBJLoader();
  mtlLoader.load('./models/Tent_Poles_01.mtl',function(materials){
    objLoader.setMaterials(materials);
    objLoader.load('./models/Tent_Poles_01.obj',function(tentMesh){
      tentMesh.traverse(function(node){
        if(node instanceof THREE.Mesh){
          node.castShadow = true;
        }
      })
      tentMesh.position.set(-5,0,4);
      tentMesh.rotateY(-Math.PI/4);
      scene.add(tentMesh);
    })
  });
}


// 启动函数
window.onload = init;

function keyDown(event) {
  keyboard[event.keyCode] = true;
}

function keyUp(event) {
  keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown)
window.addEventListener("keyup", keyUp)