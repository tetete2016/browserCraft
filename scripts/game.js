/*
var scene = new THREE.Scene();
//fov aspect near far
var camera = new THREE.Camera(60, window.innerWidth / window.innerWidth, 0.5, 100);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerWidth);
document.body.appendChild(renderer.domElement);
//test gemetry
camera.position.set(0, 0, 50);
var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(0, 0.7, 0.7);
scene.add(directionalLight);
var geometry = new THREE.CubeGeometry(30, 30, 30);
var material = new THREE.MeshPhongMaterial({
    color: 0xff0000
});
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
renderer.render(scene, camera);
*/
var main = function () {
    var scene = new THREE.Scene();
    var width = window.innerWidth;
    var height = window.innerHeight;
    var fov = 60;
    var aspect = width / height;
    var near = 1;
    var far = 1000;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 50);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0.7, 0.7);
    scene.add(directionalLight);
    var targetList = [];
    for (var i = 0; i < 10; i++) {
        var geometry = new THREE.CubeGeometry(1, 1, 1);
        var material = new THREE.MeshPhongMaterial({
            color: 0xff0000
        });
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        mesh.position.set(i, 0, 0);
        targetList[i] = mesh;
    }
    (function renderLoop() {
        requestAnimationFrame(renderLoop);
        //mesh.rotation.set(0, mesh.rotation.y + 0.01, mesh.rotation.z + 0.01);
        renderer.render(scene, camera);
    })();
    var projector = new THREE.Projector();
    //マウスのグローバル変数
    var mouse = {
        x: 0
        , y: 0
    };
    console.log(scene.objects);
    window.onmousedown = function (ev) {
        if (ev.target == renderer.domElement) {
            //マウス座標2D変換
            var rect = ev.target.getBoundingClientRect();
            mouse.x = ev.clientX - rect.left;
            mouse.y = ev.clientY - rect.top;
            //マウス座標3D変換 width（横）やheight（縦）は画面サイズ
            mouse.x = (mouse.x / width) * 2 - 1;
            mouse.y = -(mouse.y / height) * 2 + 1;
            // マウスベクトル
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            // vector はスクリーン座標系なので, オブジェクトの座標系に変換
            projector.unprojectVector(vector, camera);
            // 始点, 向きベクトルを渡してレイを作成
            var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            // クリック判定
            var obj = ray.intersectObjects(targetList);
            // クリックしていたら、alertを表示  
            if (obj.length > 0) {
                if (ev.button == 2) {
                    var geometry = new THREE.CubeGeometry(1, 1, 1);
                    var material = new THREE.MeshPhongMaterial({
                        color: 0xffffff
                    });
                    var cube = new THREE.Mesh(geometry, material);
                    scene.add(cube);
                    cube.position.x = obj[0].object.position.x + obj[0].face.normal.x;
                    cube.position.y = obj[0].object.position.y + obj[0].face.normal.y;
                    cube.position.z = obj[0].object.position.z + obj[0].face.normal.z;
                    targetList.push(cube);
                }
                if (ev.button == 0) {
                    console.log(targetList);
                    var index = 0;
                    for (var i = 0; i < targetList.length; i++) {
                        if (targetList[i].uuid == obj[0].object.uuid) {
                            index = i;
                        }
                    }
                    targetList.splice(index, 1);
                    scene.remove(obj[0].object);
                    alert(targetList);
                }
            }
        }
    };
};
window.addEventListener('DOMContentLoaded', main, false);