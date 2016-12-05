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
    var targetList = [];
    var mx = 0;
    var my = 0;
    var keysPress = new Array(256);
    var rot = 0;
    var lastFrame = new Date().getTime();
    var deltaTime = 0;
    var description = document.createElement("div");
    createUI();
    generateObjects();
    (function renderLoop() {
        requestAnimationFrame(renderLoop);
        var rx = 0;
        var rz = 0;
        var rot1 = rot;
        var v;
        deltaTime = (new Date().getTime() - lastFrame) * 0.001;
        //w:87 s:83 d:68 a:65
        if (keysPress[87]) rz = 1;
        if (keysPress[83]) rz = -1;
        if (keysPress[68]) rx = -1;
        if (keysPress[65]) rx = 1;
        var vx = rz * Math.sin(rot1) + rx * Math.sin(rot1 + Math.PI * 0.5);
        vx *= deltaTime * 10;
        var vz = rz * Math.cos(rot1) + rx * Math.cos(rot1 + Math.PI * 0.5);
        vz *= deltaTime * 10;
        camera.position.x = camera.position.x + vx;
        camera.position.z = camera.position.z + vz;
        //mesh.rotation.set(0, mesh.rotation.y + 0.01, mesh.rotation.z + 0.01);
        renderer.render(scene, camera);
        //UI
        lastFrame = new Date().getTime();
    })();
    var projector = new THREE.Projector();
    var mouse = {
        x: 0
        , y: 0
    };
    var pitch = 0;
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
        var r = -ev.clientX / width * 10;
        rot = r;
        camera.lookAt(new THREE.Vector3(Math.sin(rot) * c + camera.position.x, camera.position.y + h, Math.cos(rot) * c + camera.position.z));
        //camera.rotation.x = ev.clientY / height * Math.PI + Math.PI * 0.5;
        //camera.rotation.x = ev.clientY / height * Math.PI + Math.PI * 0.5;
        //mx = ev.clientX;
        //my = ev.clientY;
    }
    renderer.domElement.addEventListener('touchstart', onTouchStart, false);
    renderer.domElement.addEventListener('touchmove', onTouchMove, false);
    renderer.domElement.addEventListener('touchend', onTouchEnd, false);
    var lastTouch = {
        x: 0
        , y: 0
    };
    var touchPos = {
        x: 0
        , y: 0
    };
    var touchTime = 0;

    function onTouchStart(event) {
        for (var i = 0; i < event.touches.length; i++) {
            var t = event.touches[i];
            lastTouch.x = t.pageX;
            lastTouch.y = t.pageY;
            touchPos.x = t.pageX;
            touchPos.y = t.pageY;
            touchTime = new Date().getTime();
            break;
        }
        event.preventDefault();
    }

    function onTouchMove(event) {
        for (var i = 0; i < event.touches.length; i++) {
            var t = event.touches[i];
            var r = (t.pageX - lastTouch.x) / width * 5;
            rot = r + rot;
            pitch += (t.pageY - lastTouch.y) / height * Math.PI;
            if (pitch < -Math.PI * 1.5) pitch = -Math.PI * 1.5;
            if (pitch > Math.PI * 0.5) pitch = Math.PI * 0.5;
            var h = Math.sin(pitch);
            var c = Math.sqrt(1 - h * h);
            camera.lookAt(new THREE.Vector3(Math.sin(rot) * c + camera.position.x, camera.position.y + h, Math.cos(rot) * c + camera.position.z));
            //camera.lookAt(new THREE.Vector3(Math.sin(rot) + camera.position.x, camera.position.y, Math.cos(rot) + camera.position.z));
            //description.innerHTML = r;
            lastTouch.x = t.pageX;
            lastTouch.y = t.pageY;
            break;
        }
        // Prevent the browser from doing its default thing (scroll, zoom)
        event.preventDefault();
    }

    function onTouchEnd(event) {
        //do stuff
        description.innerHTML = new Date().getTime() - touchTime;
        if (new Date().getTime() - touchTime < 200) {
            put(0, 0);
        }
    }

    function put(x, y) {
        var vector = new THREE.Vector3(x, y, 1);
        projector.unprojectVector(vector, camera);
        var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var obj = ray.intersectObjects(targetList);
        if (obj.length > 0) {
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
    }

    function destroy(x, y) {
        var vector = new THREE.Vector3(x, y, 1);
        projector.unprojectVector(vector, camera);
        var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var obj = ray.intersectObjects(targetList);
        if (obj.length > 0) {
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

    function rotateCamera(xaxis, yaxis) {}
    window.onmousedown = function (ev) {
        console.log(ev.target.tagName);
        if (ev.target == renderer.domElement) {
            var rect = ev.target.getBoundingClientRect();
            mouse.x = ev.clientX - rect.left;
            mouse.y = ev.clientY - rect.top;
            mouse.x = (mouse.x / width) * 2 - 1;
            mouse.y = -(mouse.y / height) * 2 + 1;
            if (ev.button == 0) {
                //put(mouse.x, mouse.y);
                //put(0, 0);
                destroy(0, 0);
            }
            if (ev.button == 2) {
                put(0, 0);
            }
            /*
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
            */
        }
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        return false;
    };

    function generateObjects() {
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, 0.7, 0.7);
        scene.add(directionalLight);
        var light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);
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
    }

    function createUI() {
        /*
        var button = document.createElement("button");
        document.body.appendChild(button);
        button.innerHTML = "button";
        button.style.top = "0px";
        button.style.position = "absolute";
        button.style.zIndex = "1";
        */
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.zIndex = "0";
        var cross = document.createElement("img");
        cross.src = "images/cross.png";
        cross.style.top = (height / 2 - 20) + "px";
        cross.style.left = (width / 2 - 20) + "px";
        cross.style.position = "absolute";
        cross.style.zIndex = "1";
        cross.width = 40;
        cross.height = 40;
        document.body.appendChild(cross);
        renderer.domElement.style.cursor = "none";
        description.style.color = "#fff";
        description.style.position = "absolute";
        description.style.zIndex = "1";
        description.innerHTML = "right click : put blocks<br>left click : destroy blocks";
        document.body.appendChild(description);
        window.onresize = function () {
            width = window.innerWidth;
            height = window.innerHeight;
            renderer.setSize(width, height);
            cross.style.top = (height / 2 - 20) + "px";
            cross.style.left = (width / 2 - 20) + "px";
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }
};
window.addEventListener('DOMContentLoaded', main, false);