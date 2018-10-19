var scene, camera, renderer, light;

var keyboard = {};
var player = {
  height: 1.8,
  speed: 0.2,
  turnSpeed: Math.PI * 0.02,
  canShoot: 0
};


var loadingManager = null;

var models = {
  tent: {
    obj: "models/Tent_Poles_01.obj",
    mtl: "models/Tent_Poles_01.mtl",
    mesh: null
  },
  campfire: {
    obj: "models/Campfire_01.obj",
    mtl: "models/Campfire_01.mtl",
    mesh: null
  },
  pirateship: {
    obj: "models/Pirateship.obj",
    mtl: "models/Pirateship.mtl",
    mesh: null
  },
  uzi: {
    obj: "models/uziGold.obj",
    mtl: "models/uziGold.mtl",
    mesh: null,
    castShadow: false
  }
};

// Meshes index
var meshes = {};

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

  // 加载管理
  loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total);
  };
  loadingManager.onLoad = function () {
    console.log("loaded all resources");
    onResourcesLoaded()
  };

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

  if (keyboard[87]) { // W
    camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
    camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
  }
  if (keyboard[83]) { // S
    camera.position.x += Math.sin(camera.rotation.y) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
  }
  if (keyboard[65]) { // A
    camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
  }
  if (keyboard[68]) { // D
    camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
  }

  if (keyboard[37]) { // <-
    camera.rotateY(Math.PI * 0.02);
  }
  if (keyboard[39]) { // ->
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

  var mtlLoader = new THREE.MTLLoader(loadingManager);
  var objLoader = new THREE.OBJLoader(loadingManager);
  // 导入模型
  for (var _key in models) {
    (function (key) {
      mtlLoader.load(models[key].mtl, function (materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(models[key].obj, function (mesh) {
          mesh.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
              if ('castShadow' in models[key])
                node.castShadow = models[key].castShadow;
              else
                node.castShadow = true;

              if ('receiveShadow' in models[key])
                node.receiveShadow = models[key].receiveShadow;
              else
                node.receiveShadow = true;
            }
          });

          models[key].mesh = mesh;
        })
      })
    })(_key)
  }


  // var mtlLoader = new THREE.MTLLoader();
  // var objLoader = new THREE.OBJLoader();
  // mtlLoader.load('./models/Tent_Poles_01.mtl', function (materials) {
  //   objLoader.setMaterials(materials);
  //   objLoader.load('./models/Tent_Poles_01.obj', function (tentMesh) {
  //     tentMesh.traverse(function (node) {
  //       if (node instanceof THREE.Mesh) {
  //         node.castShadow = true;
  //       }
  //     })
  //     tentMesh.position.set(-5, 0, 4);
  //     tentMesh.rotateY(-Math.PI / 4);
  //     scene.add(tentMesh);
  //   })
  // });
}

function onResourcesLoaded() {
  // Clone models into meshes.
  meshes["tent1"] = models.tent.mesh.clone();
  meshes["tent2"] = models.tent.mesh.clone();
  meshes["campfire1"] = models.campfire.mesh.clone();
  meshes["campfire2"] = models.campfire.mesh.clone();
  meshes["pirateship"] = models.pirateship.mesh.clone();

  // Reposition individual meshes, then add meshes to scene
  meshes["tent1"].position.set(-5, 0, 4);
  scene.add(meshes["tent1"]);

  meshes["tent2"].position.set(-8, 0, 4);
  scene.add(meshes["tent2"]);

  meshes["campfire1"].position.set(-5, 0, 1);
  meshes["campfire2"].position.set(-8, 0, 1);

  scene.add(meshes["campfire1"]);
  scene.add(meshes["campfire2"]);

  meshes["pirateship"].position.set(-11, -1, 1);
  meshes["pirateship"].rotation.set(0, Math.PI, 0); // Rotate it to face the other way.
  scene.add(meshes["pirateship"]);

  // player weapon
  meshes["playerweapon"] = models.uzi.mesh.clone();
  meshes["playerweapon"].position.set(0, 2, 0);
  meshes["playerweapon"].scale.set(10, 10, 10);
  scene.add(meshes["playerweapon"]);
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