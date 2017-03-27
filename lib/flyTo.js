/**
 * Moves camera to given point, and stops it and given radius
 */
var THREE = require('three');
var intersect = require('./intersect.js');
var TWEEN = require('tween.js');

module.exports = flyTo;


function flyTo() {

    return {
        flyTo: flyTo,
        flyTo_smooth: flyTo_smooth
    };

    function flyTo(camera, to, radius) {
        var cameraOffset = radius / Math.tan(Math.PI / 180.0 * camera.fov * 0.5);

        var from = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
        };

        camera.lookAt(new THREE.Vector3(to.x, to.y, to.z));
        var cameraEndPos = intersect(from, to, cameraOffset);
        camera.position.x = cameraEndPos.x;
        camera.position.y = cameraEndPos.y;
        camera.position.z = cameraEndPos.z;
    }


    function flyTo_smooth (camera, targetPosition) {

        console.log("hello again")
        console.log(camera)
        console.log(targetPosition)

        var from = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        };

        var to = {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z
        };
        var tween = new TWEEN.Tween(from)
            .to(to, 600)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(function () {
                camera.position.set(this.x, this.y, this.z);
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            })
            .onComplete(function () {
                cameraAdjust = true;
                camera.lookAt(new THREE.Vector3(0, 0, 0));
                console.log(camera.position);

            })
            .start();

    };




}

