var THREE = require('three');

module.exports = edgeView;

function edgeView(scene) {
  var total = 0;
  var edges; // edges of the graph
  var colors, points; // buffer attributes that represent edge.
  var geometry, edgeMesh;
  var colorDirty, positionDirty;

  // declares bindings between model events and update handlers
  var edgeConnector = {
    fromColor: fromColor,
    toColor: toColor,
    'from.position': fromPosition,
    'to.position': toPosition,
      // visible: true
  };

  return {
    init: init,
    update: update,
    needsUpdate: needsUpdate
  };

  function needsUpdate() {
    return colorDirty;
  }

  function update() {
    if (positionDirty) {
      geometry.getAttribute('position').needsUpdate = true;
      positionDirty = false;
    }

    if (colorDirty) {
      geometry.getAttribute('color').needsUpdate = true;
      colorDirty = false;
    }
  }

  function init(edgeCollection) {
    disconnectOldEdges();

    edges = edgeCollection;
    total = edges.length;

    // If we can reuse old arrays - reuse them:
    var pointsInitialized = (points !== undefined) && points.length === total * 6;
    if (!pointsInitialized) points = new Float32Array(total * 6);
    var colorsInitialized = (colors !== undefined) && colors.length === total * 6;
    if (!colorsInitialized) colors = new Float32Array(total * 6);

    for (var i = 0; i < total; ++i) {
      var edge = edges[i];
      edge.connect(edgeConnector);

      fromPosition(edge);
      toPosition(edge);

      fromColor(edge);
      toColor(edge);


      // 여기에 edgeMesh를 각각 추가하면 어떨지.. (for giving each edge weight(thickness))
    }

    geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors,
        // line width: Due to limitations in the ANGLE layer, with the WebGL renderer on Windows platform linewidth will always be 1 regardless of the set value
        linewidth: 1
    });

    geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

    if (edgeMesh) {
      scene.remove(edgeMesh);
    }

    edgeMesh = new THREE.LineSegments(geometry, material);
    edgeMesh.frustumCulled = false;
    scene.add(edgeMesh);
  }

  function disconnectOldEdges() {
    if (!edges) return;
    for (var i = 0; i < edges.length; ++i) {
      edges[i].disconnect(edgeConnector);
    }
  }

  function fromColor(edge) {
    var fromColorHex = edge.fromColor;

    var i6 = edge.idx * 6;

    colors[i6    ] = ((fromColorHex >> 16) & 0xFF)/0xFF;
    colors[i6 + 1] = ((fromColorHex >> 8) & 0xFF)/0xFF;
    colors[i6 + 2] = (fromColorHex & 0xFF)/0xFF;

    colorDirty = true;
  }

  function toColor(edge) {
    var toColorHex = edge.toColor;
    var i6 = edge.idx * 6;

    colors[i6 + 3] = ((toColorHex >> 16) & 0xFF)/0xFF;
    colors[i6 + 4] = ((toColorHex >> 8) & 0xFF)/0xFF;
    colors[i6 + 5] = ( toColorHex & 0xFF)/0xFF;

    colorDirty = true;
  }

  function fromPosition(edge) {
    var from = edge.from.position;
    var i6 = edge.idx * 6;

    points[i6] = from.x;
    points[i6 + 1] = from.y;
    points[i6 + 2] = from.z;

    positionDirty = true;
  }

  function toPosition(edge) {
    var to = edge.to.position;
    var i6 = edge.idx * 6;

    points[i6 + 3] = to.x;
    points[i6 + 4] = to.y;
    points[i6 + 5] = to.z;

    positionDirty = true;
  }
}
