(function() {
 var cvSize = 500;
 var scale = 1;
 var mode = "pencil";
 var isLeft = true,
 isDown = false;

 var mouse = {
   x: 0,
   y: 0
 };
 var curImg, lastX, lastY;

 //for change to the mode
 document.getElementById("controlPanel").addEventListener("click", function(e) {
   var target = e.target || e.srcElement;
   mode = target.id;
   e.stopPropagation();
 }, true);

 var cvs = document.getElementById("imgViewer");
 var ctx = cvs.getContext("2d");
 var cvsRect = cvs.getBoundingClientRect();
 var drawCvs = document.createElement("canvas");
 var drawCtx = drawCvs.getContext("2d");

 cvs.width = cvs.height = cvSize;
 drawCvs.width = drawCvs.height = cvSize;

 cvs.addEventListener("dragenter", dragenter, false);
 cvs.addEventListener("dragover", dragover, false);
 cvs.addEventListener("drop", drop, false);
 cvs.addEventListener("wheel", mousewheel);
 cvs.addEventListener("mousedown", mousedown, false);
 cvs.addEventListener("mousemove", mousemove, false);
 cvs.addEventListener("mouseup", mouseup, false);
 cvs.addEventListener("mouseout", mouseout, false);
 cvs.addEventListener("contextmenu", mouseright, false);

 function dragenter(e) {
   e.stopPropagation();
   e.preventDefault();
 }

 function dragover(e) {
   e.stopPropagation();
   e.preventDefault();
 }

 function drop(e) {
   e.stopPropagation();
   e.preventDefault();

   var transfer = e.dataTransfer;
   var files = transfer.files;

   handleFiles(files);
 }

 function handleFiles(files) {
   for(var i=0; i< files.length; i++) {
    var file = files[i];

    if(!file.type.match(/image.*/)){
     continue;
    }

    curImg = document.createElement("img");
    curImg.file = file;

    var reader = new FileReader();
    reader.onload = (function(rImg) {
     return function(e) {
      rImg.onload = function(){
       ctx.drawImage(rImg, 0, 0, cvSize, cvSize);
       updateDrawCanvas();
      }
      rImg.src = e.target.result;
     };
    })(curImg);
    reader.readAsDataURL(file);
   }
 }

 function mousewheel(e) {
   if(curImg==null) return;

   var wheel = e.wheelDelta/120;
   var zoom = Math.pow(1 + Math.abs(wheel)/2 , wheel > 0 ? 1 : -1);
   scale *= zoom;

   updateDrawCanvas();
 }

 function brighten(adjustment) {
   var imgData = ctx.getImageData(0,0,cvs.width,cvs.height);
   for (var i=0; i<imgData.data.length; i+=4) {
    imgData.data[i] += adjustment;
    imgData.data[i+1] += adjustment;
    imgData.data[i+2] += adjustment;
   }
   ctx.putImageData(imgData,0,0);
 }

 function getCoords(e) {
   mouse.x = e.clientX || e.pageX || 0;
   mouse.y = e.clientY || e.pageY || 0;
   mouse.x -= cvsRect.left;
   mouse.y -= cvsRect.top;
   mouse.x = cvSize*0.5 + (mouse.x - cvSize*0.5)/scale;
   mouse.y = cvSize*0.5 + (mouse.y - cvSize*0.5)/scale;
 }

 function updateDrawCanvas() {
   ctx.clearRect(0, 0, cvs.width, cvs.height);
   if(curImg!=null){
    ctx.save();
    ctx.translate(cvSize*0.5, cvSize*0.5);
    ctx.scale(scale, scale);
    ctx.drawImage(curImg, -cvSize*0.5, -cvSize*0.5, cvSize, cvSize);
    ctx.restore();
   }

   ctx.save();
   ctx.translate(cvSize*0.5, cvSize*0.5);
   ctx.scale(scale, scale);
   ctx.drawImage(drawCvs, -cvSize*0.5, -cvSize*0.5);
   ctx.restore();
 }

 function mousedown(e) {
   if(e.which===3) {
    isLeft = false;
   } else {
    isLeft = true;
   }

   isDown = true;
   getCoords(e);
   drawCtx.save();
   drawCtx.strokeStyle = "#ff0000";
   drawCtx.lineWidth = 5;
   drawCtx.beginPath();
   drawCtx.moveTo(mouse.x, mouse.y);

   lastX = mouse.x;
   lastY = mouse.y;

   updateDrawCanvas();
 }

 function mousemove(e) {
   getCoords(e);

   if(isDown) {
    if(isLeft){
     if(mode=="pencil"){
      drawCtx.globalCompositeOperation="source-over";
      drawCtx.lineTo(mouse.x,mouse.y);
      drawCtx.stroke();
     } else {
      drawCtx.globalCompositeOperation="destination-out";
      drawCtx.arc(lastX,lastY,15,0,Math.PI*2,false);
      drawCtx.fill();
     }
     lastX = mouse.x;
     lastY = mouse.y;

     updateDrawCanvas();
    } else {
     var depth = (lastY-mouse.y)*2;
     brighten(depth);
     lastX = mouse.x;
     lastY = mouse.y;
    }
   }
 }

 function mouseup(e) {
   isDown = false;
   drawCtx.restore();

   if(isLeft){
    updateDrawCanvas();
   }
 }

 function mouseout(e) {
   isDown = false;
 }

 function mouseright(e) {
   if(e.which == 3){
    e.preventDefault();
   }
 }
}());