function Three(el) {
  this.el = el;
  this.threeStart();
}

Object.assign(Three.prototype, {
  // 渲染器 
  initThree: function () {
    var _this = this;
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
    renderer.shadowMap.enabled = true; // 告诉渲染器需要阴影

    content.appendChild(renderer.domElement);

    // 鼠标投手
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

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
    var _this = this;
    var controls = this.controls = new THREE.OrbitControls(this.camera, this.content);
    controls.target = new THREE.Vector3(0, 0, 0); //控制焦点
    controls.enablePan = true;
  },

  // 场景
  initScene: function () {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000104, 0.0000675);
  },

  // 灯光
  initLight: function () {
    this.scene.add(new THREE.AmbientLight(0xffffff));
    var light = new THREE.SpotLight(0xffffff);
    light.position.set(0, 20, 20);
    light.castShadow = true;
    this.scene.add(light);
  },

  // 自定义形状
  addShape: function (Shape, color, x, y, z, rx, ry, rz, s) {
    var curveGeometry = new THREE.Geometry().setFromPoints(Shape.getPoints(20))

    var line = new THREE.Line(curveGeometry, new THREE.LineBasicMaterial({
      color: color
    }));

    line.position.set(x, y, z - 25);
    line.rotation.set(rx, ry, rz);
    line.scale.set(s, s, s);
    return line;
  },

  // 几何形
  initObject: function () {
    var mesh, boxHelper, geometry;
    // 全局组
    var globalGroup = this.globalGroup = new THREE.Group();
    // 场站组
    var parkGroup = this.parkGroup = new THREE.Group();

    geometry = new THREE.Shape();
    geometry.moveTo(0, 0);
    geometry.bezierCurveTo(100, 200, 200, 200, 300, 0);
    this.scene.add(this.addShape(geometry, 0xff0000, 0, 0, 0, 0, 0, 0, 1));

    // 地板
    mesh = new THREE.Mesh(new THREE.ShapeBufferGeometry(this.drawShape(floorData)), new THREE.MeshBasicMaterial({
      color: 0xabb7b7,
      side: THREE.DoubleSide
    }));
    mesh.position.z = 1;
    mesh.receiveShadow = true;
    parkGroup.add(mesh);

    // 泊位
    var berthShape;
    for (var i = 0; i < busParkData.length; i++) {
      berthShape = this.drawShape(busParkData[i]);
      mesh = new THREE.Mesh(new THREE.ShapeBufferGeometry(berthShape), new THREE.MeshBasicMaterial({
        color: 0xabb7b7,
        side: THREE.DoubleSide
      }));
      mesh.name = "berth";
      parkGroup.add(mesh)

      var points = berthShape.getPoints();
      mesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({
        linewidth: 10,
        color: 0xffffff
      }));
      parkGroup.add(mesh);
    }

    // 方向标注 箭头
    geometry = new THREE.ShapeBufferGeometry(this.drawArrows());
    for (var i = 0; i < arrowsData.length; i++) {
      mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      }));
      mesh.position.set(arrowsData[i][0], arrowsData[i][1], 0);
      parkGroup.add(mesh)
    }

    // 办公区域
    geometry = new THREE.BoxGeometry(2.4, 954, 60);
    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: 0xe2e3de
    }));
    mesh.castShadow = true;
    box = new THREE.Box3().setFromObject(mesh);
    mesh.position.set(1430, box.max.y, -box.max.z);
    parkGroup.add(mesh)

    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: 0xe2e3de
    }));
    mesh.castShadow = true;
    mesh.position.set(1627.51, box.max.y, -box.max.z);
    parkGroup.add(mesh)

    var fontLoader = new THREE.FontLoader();
    fontLoader.load("./fonts/SimHei_Regular.json", function (res) {
      geometry = new THREE.TextGeometry("办公区域", {
        size: 60, //字号大小，一般为大写字母的高度
        height: 10, //文字的厚度
        weight: 'normal', //值为'normal'或'bold'，表示是否加粗
        font: res, //字体，默认是'helvetiker'，需对应引用的字体文件
        style: 'normal', //值为'normal'或'italics'，表示是否斜体
        bevelThickness: 1, //倒角厚度
        bevelSize: 1, //倒角宽度
        curveSegments: 30, //弧线分段数，使得文字的曲线更加光滑
        bevelEnabled: true, //布尔值，是否使用倒角，意为在边缘处斜切
      });
      mesh = new THREE.Mesh(geometry, new THREE.LineBasicMaterial({
        color: 0xe2e3de
      }));
      mesh.rotateZ(Math.PI / 2);
      mesh.rotateX(Math.PI);
      mesh.position.set(1500, 320, -1)
      parkGroup.add(mesh)
    })

    // 墙壁 中
    geometry = new THREE.BoxGeometry(1134, 2.4, 60);
    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: 0xe2e3de
    }));
    mesh.castShadow = true;
    var box = new THREE.Box3().setFromObject(mesh);
    mesh.position.set(720, 414.4, -box.max.z);
    parkGroup.add(mesh)

    // 墙壁 上
    geometry = new THREE.BoxGeometry(1627.51, 2.4, 60);
    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: 0xe2e3de
    }));
    mesh.castShadow = true;
    box = new THREE.Box3().setFromObject(mesh);
    mesh.position.set(box.max.x, box.max.y, -box.max.z);
    parkGroup.add(mesh)

    // 墙壁 下
    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: 0xe2e3de
    }));
    mesh.castShadow = true;
    mesh.position.set(box.max.x, 954, -box.max.z);
    parkGroup.add(mesh)

    // 柱子
    var pillarGroup = new THREE.Group();
    var pillarGeometry = new THREE.BoxGeometry(8, 8, 30);
    var pillar, mesh1, mesh2;

    for (var j = 0; j < 4; j++) {
      for (var i = 0; i < 8; i++) {
        mesh1 = new THREE.Mesh(pillarGeometry, new THREE.MeshBasicMaterial({
          color: 0x879596
        }));
        mesh1.castShadow = true;

        mesh2 = new THREE.Mesh(pillarGeometry, new THREE.MeshBasicMaterial({
          color: 0xe2e3de
        }));
        mesh2.castShadow = true;
        mesh1.position.z = 30;

        if (j == 2) {
          mesh1.position.set(i * 126 + 280, j * 126 + 163, -14);
          mesh2.position.set(i * 126 + 280, j * 126 + 163, -44);
        } else if (j == 3) {
          mesh1.position.set(i * 126 + 280, j * 126 + 170, -14);
          mesh2.position.set(i * 126 + 280, j * 126 + 170, -44);
        } else {
          mesh1.position.set(i * 126 + 280, j * 126 + 160, -14);
          mesh2.position.set(i * 126 + 280, j * 126 + 160, -44);
        }
        pillarGroup.add(mesh1);
        pillarGroup.add(mesh2);
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

    parkGroup.add(pillarGroup)
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
    rectShape.lineTo(position[0], position[1]);
    return rectShape;
    // return new THREE.ShapeBufferGeometry(rectShape);
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

  // 画箭头 
  drawArrows: function () {
    var Rwidth = 60,
      Rheight = 6,
      Twidht = 10,
      Theight = 14;
    var rectShape = new THREE.Shape();
    rectShape.moveTo(-(Rwidth + Twidht) / 2, Rheight / 2);
    rectShape.lineTo((Rwidth + Twidht) / 2 - Twidht, Rheight / 2);
    rectShape.lineTo((Rwidth + Twidht) / 2 - Twidht, Theight / 2);
    rectShape.lineTo((Rwidth + Twidht) / 2, 0);
    rectShape.lineTo((Rwidth + Twidht) / 2 - Twidht, -Theight / 2);
    rectShape.lineTo((Rwidth + Twidht) / 2 - Twidht, -Rheight / 2);
    rectShape.lineTo(-(Rwidth + Twidht) / 2, -Rheight / 2);
    rectShape.lineTo(-(Rwidth + Twidht) / 2, Rheight / 2);
    return rectShape;
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

    // 鼠标选中模型
    document.addEventListener('click', function (event) {
      //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
      _this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      _this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
      _this.raycaster.setFromCamera(_this.mouse, _this.camera);

      var intersects = _this.raycaster.intersectObjects(_this.scene.children, true);
      if (intersects.length > 0) {
        intersects.forEach(item => {
          if (item.object.name === "berth") { // || item.object.groupName === "bus"
            item.object.material.color.set(0xff0000);
          }
        });
      } else {

      }
    }, false);

    return;
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
      // _this.animation();
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
    fbxLoader.load('./arrows.FBX', function (obj) {
      obj.rotateX(-Math.PI / 2);
      // obj.position.set(0, 0, -30);
      obj.position.set(centerData[79][0], centerData[79][1], -30);
      _this.parkGroup.add(obj);
    })
    fbxLoader.load('./busFBX.FBX', function (obj) {

      obj.rotateZ(Math.PI / 2);
      obj.rotateY(Math.PI / 2);
      var model;
      for (var i = 70; i < centerData.length; i++) { //centerData.length
        model = obj.clone();
        // 添加自定义属性
        model.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.groupName = "bus";
          }
        })
        model.position.set(centerData[i][0], centerData[i][1], 0.09);
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
    this.controls.update();
    // this.mesh.rotateY(0.01);
    this.renderer.render(this.scene, this.camera);
  },

  // 执行函数
  threeStart: function () {
    this.initScene();
    this.initThree();
    this.initCamera();
    this.initControls();
    this.initLight();
    this.initObject();
    // this.initGrid();
    // this.animation();
    this.initModel();
    this.initEvent();
  }
})