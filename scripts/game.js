var main = function () {
    var scene = new THREE.Scene();
    var width = window.innerWidth;
    var height = window.innerHeight;
    var fov = ifov;
    var aspect = width / height;
    var near = 0.1;
    var far = 1000;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 2, 0);
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
    var dpad;
    var vx = 0;
    var vy = 0;
    var vz = 0;
    var SIZE=10;
    var SPAWN_X=SIZE/2;
    var SPAWN_Y=2;
    var SPAWN_Z=SIZE/2;
    var projector = new THREE.Projector();
    var mouse = {
        x: 0
        , y: 0
    };

    var grass = new THREE.TextureLoader().load( "images/grass.jpg" );
    grass.wrapS = THREE.RepeatWrapping;
    grass.wrapT = THREE.RepeatWrapping;
    //grass.repeat.set( 4, 4 );
    var grounded=false;
    var pitch = 0.5;
    //grass.onload=function(){
    createUI();
    generateObjects();
    var selected=0;
    var inventory=[0,1,2,3,4,5];
    //};
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
        vx = rz * Math.sin(rot1) + rx * Math.sin(rot1 + Math.PI * 0.5);
        vx *= 10;
        vz = rz * Math.cos(rot1) + rx * Math.cos(rot1 + Math.PI * 0.5);
        vz *= 10;
        //collision
        //xz
        var c = true;
        //side ways
        for (var i = 0; i < 2; i++) {
            var ray = new THREE.Raycaster(new THREE.Vector3(camera.position.x, camera.position.y - 0.5 + i, camera.position.z), new THREE.Vector3(vx, 0, vz).normalize());
            var obj = ray.intersectObjects(targetList);
            if (obj.length > 0) {
                //description.innerHTML = obj[0].distance;
                if (obj[0].distance < 0.5) {
                    c = false;
                }
            }
        }
        // up and down
        vy-=deltaTime*20;
        grounded=false;
        var d=Math.abs(vy*deltaTime);
        d=d<=1?1:d;
        for (var i = 0; i < 8; i++) {
            var a=i/8*3.14;
            var ray = new THREE.Raycaster(new THREE.Vector3(camera.position.x+Math.sin(a), camera.position.y -1, camera.position.z+Math.cos(a)), new THREE.Vector3(0, -1, 0));
            var obj = ray.intersectObjects(targetList);
            if (obj.length > 0) {
                if (obj[0].distance <= d) {
                    camera.position.y+=1-obj[0].distance;
                    if(vy<0){
                        vy=0;
                    }
                    grounded=true;
                }
            }
        }
        //if(vy>0)grounded=false;
        if(grounded&&keysPress[32]){
            vy=8;
        }
        if (c) {
            camera.position.x = camera.position.x + vx*deltaTime;
            camera.position.y = camera.position.y + vy*deltaTime;
            camera.position.z = camera.position.z + vz*deltaTime;
        }
        if(camera.position.y<-10)respawn();
        //mesh.rotation.set(0, mesh.rotation.y + 0.01, mesh.rotation.z + 0.01);
        renderer.render(scene, camera);
        //UI
        lastFrame = new Date().getTime();
        description.innerHTML=inventory[selected];
        
        description.innerHTML=deltaTime;
    })();

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
    var firsttouch = true;
    function respawn(){
        camera.position.x=SPAWN_X;
        camera.position.y=SPAWN_Y;
        camera.position.z=SPAWN_Z;
    }
    function onTouchDpad(event) {
        //w:87 s:83 d:68 a:65
        for (var i = 0; i < event.touches.length; i++) {
            var t = event.touches[i];
            var xd = t.pageX;
            var yd = t.pageY - window.innerHeight + 200;
            keysPress[65] = xd >= 125 ? true : false;
            keysPress[68] = xd <= 75 ? true : false;
            keysPress[87] = yd >= 125 ? true : false;
            keysPress[83] = yd <= 75 ? true : false;
            /*
            keysPress[65] = xd <= 75 ? true : false;
            keysPress[68] = xd >= 125 ? true : false;
            keysPress[87] = yd <= 75 ? true : false;
            keysPress[83] = yd >= 125 ? true : false;
            */
            //description.innerHTML = xd + "," + yd + "," + window.innerHeight;
            break;
        }
        event.preventDefault();
    }

    function onTouchDpadUp(event) {
        //w:87 s:83 d:68 a:65
        keysPress[87] = false;
        keysPress[83] = false;
        keysPress[68] = false;
        keysPress[65] = false;
        event.preventDefault();
    }

    function onTouchStart(event) {
        for (var i = 0; i < event.touches.length; i++) {
            var t = event.touches[i];
            if (!firsttouch) {
                lastTouch.x = t.pageX;
                lastTouch.y = t.pageY;
            }
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
            if (firsttouch) {
                lastTouch.x = t.pageX;
                lastTouch.y = t.pageY;
                firsttouch = false;
                break;
            }
            rot = r + rot;
            pitch += (t.pageY - lastTouch.y) / height;
            if (pitch < 0) pitch = 0;
            if (pitch > 1) pitch = 1;
            var h = Math.sin(pitch * Math.PI + Math.PI * 0.5);
            var c = Math.sqrt(1 - h * h);
            // pi*1.5≤ev.clientY / height * Math.PI + Math.PI * 0.5≤pi*1.5  0≤ev.clientY / height≤pi
            camera.lookAt(new THREE.Vector3(Math.sin(rot + Math.PI) * c + camera.position.x, camera.position.y + h, Math.cos(rot + Math.PI) * c + camera.position.z));
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
        //description.innerHTML = new Date().getTime() - touchTime;
        var xd = touchPos.x - lastTouch.x;
        var yd = touchPos.y - lastTouch.y;
        if (new Date().getTime() - touchTime < 200 && xd * xd + yd * yd < 10) {
            width = window.innerWidth;
            height = window.innerHeight;
            put(lastTouch.x / width, lastTouch.y / height);
        }
    }

    function put(x, y) {
        var vector = new THREE.Vector3(x, y, 1);
        projector.unprojectVector(vector, camera);
        var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var obj = ray.intersectObjects(targetList);
        if (obj.length > 0) {
            addCube(obj[0].object.position.x + obj[0].face.normal.x, obj[0].object.position.y + obj[0].face.normal.y, obj[0].object.position.z + obj[0].face.normal.z);
            /*
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
            */
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
                if(inventory[selected]==0){
                    destroy(0, 0);
                }else{
                    put(0,0);
                }
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
        camera.position.x =SPAWN_X;
        camera.position.y =SPAWN_Y;
        camera.position.z =SPAWN_Z;
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, 0.7, 0.7);
        scene.add(directionalLight);
        var light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);
        for (var i = 0; i < SIZE; i++) {
            for (var j = 0; j < SIZE; j++) {
                addCube(i, 0, j);
            }
            /*
            var geometry = new THREE.CubeGeometry(1, 1, 1);
            var material = new THREE.MeshPhongMaterial({
                color: 0xff0000
            });
            var mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            mesh.position.set(Math.random() * 100 - 50, i % 5, Math.random() * 100 - 50);
            targetList[i] = mesh;
            */
        }
    }

    function addCube(x, y, z) {
        var geometry = new THREE.CubeGeometry(1, 1, 1);
        var material = new THREE.MeshPhongMaterial({
            map:grass
        });
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        mesh.position.set(x, y, z);
        targetList[targetList.length] = mesh;
        for (var i = 0; i < targetList.length - 1; i++) {
            var a = targetList[i];
            if (a.position.x == mesh.position.x && a.position.y == mesh.position.y && a.position.z == mesh.position.z) {
                targetList.splice(i, 1);
                scene.remove(a.object);
            }
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
        //cross
        var cross = document.createElement("img");
        cross.src = "images/cross.png";
        cross.style.top = (height / 2 - 20) + "px";
        cross.style.left = (width / 2 - 20) + "px";
        cross.style.position = "absolute";
        cross.style.zIndex = "1";
        cross.width = 40;
        cross.height = 40;
        cross.addEventListener('touchstart', onTouchStart, false);
        cross.addEventListener('touchmove', onTouchMove, false);
        cross.addEventListener('touchend', onTouchEnd, false);
        document.body.appendChild(cross);
        //d-pad
        dpad = document.createElement("img");
        dpad.src = "images/dpad.png";
        dpad.style.top = (height - 200) + "px";
        dpad.style.left = 0 + "px";
        dpad.style.position = "absolute";
        dpad.style.zIndex = "1";
        dpad.width = 200;
        dpad.height = 200;
        dpad.addEventListener('touchstart', onTouchDpad, false);
        dpad.addEventListener('touchmove', onTouchDpad, false);
        dpad.addEventListener('touchend', onTouchDpadUp, false);
        document.body.appendChild(dpad);
        //description
        renderer.domElement.style.cursor = "none";
        description.style.color = "#fff";
        description.style.position = "absolute";
        description.style.zIndex = "1";
        description.innerHTML = "right click : put blocks<br>left click : destroy blocks<br>10:05";
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
