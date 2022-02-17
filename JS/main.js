var divID_main = "board"
function initMain() {
    mainHTMLElementBoard = document.getElementById(divID_main);
    var drawCanvasWidth = parseFloat(getComputedStyle(mainHTMLElementBoard, null).width.replace("px", ""));
    var drawCanvasHeight = parseFloat(getComputedStyle(mainHTMLElementBoard, null).height.replace("px", ""));    
    var leafCount = getRandomIntBetween(20,200);
    for(var i=0; i<leafCount; i++) {
       var XCoord = getRandomIntBetween(0, drawCanvasWidth-50);
       var YCoord = getRandomIntBetween(0, drawCanvasHeight-50);
       addLeafRandomly(YCoord, XCoord, mainHTMLElementBoard,i);
    }
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

function addLeafRandomly(xPosition, yPosition, elementToAdd, indexIndex) {
  var obj = document.createElement('object');
  obj.setAttribute("type", "image/svg+xml");
  obj.setAttribute("data","CONTENTFINAL/leaf1.svg");
  obj.setAttribute("width","50");
  obj.setAttribute("height","50");
  var used_xPosition=xPosition; var used_yPosition=yPosition;
  obj.setAttribute("style","position: absolute; top: "+xPosition.toString()+"px; left:"+yPosition.toString()+"px;")
  obj.setAttribute("id","leaf"+indexIndex.toString());
  elementToAdd.appendChild(obj);
}

function testClick(whatCatched) {
    // assume that whatCatched is a Window
    // console.log(whatCatched);
    //console.log(whatCatched.frameElement);
    console.log(whatCatched.frameElement.id);
}