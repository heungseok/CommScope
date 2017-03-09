module.exports = createNodeSettings;

function createNodeSettings(gui, renderer) {
  var nodeSettings = gui.addFolder('Current Node');
  var currentNode = {
    id: '',
    label: '',
    color: 0,
    size: 0,
    isPinned: false

  };

  nodeSettings.add(currentNode, 'id');
  nodeSettings.add(currentNode, 'label');
  nodeSettings.addColor(currentNode, 'color').onChange(setColor);
  nodeSettings.add(currentNode, 'size', 0, 200).onChange(setSize);
  nodeSettings.add(currentNode, 'isPinned').onChange(setPinned);

  return {
    setUI: setUI
  };

  function setUI(nodeUI, label) {

    if (nodeUI)  {
      currentNode.id = nodeUI.id;
      currentNode.color = nodeUI.color;
      currentNode.size = nodeUI.size;
      currentNode.label = label;


      var layout = renderer.layout();
      if (layout && layout.pinNode) {
        currentNode.isPinned = layout.pinNode(nodeUI.id);
      }
    } else {
      currentNode.id = '';
      currentNode.color = 0;
      currentNode.size = 0;
      currentNode.label = '';
      currentNode.isPinned = false;
    }
    gui.update();
  }


  function setColor() {
    var node = renderer.getNode(currentNode.id);
    // console.log(currentNode.color);
    if (node) {
      node.color = currentNode.color;
      renderer.focus();
    }
  }

  function setSize() {
    var node = renderer.getNode(currentNode.id);
      console.log(currentNode.size);
    if (node) {
      node.size = currentNode.size;
      renderer.focus();
    }
  }

  function setPinned() {
    if (!currentNode.id) return;

    var layout = renderer.layout();
    if (layout.pinNode) {
      layout.pinNode(currentNode.id, currentNode.isPinned);
    } else {
      currentNode.isPinned = false;
      gui.update();
    }
    renderer.focus();
  }
}
