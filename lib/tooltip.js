/**
 * manages view for tooltips shown when user hover over a node
 */
module.exports = createTooltipView;

var tooltipStyle = require('../style/tooltip_style.js');
var insertCSS = require('insert-css');

var elementClass = require('element-class');

function createTooltipView(container) {
  insertCSS(tooltipStyle);

  var view = {
    show: show,
    hide: hide,
    showLabels: showLabels,
    createLabeltip: createLabeltip,
    delectLabeltip: delectLabeltip
  };

  var tooltipDom, tooltipVisible;
  var labelDoms = [];

  return view;

  function show(e, node) {
    if (!tooltipDom) createTooltip();
    tooltipDom.style.left = e.x + 'px';
    tooltipDom.style.top = e.y + 'px';

    tooltipDom.innerHTML =
        "name: " + node.data.label +
        "<br><span>size: " + node.data.size + "</span>";

    /*
    tooltipDom.innerHTML =
        "name: " + node.data.label +
        "<br><span>color: " + node.data.color + "</span>" +
        "<br><span>size: " + node.data.size + "</span>";
    */
    tooltipVisible = true;
  }

  function hide() {
    if (tooltipVisible) {
      tooltipDom.style.left = '-10000px';
      tooltipDom.style.top = '-10000px';
      tooltipVisible = false;
    }
  }

  function createTooltip() {
    tooltipDom = document.createElement('div');
    elementClass(tooltipDom).add('ngraph-tooltip');

    // 기존 tooltip => container에 appended
    container.appendChild(tooltipDom);


  }


  function showLabels(nodes) {
    for(var i=0; i<nodes.length; i++){

      labelDoms[i].style.left = nodes[i].x + 'px';
      labelDoms[i].style.top = nodes[i].y + 'px';
      labelDoms[i].style.position = "absolute";
      labelDoms[i].style.color = 'rgba(255, 255, 255, 0.8)';
      labelDoms[i].style.background = 'rgba(0, 0, 0, 0)';
    }
  }

  function createLabeltip(tips) {

    for(var i=0; i<tips.length; i++){

      var tempDom = document.createElement('div');
      elementClass(tempDom).add('label-tooltip');
      container.appendChild(tempDom);
      tempDom.innerHTML = tips[i].label;
      labelDoms.push(tempDom);
    }

  }
  
  function delectLabeltip() {
      var tips = document.getElementsByClassName("label-tooltip");

      while(tips[0]){
        tips[0].parentNode.removeChild(tips[0]);
      }
      labelDoms.length = 0;
  }


}
