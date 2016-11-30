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
    var light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);
    var targetList = [];
    for (var i = 0; i < 1000; i++) {
        var geometry = new THREE.CubeGeometry(1, 1, 1);
        var material = new THREE.MeshPhongMaterial({
            color: 0xff0000
        });
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        mesh.position.set(Math.random() * 100 - 50, i % 5, Math.random() * 100 - 50);
        targetList[i] = mesh;
    }
    var mx = 0;
    var my = 0;
    var keysPress = new Array(256);
    var rot = 0;
    (function renderLoop() {
        requestAnimationFrame(renderLoop);
        var rx = 0;
        var rz = 0;
        //w:87 s:83 d:68 a:65
        if (keysPress[87]) rz = 1;
        if (keysPress[83]) rz = -1;
        if (keysPress[68]) rx = -1;
        if (keysPress[65]) rx = 1;
        camera.position.x = camera.position.x + rz * Math.sin(rot) + rx * Math.cos(rot);
        camera.position.z = camera.position.z + rz * Math.cos(rot) + rx * Math.sin(rot);
        //mesh.rotation.set(0, mesh.rotation.y + 0.01, mesh.rotation.z + 0.01);
        renderer.render(scene, camera);
    })();
    var projector = new THREE.Projector();
    var mouse = {
        x: 0
        , y: 0
    };
    console.log(scene.objects);
    window.onkeydown = function (ev) {
        keysPress[ev.keyCode] = true;
    }
    window.onkeyup = function (ev) {
        keysPress[ev.keyCode] = false;
    }
    window.onmousemove = function (ev) {
        var h = Math.sin(ev.clientY / height * Math.PI + Math.PI * 0.5);
        var c = Math.sqrt(1 - h * h);
        var r = ev.clientX / width * 10;
        rot = r;
        camera.lookAt(new THREE.Vector3(Math.sin(r) * c + camera.position.x, camera.position.y + h, Math.cos(r) * c + camera.position.z));
        //camera.rotation.x = ev.clientY / height * Math.PI + Math.PI * 0.5;
        //camera.rotation.x = ev.clientY / height * Math.PI + Math.PI * 0.5;
        //mx = ev.clientX;
        //my = ev.clientY;
    }

    function rotateCamera(xaxis, yaxis) {}
    window.onmousedown = function (ev) {
        if (ev.target == renderer.domElement) {
            var rect = ev.target.getBoundingClientRect();
            mouse.x = ev.clientX - rect.left;
            mouse.y = ev.clientY - rect.top;
            mouse.x = (mouse.x / width) * 2 - 1;
            mouse.y = -(mouse.y / height) * 2 + 1;
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, camera);
            var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            var obj = ray.intersectObjects(targetList);
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
                }
            }
            ev.preventDefault();
        }
    };
};
window.addEventListener('DOMContentLoaded', main, false);