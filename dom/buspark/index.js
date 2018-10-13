function Three(el) {
  this.el = el;
  this.threeStart();
}

Object.assign(Three.prototype, {
  // 渲染器 
  initThree: function () {
    var content = this.content = document.getElementById(this.el);
    this.width = content.clientWidth;
    this.height = content.clientHeight;

    var renderer = this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    renderer.setSize(this.width, this.height);
    renderer.setClearColor(0x000000, 1); //this.scene.fog.color
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = true;
    renderer.sortObjects = false;

    content.appendChild(renderer.domElement);

    var stats = this.stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    content.appendChild(stats.dom);
  },

  // 相机
  initCamera: function () {
    var camera = this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 10000);
    camera.position.set(0, 900, 1000);
    camera.lookAt(this.scene.position);
  },

  // 交互
  initControls: function () {
    var controls = this.controls = new THREE.OrbitControls(this.camera);
    console.log(controls)
    controls.enableZoom = true;
    controls.autoRotate = true;
  },

  // 场景
  initScene: function () {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000104, 0.0000675);
  },

  // 灯光
  initLight: function () {
    var light = new THREE.AmbientLight(0xffffff);
    // light.position.set(100, 100, 200);
    this.scene.add(light);
  },

  // 几何形
  initObject: function () {
    var mesh, boxHelper;

    // 泊位材质
    var LineMaterial = new THREE.LineBasicMaterial({
      linewidth: 2,
      color: 0xe2e3de
    })
    // 地板材质
    var ShapeMaterial = new THREE.MeshBasicMaterial({
      color: 0xabb7b7,
      side: THREE.DoubleSide
    });

    // 墙壁材质
    var wallMaterial = new THREE.MeshBasicMaterial({
      color: 0xe2e3de,
      side: THREE.DoubleSide
    })

    // 柱子材质
    var pillarMaterial1 = new THREE.MeshBasicMaterial({
      color: 0x879596,
      side: THREE.DoubleSide
    })

    // 全局组
    var globalGroup = this.globalGroup = new THREE.Group();
    // 公共组
    var parkGroup = this.parkGroup = new THREE.Group();

    // 地板
    mesh = new THREE.Mesh(this.drawShape(floorData), ShapeMaterial);
    parkGroup.add(mesh)

    // 泊位
    for (var i = 0; i < busParkData.length; i++) {
      mesh = new THREE.Line(this.drawLine(busParkData[i]), LineMaterial);
      parkGroup.add(mesh)
    }

    // 墙壁 中
    var geometry = new THREE.BoxGeometry(1134, 2.4, 60);
    mesh = new THREE.Mesh(geometry, wallMaterial);
    var box = new THREE.Box3().setFromObject(mesh);
    mesh.position.set(720, 414.4, -box.max.z);
    parkGroup.add(mesh)

    // 墙壁 上
    geometry = new THREE.BoxGeometry(1627.51, 2.4, 60);
    mesh = new THREE.Mesh(geometry, wallMaterial);
    box = new THREE.Box3().setFromObject(mesh);
    mesh.position.set(box.max.x, box.max.y, -box.max.z);
    parkGroup.add(mesh)

    // 墙壁 下
    mesh = new THREE.Mesh(geometry, wallMaterial);
    mesh.position.set(box.max.x, 954, -box.max.z);
    parkGroup.add(mesh)

    // 柱子
    var pillarGroup = new THREE.Group();
    var pillarGeometry = new THREE.BoxGeometry(8, 8, 30);
    var mesh1 = new THREE.Mesh(pillarGeometry, pillarMaterial1);
    pillarGroup.add(mesh1);
    var mesh2 = new THREE.Mesh(pillarGeometry, wallMaterial);
    mesh1.position.z = 30;
    pillarGroup.add(mesh2);
    var pillar;

    for (var j = 0; j < 4; j++) {
      for (var i = 0; i < 8; i++) {
        pillar = pillarGroup.clone();
        // console.log(pillar)
        if (j == 2) {
          pillar.position.set(i * 126 + 280, j * 126 + 163, -44);
        }else if (j == 3){
          pillar.position.set(i * 126 + 280, j * 126 + 170, -44);
        }else{
          pillar.position.set(i * 126 + 280, j * 126 + 160, -44);
        }
        parkGroup.add(pillar);
      }
    }

    // 包围和
    var boxHelper = new THREE.BoxHelper(parkGroup, 0xe2e3de);
    // 反转90度
    parkGroup.rotateX(Math.PI / 2);
    // 计算中心点
    var box = new THREE.Box3().setFromObject(parkGroup);
    var center = box.getCenter(new THREE.Vector3(0, 0, 0));
    // 移动到中心点
    center.multiplyScalar(-1);
    parkGroup.position.set(center.x, center.y, center.z);

    // parkGroup.add(boxHelper)
    globalGroup.add(parkGroup);
    this.scene.add(globalGroup);
  },

  // 画四边形
  drawShape: function (position) {
    var rectShape = new THREE.Shape();
    rectShape.moveTo(position[0], position[1]);
    rectShape.lineTo(position[2], position[3]);
    rectShape.lineTo(position[4], position[5]);
    rectShape.lineTo(position[6], position[7]);

    return new THREE.ShapeGeometry(rectShape);
  },

  // 画四边形 边线
  drawLine: function (position) {
    var rectShape = new THREE.Shape();
    rectShape.moveTo(position[0], position[1]);
    rectShape.lineTo(position[2], position[3]);
    rectShape.lineTo(position[4], position[5]);
    rectShape.lineTo(position[6], position[7]);
    rectShape.lineTo(position[0], position[1]);
    var points = rectShape.getPoints();
    return new THREE.BufferGeometry().setFromPoints(points);
  },

  // 事件
  initEvent: function () {
    var _this = this;
    var rotateStart = new THREE.Vector2();
    var mouseDown, mouseX, mouseY;
    window.addEventListener('resize', function () {
      _this.width = _this.content.clientWidth;
      _this.height = _this.content.clientHeight;

      _this.camera.aspect = _this.width / _this.height;
      _this.camera.updateProjectionMatrix();
      _this.renderer.setSize(_this.width, _this.height);
    }, false);

    // 鼠标滚轮
    document.addEventListener('mousewheel', function (event) {
      if (event.wheelDelta) {
        var factor = 40;
        //将鼠标的屏幕坐标转换为NDC坐标
        var mX = (event.clientX / _this.width) * 2 - 1;
        var mY = -(event.clientY / _this.height) * 2 + 1;
        //深度值为0.5，深度值越大，精度越高
        var vector = new THREE.Vector3(mX, mY, 0.5);
        //将鼠标坐标转换为3D空间坐标
        vector.unproject(_this.camera);
        //获得从相机指向鼠标所对应的3D空间点的射线（归一化）
        vector.sub(_this.camera.position).normalize();

        if (event.deltaY < 0) {
          _this.camera.position.x += vector.x * factor;
          _this.camera.position.y += vector.y * factor;
          _this.camera.position.z += vector.z * factor;
        } else {
          _this.camera.position.x -= vector.x * factor;
          _this.camera.position.y -= vector.y * factor;
          _this.camera.position.z -= vector.z * factor;
        }
        _this.animation();

      }
    }, false);

    document.addEventListener("mousedown", function (event) {
      event.preventDefault();
      mouseDown = true;
      mouseX = event.clientX; //出发事件时的鼠标指针的水平坐标
      mouseY = event.clientY; //出发事件时的鼠标指针的水平坐标
      rotateStart.set(mouseX, mouseY);
      document.addEventListener('mousemove', onMouseMove, false);
    }, false)

    document.addEventListener('mouseup', function () {
      mouseDown = false;
      document.removeEventListener("mousemove", onMouseMove);
    }, false);

    function onMouseMove(event) {
      if (!mouseDown) {
        return;
      }
      var x = _this.camera.position.x;
      var y = _this.camera.position.y;
      var z = _this.camera.position.z;

      // 相机向量
      var v1 = new THREE.Vector3(x, y, z);

      var cameraRound = 90;
      var deltaX = (event.clientX - mouseX) / 270;
      var deltaY = (event.clientY - mouseY) / 270;
      mouseX = event.clientX;
      mouseY = event.clientY;

      _this.globalGroup.rotateX(deltaY)
      _this.globalGroup.rotateY(deltaX)
      _this.animation();
    }
  },

  // 网格
  initGrid: function () {
    var helper = new THREE.GridHelper(1000, 50, 0x0000ff, 0x808080);
    this.scene.add(helper);
  },

  // 模型导入
  initModel: function () {
    var manager = new THREE.LoadingManager();
    var fbxLoader = new THREE.FBXLoader(manager);
    var _this = this;
    fbxLoader.load('./busFBX.FBX', function (obj) {
      obj.rotateZ(Math.PI / 2);
      obj.rotateY(Math.PI / 2);
      var model;
      for (var i = 0; i < centerData.length; i++) { //centerData.length
        model = obj.clone();
        model.position.set(centerData[i][0], centerData[i][1], -2.7);
        _this.parkGroup.add(model);
      }

      _this.animation();
    })
  },

  // 帧循环
  animation: function () {
    this.render();
    this.stats.end();
    // requestAnimationFrame(this.animation)
  },

  // 渲染
  render: function () {
    this.stats.begin();
    this.renderer.clear();
    // this.mesh.rotateY(0.01);
    this.renderer.render(this.scene, this.camera);
  },

  // 执行函数
  threeStart: function () {
    this.initScene();
    this.initThree();
    this.initCamera();
    // this.initControls();
    this.initLight();
    this.initObject();
    this.initEvent();
    // this.initGrid();
    // this.animation();
    this.initModel();
  }
})