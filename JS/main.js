var divID_main = "board"
function initMain() {
    mainHTMLElementBoard = document.getElementById(divID_main);
    var drawCanvasWidth = parseFloat(getComputedStyle(mainHTMLElementBoard, null).width.replace("px", ""));
    var drawCanvasHeight = parseFloat(getComputedStyle(mainHTMLElementBoard, null).height.replace("px", ""));    
    var leafCount = getRandomIntBetween(20,200);
    //leafCount = 0;
    for(var i=0; i<leafCount; i++) {
       var kindOfLeaf = getRandomIntBetween(1,5);
       var wdthLeaf = getRandomIntBetween(50,100);
       var hghtLeaf = wdthLeaf;
       var XCoord = getRandomIntBetween(0, drawCanvasWidth-wdthLeaf);
       var YCoord = getRandomIntBetween(0, drawCanvasHeight-hghtLeaf);
       var rotationDegrees = getRandomIntBetween(1,359);
       addLeafRandomly(XCoord, YCoord, wdthLeaf, hghtLeaf, mainHTMLElementBoard,i,kindOfLeaf,rotationDegrees);
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

    console.log(whatCatched.frameElement.id);
}