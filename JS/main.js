var divID_main = "board";
var restartQuery="RESTART NOW?";
var timeStart; var timeEnd;
function initMain() {  
    mainHTMLElementBoard = document.getElementById(divID_main);
    var drawCanvasWidth = parseFloat(getComputedStyle(mainHTMLElementBoard, null).width.replace("px", ""));
    var drawCanvasHeight = parseFloat(getComputedStyle(mainHTMLElementBoard, null).height.replace("px", ""));    
    var leafCount = getRandomIntBetween(100,250);
    //leafCount = 0;
    console.log(leafCount);
    for(var i=0; i<leafCount; i++) {
       var kindOfLeaf = getRandomIntBetween(1,6);
       var wdthLeaf = getRandomIntBetween(50,100);
       var hghtLeaf = wdthLeaf;
       var XCoord = getRandomIntBetween(0, drawCanvasWidth-wdthLeaf);
       var YCoord = getRandomIntBetween(0, drawCanvasHeight-hghtLeaf);
       var rotationDegrees = getRandomIntBetween(1,359);
       addLeafRandomly(XCoord, YCoord, wdthLeaf, hghtLeaf, mainHTMLElementBoard,i,kindOfLeaf,rotationDegrees);
    }
    timeStart = Date.now();
}
// ===== USEFUL ROUTINES =====
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  function getRandomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

function setWidth(el, val) {
    if (typeof val === "function") val = val();
    if (typeof val === "string") el.style.width = val;
    else el.style.width = val + "px";
}
// convert ms value to hours, minutes, seconds
// https://stackoverflow.com/questions/21294302/converting-milliseconds-to-minutes-and-seconds-with-javascript
function getTimeDifference(ms) {
  var d = new Date(1000*Math.round(ms/1000)); // round to nearest second
  function pad(i) { return ('0'+i).slice(-2); }
  var str = d.getUTCHours() + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
  return str;
}
// =========================

/// Add leaf randomly
/// xPosition, yPosition - left and right offset of upper left point, assuming position:absolute. Integer.
/// inWdth, inHght - width and height, for transformation
/// elementToAdd - root DOM element for adding
/// indexIndex - ID of leaf
/// inKindOfLeaf - ordinal number, kind of leaf (1 to 5, by now: leaf1 ... leaf5)
/// inDegrees - rotation degrees 
function addLeafRandomly(xPosition, yPosition, inWdth, inHght, elementToAdd, indexIndex, inKindOfLeaf, inDegrees) {
  var obj = document.createElement('object');
  obj.setAttribute("type", "image/svg+xml");
  obj.setAttribute("data","CONTENTFINAL/leaf"+inKindOfLeaf.toString()+".svg");
  obj.setAttribute("width",inWdth.toString());
  obj.setAttribute("height",inHght.toString());
  var used_xPosition=xPosition; var used_yPosition=yPosition;
  obj.setAttribute("style","position: absolute; top: "+yPosition.toString()+"px; left:"+xPosition.toString()+"px;"+
  "transform: rotate("+inDegrees.toString()+"deg);")
  
  obj.setAttribute("id","leaf"+indexIndex.toString());
  elementToAdd.appendChild(obj);
}

function testClick(whatCatched) {
    // assume that whatCatched is a Window
    var theGraalID =whatCatched.frameElement.id;
    //console.log(theGraalID);
    document.getElementById(theGraalID).remove();    
    if (mainHTMLElementBoard.children.length == 0) { // nothing left, ask for restart
       var restartDivElement = document.createElement("div");
       restartDivElement.id = 'restart-main';
       mainHTMLElementBoard = document.getElementById(divID_main);
       var drawCanvasHeight = parseFloat(getComputedStyle(mainHTMLElementBoard, null).height.replace("px", "")); 
       var yPosition = drawCanvasHeight/2;
       restartDivElement.setAttribute("style","position: absolute; top: "+yPosition.toString()+"px; left:"+"0"+"px; width:100%");
       timeEnd = Date.now();
       var timetime= getTimeDifference(timeEnd-timeStart);
       restartDivElement.innerHTML+="<div class=\"restart-main-text\" style=\"color:darkgreen\">You managed to clean up all the leaves </div>";
       restartDivElement.innerHTML+="<div class=\"restart-main-text\" style=\"color:darkred\">"+timetime+"</div>";
       restartDivElement.innerHTML+="<div id=\"restart-main-btn\" onclick=\"restartMain()\">"+restartQuery+"</div>";
       mainHTMLElementBoard.appendChild(restartDivElement);
    }
}

function restartMain() {
    // div with ID restart-main must exist! Need to add check
    document.getElementById("restart-main").remove();
    initMain();
}