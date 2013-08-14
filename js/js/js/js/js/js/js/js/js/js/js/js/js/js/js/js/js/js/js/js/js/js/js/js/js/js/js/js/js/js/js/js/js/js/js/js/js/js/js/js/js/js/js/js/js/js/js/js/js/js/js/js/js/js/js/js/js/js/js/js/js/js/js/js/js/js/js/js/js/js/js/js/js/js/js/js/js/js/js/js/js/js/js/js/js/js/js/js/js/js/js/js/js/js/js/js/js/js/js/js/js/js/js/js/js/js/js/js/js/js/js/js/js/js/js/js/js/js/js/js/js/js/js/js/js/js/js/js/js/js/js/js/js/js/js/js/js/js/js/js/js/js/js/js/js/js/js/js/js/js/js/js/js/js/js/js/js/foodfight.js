
jQuery(document).ready(function() {

//var thisPageX = 0;
//var thisPageY = 0;
//var thisCanvas = document.getElementById("canvas");

//thisCanvas.addEventListener("touchmove", function(event) {
//  thisPageX = event.targetTouches[event.targetTouches.length - 1].pageX;
//  thisPageY = event.targetTouches[event.targetTouches.length - 1 ].pageY;
//  $('#comments').text(thisPageX + "," + thisPageY);
//}, false);


  //////////
  // Preload Images
  //////////

var preloadedImages = [];

function preloadImages() {
    for (var idx = 0; idx < arguments.length; idx++) {
        var oneImage = new Image()
        oneImage.src = arguments[idx];
        preloadedImages.push(oneImage);
    }
}

preloadImages(
    'foodfight2/assets/bread.png',
    'foodfight2/assets/cauliflower.png',
    'foodfight2/assets/carrot.png',
    'foodfight2/assets/apple.png',
    'foodfight2/assets/orange.png',
    'foodfight2/assets/milk.png',
    'foodfight2/assets/eggs.png',
    'foodfight2/assets/lime.png',
    'foodfight2/assets/celery.png',
    'foodfight2/assets/butter.png',
    'foodfight2/assets/cursor.png'

);


//  var image;
//  $(images).each(function(){
 //    image = $('<img />').attr('src',this)
//  });

//  var images = [
//    'foodfight2/assets/bread.png',
//    'foodfight2/assets/cauliflower.png',
//    'foodfight2/assets/carrot.png',
//    'foodfight2/assets/apple.png',
//    'foodfight2/assets/orange.png',
 //   'foodfight2/assets/milk.png',
 //   'foodfight2/assets/eggs.png',
  //  'foodfight2/assets/lime.png',
//    'foodfight2/assets/celery.png',
 //   'foodfight2/assets/butter.png',
//    'foodfight2/assets/cursor.png'
//  ];


  //////////
  // Canvas
  //////////
//400 300
  var CANVAS_WIDTH = 400, CANVAS_HEIGHT = 300, SCALE = 30;
  var context = document.getElementById("canvas").getContext("2d");
  var allDataDef = [];
  var allData = [];
  var mouseX, mouseY;
  var p = $("#canvas");
  var canvasPosition = p.position();
  var mouseDown = false;
  var playerId;
  var ms = 40;

  //////////////
  // SocketIO
  //////////////

  var socket = io.connect('http://remmler.org:60003');

  socket.on('Welcome', function(data) {
    socket.emit('All Ready');
  });


  socket.on('Initialize', function(data) {  
    // data is a list of [imageFileName, imageWidth, imageHeight]
    allDataDef = data.allDataDef;
    playerId = data.playerId;
    console.log("playerId " + playerId); 
 });
  
  socket.on('Update', function(data) {
    // data is a list of [x, y, angle]

    if (allDataDef != [])    {
      allData = data.allData;
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      for (i=0;i<allDataDef.length;i++) {
        var imgObj = new Image();
        imgObj.src = allDataDef[i][0];          
        context.save();
        context.translate(allData[i][0],allData[i][1]);
 	context.rotate(allData[i][2]);
	context.drawImage(imgObj,allDataDef[i][1],allDataDef[i][2]);
	context.restore();
      }
      for (i=10;i<allData.length;i++) {
        var imgObj = new Image();
        imgObj.src = '/foodfight2/assets/cursor.png';          
        context.save();
	context.translate(allData[i][0], allData[i][1]);
	context.drawImage(imgObj,-5,-5);
	context.restore();    
      }
    }
  });


  function mouseSend() {
    socket.emit('Mouse Move', { playerId:playerId, mouseX:mouseX, mouseY:mouseY, mouseDown:mouseDown});
  }
  
  $('#canvas').bind('mouseout', function(event) {
    mouseDown = false;
    mouseSend();
  });
  
$('#canvas').bind('mousedown touchstart', function(event) {    
 // $('#canvas').bind('mousedown', function(event) {
    mouseDown = true;
    mouseSend();
  });


  $('#canvas').bind('mouseup touchend', function(event) {
//  $('#canvas').bind('mouseup', function(event) {
mouseX = -5; mouseY = -5;
    mouseDown = false;
    mouseSend();
  });
  
  var last = (new Date()).getTime();
  $('#canvas').bind('mousemove', function(event) {  
    var now = (new Date()).getTime();
    if (now - last > ms) {
      last = now;
      mouseX = (event.pageX - canvasPosition.left) / SCALE;
      mouseY = (event.pageY - canvasPosition.top) / SCALE;
      if (mouseDown == true) {
        mouseSend();
      }

    }
  });

  $('#canvas').bind('touchmove',function (event) {
    var now = (new Date()).getTime();
    if (now - last > ms) {
      last = now;
      event.preventDefault();
      var orig = event.originalEvent;
      mouseX = (orig.touches[0].pageX - canvasPosition.left) / SCALE;
      mouseY = (-30 + orig.touches[0].pageY - canvasPosition.left) / SCALE;

 //     mouseX = (thisPageX - canvasPosition.left) / SCALE;
 //     mouseY = (thisPageY - canvasPosition.top) / SCALE;
      mouseSend();
    }
  });



});
