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
    renderer.setClearColor(0xffffff, 1); //this.scene.fog.color
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;
    renderer.sortObjects = false;

    content.appendChild(renderer.domElement);


    var stats = this.stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    content.appendChild(stats.dom);
  },

  // 相机
  initCamera: function () {
    var camera = this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 1, 10000);
    camera.position.set(0, 900, 1000);
    camera.lookAt(this.scene.position);
  },

  // 场景
  initScene: function () {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000104, 0.0000675);
  },

  // 灯光
  initLight: function () {
    var light = new THREE.AmbientLight(0xFF0000);
    light.position.set(100, 100, 200);
    this.scene.add(light);
  },

  // 几何形
  initObject: function () {
    var rectShape, rectGeom, mesh;
    var material = new THREE.MeshBasicMaterial({
      color: 0xb9dea0,
      side: THREE.DoubleSide
      // wireframe:true
    });
    var group = new THREE.Group();
    for (var i = 0; i < busParkData.length; i++) {
      rectShape = new THREE.Shape();
      rectShape.moveTo(busParkData[i][0], busParkData[i][1]);
      rectShape.lineTo(busParkData[i][2], busParkData[i][3]);
      rectShape.lineTo(busParkData[i][4], busParkData[i][5]);
      rectShape.lineTo(busParkData[i][6], busParkData[i][7]);
      // rectShape.lineTo(busParkData[i][0], busParkData[i][1]);

      rectGeom = new THREE.ShapeGeometry(rectShape);
      mesh = new THREE.Mesh(rectGeom, material);
      group.add(mesh)
    }
    // 包围和
    var boxHelper = new THREE.BoxHelper(group,0xff0000);

    // 反转90度
    group.rotateX(Math.PI / 2);
    // 计算中心点
    var box = new THREE.Box3().setFromObject(group);
    var center = box.getCenter(new THREE.Vector3(0, 0, 0));
    // 移动到中心点
    center.multiplyScalar(-1);
    group.position.set(center.x, center.y, center.z);

    group.add(boxHelper)
    this.scene.add(group);
  },


  // 事件
  initEvent: function () {
    var _this = this;
    window.addEventListener('resize', function () {
      _this.width = _this.content.clientWidth;
      _this.height = _this.content.clientHeight;

      _this.camera.aspect = _this.width / _this.height;
      _this.camera.updateProjectionMatrix();
      _this.renderer.setSize(_this.width, _this.height);
    }, false);

    
  },

  // 网格
  initGrid: function () {
    var helper = new THREE.GridHelper(1000, 50, 0x0000ff, 0x808080);
    this.scene.add(helper);
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
    this.initLight();
    this.initObject();
    this.initEvent();
    // this.initGrid();
    this.animation();
  }
})