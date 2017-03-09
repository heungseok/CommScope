/**
 * Controls available settings for the gobal view settings (like node colors,
 * size, 3d/2d, etc.)
 *
 * @param {ngraph.pixel} renderer instance which is performing the rendering.
 * @param {dat.gui} gui instance which shows configuration interface
 */
module.exports = addGlobalViewSettings;

function addGlobalViewSettings(settings) {
  var gui = settings.gui();
  var renderer = settings.renderer();
  var folder = gui.addFolder('View Settings');

  var model = {
    nodeColor: 0xffffff,
    backgroundColor: 0x000000,
    linkStartColor: 0x333333,
    linkEndColor: 0x333333,
    nodeSize: 15,
    stable: changeStable
  };

  var stableController = folder.add(model, 'stable').name('Pause Layout');
  folder.addColor(model, 'nodeColor').onChange(setNodeColor);
  if (renderer.clearColor) folder.addColor(model, 'backgroundColor').onChange(setBackgroundColor);
  folder.add(model, 'nodeSize', 0, 200).onChange(setNodeSize);
  folder.addColor(model, 'linkStartColor').onChange(setLinkColor);
  folder.addColor(model, 'linkEndColor').onChange(setLinkColor);
  folder.open();

  // TODO: add gui.destroyed, so that we can release renderer events:
  // whenever user changes mode via API/keyboard, reflect it in our UI:
  renderer.on('stable', updateStableUI);

  function changeStable() {
    renderer.stable(!renderer.stable());
    renderer.focus();
  }

  function updateStableUI() {
    var isStable = renderer.stable();
    stableController.name(isStable ? 'Resume Layout' : 'Pause Layout');
  }

  function setNodeColor() {
    renderer.forEachNode(setCustomNodeColor);
    renderer.focus();

    function setCustomNodeColor(ui) {
      ui.color = model.nodeColor;
    }
  }

  function setBackgroundColor(color) {
    renderer.clearColor(color);
  }

  function setNodeSize() {
    renderer.forEachNode(setCustomNodeSize);
    renderer.focus();

    function setCustomNodeSize(ui) {
      ui.size = model.nodeSize;
    }
  }

  function setLinkColor() {
    renderer.forEachLink(setCustomLinkUI);
    renderer.focus();
  }

  function setCustomLinkUI(ui) {
    ui.fromColor = model.linkStartColor;
    ui.toColor = model.linkEndColor;
  }
}
