/**
 * Moves camera to given point, and stops it and given radius
 */
var THREE = require('three');
var intersect = require('./intersect.js');
var TWEEN = require('tween.js');

module.exports = flyTo;

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

var flyTo_smooth = function (camera, to, radius) {
  console.log("hello!");
  console.log(camera);
  console.log(to);
  var cameraOffset = radius / Math.tan(Math.PI / 180.0 * camera.fov * 0.5);

  var from = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
  };

  camera.lookAt(new THREE.Vector3(to.x, to.y, to.z));

  // var cameraEndPos = intersect(from, to, cameraOffset);
  // camera.position.x = cameraEndPos.x;
  // camera.position.y = cameraEndPos.y;
  // camera.position.z = cameraEndPos.z;
};

module.exports.flyTo_smooth = flyTo_smooth;