var flyTo = require('./flyTo.js');
module.exports = createAutoFit;

function createAutoFit(nodeView, camera) {
  var radius = 100;
  return {
    update: update,
    lastRadius: getLastRadius
  };

  function update() {
    var sphere = nodeView.getBoundingSphere();
    // radius = Math.max(sphere.radius, 500);

    //  5000 만큼 멀어지기?
    radius = Math.max(sphere.radius, 5000);
    flyTo(camera, sphere.center, radius);
  }

  function getLastRadius() {
    return radius;
  }
}
