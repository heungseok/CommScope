/**
 * Created by heungseok2 on 2017-02-07.
 */

// *********** import library ***********
var $ = require("jquery");
var nGraph = require('ngraph.graph');
var http = require('http');
var d3 = require('d3');
var d3_chart = require('./../js/d3_chart.js');
// load renderer
var graphRenderer = require('./../js/index.js');
// load node UI
var createSettingsView = require('config.pixel');
var addCurrentNodeSettings = require('../nodeSettings.js');

// *********** declare global var ***********
// create Graph, renderer var
var graph, renderer;

// gui view, renderer setting
var settingsView, gui, nodeSettings, physicsSettings;
var gui_open;
var degreeThreshold_ToShowLabel;

// variable for set root, target network
var currentName, targetName, pathName;
var targetType, rootType;
var combination_network;

// first time period
var network_period = "0317-0323";
// timer variable
var timer;
// timeline tooltip dom element
var timeLineTooltipDom;
// color palette
var color_palette = {
    "0": 0x800000,
    "1": 0x800080,
    "2": 0x008000,
    "3": 0x000080,
    "4": 0x808000,
    "5": 0x804080,
    "6": 0x008080
}



/*
var community_map = {
    "일베": "ilbe",
    "디씨": "dc",
    "오유": "ou",
    "인벤": "inven",
    "엠팍": "mp"
};
*/

// declare empty color map for random color generator
// var color_map = {};




initNetwork();

// init network
function initNetwork(){

    currentName = "global_candidate";
    targetName = "global_candidate";
    pathName = targetName + "_network.json";
    targetType = "candidate";
    rootType = "candidate";

    $("#current_network").html("Global network - root as candidate");
    // 반대 type의 버튼 클릭 금지.
    $('img.network_btn[type="community"]').css('pointer-events', 'none');

    // create Graph var
    graph = nGraph();
    // create graph Renderer var
    renderer = graphRenderer(graph,{
        container: document.getElementById("container"),
        link: renderLink,
        node: renderNode,
        physics:{
            gravity : -20,
            timeStep : 8

        }

    });

    settingsView = createSettingsView(renderer);
    gui = settingsView.gui();
    document.getElementById("gui_control").appendChild(settingsView.getGUIDom());

    gui_open = false;
    if(gui_open) gui.open();
    else gui.close();

    nodeSettings = addCurrentNodeSettings(gui, renderer);
    physicsSettings = {gravity: -5}; // construct physics simulator settings

    degreeThreshold_ToShowLabel = 30;

    // set checked img to the initial period( 체크 이미지 첫 날짜에 set)
    console.log(document.getElementById("checked"));
        // document.getElementById("checked").css("display", "block");




    // graph 네트워크 생성
    // load graph file remotely using GET method.
    AjaxFileRead(pathName);

    // 모든 이미지 활성화(as global network is on)
    $('.network_btn').css('filter', 'grayscale(0)');

    // init network eventHandler
    initEventHandler();

    // create TimeLine Tooltip
    createTimeLineTooltip();


    // d3 차트생성
    // var d3_gui = d3_chart('timePeriod');
    // d3_gui.init();
    // d3_gui.drawTimePeriod();

}


function AjaxFileRead(pathName) {
    var degreeSum = 0;


    http.get({path : "./data/" + network_period + "/" + pathName, json: true }, function (res) {
        console.log("0. Load graph file start.");

        var body = '';
        res.on('data', function (buf) {
            body += buf;
        });
        res.on('end', function () {
            // Data reception is don, do whatever with it!
            var parsed = JSON.parse(body);
            console.log("1. Load the graph file completed.");
            // console.log(parsed);

            // init color map
            // initRandomColorMap(parsed['mode_num']);

            console.log("2. Start Initializing graph ");
            graph.beginUpdate();
            parsed['nodes'].forEach(function (node) {
                degreeSum += Number(node.size);

                if(node.color){
                    // This is for the gephi output
                    graph.addNode(node.id, {
                        label: node.label,
                        color: Number(rgb2hex(node.color)),
                        size: Number(node.size)*0.1,
                        activated: false
                    });
                }else if(node.attributes["Modularity Class"]){
                    var module = node.attributes["Modularity Class"];

                    // This is for the color pallete
                    graph.addNode(node.id,{
                        label: node.label,
                        color: color_palette[module],
                        size: Number(node.size)*0.1,
                        activated: false
                    });

                    /* This is for the random color generator
                    graph.addNode(node.id, {
                        label: node.label,
                        color: color_map[module],
                        size: Number(node.size)*0.1,
                        activated: false
                    });
                    */
                }

            });
            parsed['edges'].forEach(function (edge) {

                if(edge.color){
                    graph.addLink(edge.source, edge.target, {
                        color: rgb2hex(edge.color),
                        activated: false
                    });
                }else{

                    // This is for the color pallete
                    graph.addLink(edge.source, edge.target, {
                        fromColor: color_palette[edge.source_color],
                        toColor: color_palette[edge.target_color],
                        // color: rgb2hex("rgb(158,158,198)"),
                        activated: false
                    });

                    /* This is for the random color generator
                    graph.addLink(edge.source, edge.target, {
                        fromColor: color_map[edge.source_color],
                        toColor: color_map[edge.target_color],
                        // color: rgb2hex("rgb(158,158,198)"),
                        activated: false
                    });
                    */
                }

            });
            graph.endUpdate();

            // set the threshold to show label as mean degree
            console.log(degreeSum);

            // 평균 sum 이상인 노드들에 대한 라벨만 표시
            // renderer.initLabels(degree = degreeSum/parsed['nodes'].length);

            // 모든 라벨 표시
            renderer.initLabels(degree = 0);

            console.log("3. Finished graph construct");

            console.log("4. stop the layout after loading the data");

            // if the timer is overlapped, clear the previous one.
            clearTimeout(timer);

            timer = setTimeout(function (){
                // fit the network with the screen automatically
                renderer.autoFit();
                // set the layout stable to stop the layout
                renderer.stable(true);
            }, 5000);


        });
    });


}


function initRandomColorMap(color_length) {

    for(var i=0; i<color_length; i++){
        // modularity id: i; color: "0x111111";
        var random_color = '0x'+Math.random().toString(16).substr(2,6);
        color_map[''+i] = random_color;

    }
}




// d3 바차트 생성.
// d3_ui.init();
// var test = d3.selectAll('text.lineChart_legend');
// console.log(test);


// Time line 클릭 이벤트 set
$(document).ready(timeLineEvent);

function createTimeLineTooltip() {
    timeLineTooltipDom = document.createElement('div');
    timeLineTooltipDom.className = 'timeLine-tooltip';


}

function timeLineEvent() {
    $("li.time").click(function () {

        // switch the current period to the target period
        var targetPeriod = $(this).attr("value");
        // console.log(targetPeriod);

        // network update
        if(network_period == targetPeriod){
            // do nothing
            console.log("the period is same with current");
        }else{

            // change the position of the checked image according to the clicked element's position
            var element_bounding = $(this).get(0).getBoundingClientRect();
            var top = element_bounding.top;
            var left = element_bounding.left;
            var doc_width = window.innerWidth;
            var doc_height = window.innerHeight;

            top = top*100/doc_height - 5;
            left = left*100/doc_width + 0.5;

            $("#checked").css({
                'top': top + "vh",
                'left': left + "vw",
                // 'transition': '.5s ease-in-out'  // 브라우저 부담이 심해서 뺌.
            });

            // graph clear and renew the network
            network_period = targetPeriod;
            graphClear();
            AjaxFileRead(pathName);
        }
    });

    $("li.time").hover(function () {
        // the target period assign to show tooltip
        var tooltipText = $(this).attr("value");
        var element_bounding = $(this).get(0).getBoundingClientRect();
        var top = element_bounding.top;
        var left = element_bounding.left + 30;

        var doc_width = window.innerWidth;
        var doc_height = window.innerHeight;
        top = top*100/doc_height;
        left = left*100/doc_width;

        timeLineTooltipDom.innerHTML =
            "crawled period: " + tooltipText;
        // timeLineTooltipDom.style.left = left + 'px';
        // timeLineTooltipDom.style.top = top + 'px';
        timeLineTooltipDom.style.left = left + 'vw';
        timeLineTooltipDom.style.top = top + 'vh';

        timeLineTooltipDom.style.textAlign = 'left';
        timeLineTooltipDom.style.width = 'fit-content';
        timeLineTooltipDom.style.position = "absolute";
        timeLineTooltipDom.style.background = 'rgba(50, 50, 50, 0.7)';
        timeLineTooltipDom.style.zIndex = 50;

        document.getElementById("container").appendChild(timeLineTooltipDom);
        // $(this).get(0).appendChild(timeLineTooltipDom);

    }, function () {
        // if mouse leave, clean the innerHTML
        timeLineTooltipDom.innerHTML = "";
    });


}


// ROOT(global) 버튼 클릭 이벤트.
$(".root_network").click(function () {

    var targetRoot = $(this).attr("type");

    // 현재 root와 targetRoot와 다를 경우, Root switching
    if(rootType != targetRoot){

        $('.' + rootType + '_container').css({
            'border-style': 'solid',
            'border-color': 'black',
            'transition': '.8s ease-in-out'
        });

        $('.' + targetRoot + '_container').css({
            'border-style': 'solid',
            'border-color': 'grey',
            'transition': '.8s ease-in-out'
        });

        console.log( "switch the root from " + rootType + " to " + targetRoot);

        // set path name as new global network
        pathName = "global_" + targetRoot +"_network.json";
        // set targetRoot as rootType
        rootType = targetRoot;

    // 현재 root와 targetRoot가 같을 경우, Root reload
    }else{
        console.log("Root is same as: " + rootType + ", and clean the current network(후보, 후보+커뮤니티) and switch network as rootType");

        // set path name as new global network(rootType network reload)
        pathName = "global_" + rootType +"_network.json";

    }

    // 반대 type의 버튼 클릭 금지 및 현재 type 버튼 클릭 활성화
    if(rootType=="candidate"){
        $('img.network_btn[type="community"]').css('pointer-events', 'none');
        $('img.network_btn[type="candidate"]').css('pointer-events', 'auto');

    }else{
        $('img.network_btn[type="candidate"]').css('pointer-events', 'none');
        $('img.network_btn[type="community"]').css('pointer-events', 'auto');
    }

    // set the other buttons and current rootType inactive, and clear current name and combination
    $('.network_btn').css('filter', 'grayscale(0)');
    $('.network_btn:hover').css('filter', 'grayscale(0)');


    // combination, currentName 초기화
    currentName = "";
    combination_network = "";

    graphClear();
    $("#current_network").html("Global network - root as " + rootType);
    AjaxFileRead(pathName);


});


// 후보자, 커뮤니티 버튼 클릭 이벤트.
$(".network_btn").click(function () {

    // 모든 버튼 활성화
    $('img.network_btn').css('pointer-events', 'auto');

    // 클릭한 버튼의 타입(후보자, 커뮤니티)
    targetType = $(this).attr("type");
    // 클릭한 버튼의 name
    targetName = $(this).attr("name");


    // 현재 타입과 다를 경우 조합 네트워크 호출(ex 후보자->커뮤니티, 커뮤니티->후보자)
    if(rootType != targetType){
        twosteps_network(currentName, targetName);

    // 현재 타입과 동일할 경우(ex 후보자->후보자, 커뮤니티->커뮤니티)
    }else if(currentName){

        if(targetName != currentName){

            console.log("Switch Network! {current network: "+ currentName +
                ", target network: " + targetName);

            // 후보자->후보자 혹은 후보자+커뮤니티->후부자 인경우 커뮤니티 버튼 색 활성화, and vice versa
            if(rootType == "candidate")     $('img.network_btn[type="community"]').css('filter', 'grayscale(0)');
            else                            $('img.network_btn[type="candidate"]').css('filter', 'grayscale(0)');


            // target을 제외한 이미지 inactive
            $('img.network_btn[type='+rootType+']').css('filter', 'grayscale(100%)');
            // target 에 대한 이미지 active
            $('img[name='+targetName+']').css('filter', 'grayscale(0)');


            graphClear();

            // load other network
            currentName = targetName;
            pathName = currentName + "_network.json";
            $("#current_network").html(currentName);
            AjaxFileRead(pathName);

            // combination 초기화
            combination_network = "";

        // 후보자==후보자, or 커뮤니티==커뮤니티
        }else {
            console.log("current network is same with the target")

            // 만약 combination이 존재할 경우, 단일 네트워크로 돌아감.
            if(combination_network){
                graphClear();
                // load other network
                currentName = targetName;
                pathName = currentName + "_network.json";
                $("#current_network").html(currentName);
                AjaxFileRead(pathName);


                // 조합 중 현재 타입과 반대되는 타입 이미지 활성화.
                // 후보자->후보자 혹은 후보자+커뮤니티->후보자 인경우 커뮤니티 버튼 색 활성화, and vice versa
                if(rootType == "candidate")     $('img.network_btn[type="community"]').css('filter', 'grayscale(0)');
                else                            $('img.network_btn[type="candidate"]').css('filter', 'grayscale(0)');

                // combination 초기화
                combination_network = "";

            }
        }


    // rootType 클릭으로 current name이 초기화 된 상태에서 클릭되었을 경우.
    }else{

        currentName = $(this).attr("name");

        // target을 제외한 이미지 inactive
        $('img.network_btn[type='+rootType+']').css('filter', 'grayscale(100%)');
        // target 에 대한 이미지 active
        $('img[name='+currentName+']').css('filter', 'grayscale(0)')

        // 반대 type 이미지 active
        if(rootType == "candidate")     $('img.network_btn[type="community"]').css('filter', 'grayscale(0)');
        else                            $('img.network_btn[type="candidate"]').css('filter', 'grayscale(0)');

        graphClear();
        // load other network
        pathName = currentName + "_network.json";
        $("#current_network").html(currentName);
        AjaxFileRead(pathName);

        // combination 초기화
        combination_network = "";

    }


});

function twosteps_network(current, target){

    var target_combi;
    // 파일명은 항상 후보+커뮤니티_network (커뮤니티+후보_network 형식 아님)
    if(rootType == "candidate")  target_combi = current + "+" + target;
    else    target_combi = target + "+" + current;

    if(target_combi == combination_network) return;


    // 반대 타입 이미지 active=> inactive
    if(rootType == "candidate")     $('img.network_btn[type="community"]').css('filter', 'grayscale(100%)');
    else                            $('img.network_btn[type="candidate"]').css('filter', 'grayscale(100%)');

    // combination 타겟 활성화
    $('img[name='+target+']').css('filter', 'grayscale(0)');


    combination_network = target_combi;

    console.log("Combination Network! current+target network: " + current + " + " + target);
    graphClear();

    pathName = combination_network + "_network.json";
    $("#current_network").html(combination_network);
    AjaxFileRead(pathName);

}



function graphClear(){
    // graph clear
    graph.clear();

    // label clear
    // renderer.clearHtmlLabels();
    renderer.clearThreeLabels();
    renderer.clearRemains();

    // set renderer as unstable to enable 3d force-atlas Layout
    renderer.stable(false);
}


// GUI open and close
$("#gui_control").click(function (data) {
    if(gui_open){
        gui.close();
        gui_open = false;
    }else{
        gui.open();
        gui_open = true;
    }
})

///
function renderNode(node) {
    if(node.data.activated) return{
        color: node.data.color,
        size: 10 + node.data.size * 0.5
    };

    return {
        color: node.data.color,
        size: 10 + node.data.size * 0.3
    };
}

function renderLink(link) {
    if(link.data.activated) return{
        fromColor: 0xFF0000,
        toColor: 0xFF0000
    };

    return {
        fromColor: link.data.fromColor,
        toColor: link.data.toColor
    };
}



// 노드 이벤트.
function showNodeDetails(node) {
    var nodeUI = renderer.getNode(node.id);
    // console.log(node);
    nodeSettings.setUI(nodeUI, node.data.label);
    // 네트워크 노드 틀릭시 차트 변경에 대한 이벤트, 지금은 쓰지않음.(현재 후보 클릭시 커뮤니티별 언급량 시각화로 대체) 2017.03.08
    // d3_ui.updateData(node.data.label);

}

function getNumber(string, defaultValue) {
    var number = parseFloat(string);
    return (typeof number === 'number') && !isNaN(number) ? number : (defaultValue || 10);
}

function initEventHandler() {

    renderer.on('nodeclick', showNodeDetails);
    renderer.on('nodedblclick', function(node) {
        // renderer.showNode(node.id, 300);
        renderer.showNodeTWEEN(node.id);
        renderer.setSelectedNode(node);
        // activeNeighbors(node);
        console.log(node);
        // console.log('Double clicked on ' + JSON.stringify(node));
    });

}



function activeNeighbors(node){
    links = node.links;

    node.links.forEach(function (link) {
        var linkUI = renderer.getLink(link.id);
        linkUI.fromColor = 0xFF0000;
        linkUI.toColor = 0xFF0000;

    })
}


// the function is to change rgb(r, g, b, alpha) to '0xrrggbb' format
function rgb2hex(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

    return (rgb && rgb.length === 4) ? "0x" +
        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}


renderer.on('nodehover', function(node) {
    // console.log('Hover node ' + JSON.stringify(node));
});



/*
 // chart안의 계열 클릭 이벤트.
 // d3 차트 라벨 클릭시 커뮤니티 네트웤으로 변경
 var two_steps_network = function(category_name) {

 // query_name == '불러올 파일 명'
 var query = currentName + "_network_" + cummunity_map[category_name];
 // currentName = currentName + "(" + category_name + ")";
 // console.log(query);

 graph.clear();
 renderer.clearHtmlLabels();
 // set renderer as unstable to enable 3d force-atlas Layout
 renderer.stable(false);

 pathName = "./data/" + query +".json";
 AjaxFileRead(pathName);

 $("#current_network").html(currentName + "(" + category_name + ")");
 renderer.autoFit();


 }

 module.exports.two_steps_network = two_steps_network;
 */



/*
// graph file load function using local fileSystem synchronously ( not recommend)
function filedRead() {
    var content = fs.readFileSync('./data/test2.json', 'utf8');
    graph.beginUpdate();
    JSON.parse(content)['nodes'].forEach(function (node) {
        graph.addNode(node.id, {
            label: node.label,
            color: Number(rgb2hex(node.color)),
            size: node.size,
            activated: false
        });
    });
    JSON.parse(content)['edges'].forEach(function (edge) {
        graph.addLink(edge.source, edge.target, {
            color: rgb2hex(edge.color),
            activated: false
        });
    });
    graph.endUpdate();
}
*/

// 테스트 셋(from gephi)용 파일호출 함수
// function AjaxFileRead(pathName) {
//     // $("#current_network").html(currentName);
//
//     http.get({path : "./data/" + pathName, json: true }, function (res) {
//         console.log("0. Load graph file start.");
//
//         var body = '';
//         res.on('data', function (buf) {
//             body += buf;
//         });
//         res.on('end', function () {
//             // Data reception is don, do whatever with it!
//             var parsed = JSON.parse(body);
//             console.log("1. Load the graph file completed.");
//             // console.log(parsed);
//
//             console.log("2. Start Initializing graph ");
//             graph.beginUpdate();
//             parsed['nodes'].forEach(function (node) {
//
//                 if(node.color){
//                     graph.addNode(node.id, {
//                         label: node.label,
//                         color: Number(rgb2hex(node.color)),
//                         size: node.size,
//                         activated: false
//                     });
//                 }else{
//                     graph.addNode(node.id, {
//                         label: node.label,
//                         color: Number(rgb2hex("rgb(194,245,91)")),
//                         size: 10,
//                         activated: false
//                     });
//                 }
//
//                 /*
//                  try{
//                  graph.addNode(node.id, {
//                  label: node.label,
//                  color: Number(rgb2hex(node.color)),
//                  size: node.size,
//                  activated: false
//                  });
//
//                  }catch (err) {
//                  graph.addNode(node.id, {
//                  label: node.label,
//                  color: "#8B008B",
//                  size: 10,
//                  activated: false
//                  });
//                  }
//                  */
//             });
//             parsed['edges'].forEach(function (edge) {
//
//                 if(edge.color){
//                     graph.addLink(edge.source, edge.target, {
//                         color: rgb2hex(edge.color),
//                         activated: false
//                     });
//                 }else{
//                     graph.addLink(edge.source, edge.target, {
//                         color: rgb2hex("rgb(158,158,198)"),
//                         activated: false
//                     });
//                 }
//                 /*
//                  try{
//                  graph.addLink(edge.source, edge.target, {
//                  color: rgb2hex(edge.color),
//                  activated: false
//                  });
//                  } catch (err) {
//                  graph.addLink(edge.source, edge.target, {
//                  color: "#222222",
//                  activated: false
//                  });
//                  }
//                  */
//
//             });
//             graph.endUpdate();
//
//             renderer.initLabels(degree = degreeThreshold_ToShowLabel);
//             console.log("3. Finished graph construct");
//
//             /*
//              // pass it as second argument to layout:
//              var layout = require('ngraph.forcelayout3d')(graph, physicsSettings);
//              for (var i =0; i < 500; ++i) {
//              layout.step();
//              console.log(i);
//              }
//              // layout.dispose();
//              */
//             console.log("4. stop the layout after loading the data");
//             window.setTimeout(function () {
//
//                 // fit the network with the screen automatically
//                 renderer.autoFit();
//                 // set the layout stable
//                 renderer.stable(true);
//
//             }, 5000);
//
// /*
//
//             // set the button activated
//             var temp = pathName.split("_")[0];
//             if(temp.includes("+")){
//                 temp = temp.split("+");
//                 $('img[name='+temp[0]+']').css('filter', 'grayscale(0)')
//                 $('img[name='+temp[1]+']').css('filter', 'grayscale(0)')
//             }else{
//                 $('img[name='+temp+']').css('filter', 'grayscale(0)')
//             }
//
// */
//
//
//
//         });
//     });
//
// }
