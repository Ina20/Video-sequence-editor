document.querySelectorAll(".drop-zone-input").forEach(inputElement => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", e => {
    inputElement.click();
  });

  inputElement.addEventListener("change", e => {
    if(inputElement.files.length) {
      //updateThumbnails(dropZoneElement, inputElement.files[0]);
    }
  });

  dropZoneElement.addEventListener("dragover", e => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone-over");
  });

  ["dragleave", "dragend"].forEach(type => {
    dropZoneElement.addEventListener(type, e => {
      dropZoneElement.classList.remove("drop-zone-over");
    });
  });

  dropZoneElement.addEventListener("drop", e => {
    e.preventDefault();
    //console.log(e.dataTransfer.files);

    if(e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      //console.log(inputElement.files);
      //updateThumbnails(dropZoneElement, e.dataTransfer.files[0]);
    }

    dropZoneElement.classList.remove("drop-zone-over");
  });
});

function updateThumbnails(dropZoneElement, file) {
  console.log(dropZoneElement);
  console.log(file);
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone-thumb");

  console.log(file);

  if(dropZoneElement.querySelector(".drop-zone-prompt")) {
    dropZoneElement.querySelector(".drop-zone-prompt").remove();
  }

  if(!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone-thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;
  if(file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${ reader.result }')`;
    };
  }else {
    thumbnailElement.style.backgroundImage = null;
  }
}

let socket = io();
let activeObjects = [];
let gifList = [];
let filtersNames = ["trim", "join", "luminosity", "gamma", "blackwhite", "brightness", "fade", "mirror", "loop", "fps", "rotate", "crop", "speed"];
let videoDuration = 0;
let clicked;
//for crop
let x1, x2, y1, y2;
let scaleX;
let scaleY;

var slider = new Slider('#timeSlider', {
    id: "slider",
    min: 0,
    max: 0,
    step: 1,
    formatter: function (value) {
      let val = Math.floor(value[0] / 60) + ":" + (value[0] % 60 ? value[0] % 60 : '00') + ',' + Math.floor(value[1] / 60) + ":" + (value[1] % 60 ? value[1] % 60 : '00');
      return val;
    }
});
var cropXSlider = new Slider('#cropxSlider', {
    id: "cxSlider",
    min: 0,
    max: 0,
    step: 1,
    formatter: function (value) {
      return value;
    }
});
var cropYSlider = new Slider('#cropySlider', {
    id: "cySlider",
    min: 0,
    max: 0,
    step: 1,
    orientation: 'vertical',
	  tooltip_position:'left',
    formatter: function (value) {
      return value;
    }
});
var GIFSlider = new Slider('#gifSlider', {
    id: "GIFSlider",
    min: 0,
    max: 0,
    step: 1,
    formatter: function (value) {
      let val = Math.floor(value[0] / 60) + ":" + (value[0] % 60 ? value[0] % 60 : '00') + ',' + Math.floor(value[1] / 60) + ":" + (value[1] % 60 ? value[1] % 60 : '00');
      return val;
    }
});
var luminositySlider = new Slider('#lumSlider', {
    id: "lSlider",
    formatter: function(value) {
      return value;
    },
    rangeHighlights: [{ "start": -255, "end": 255 }]
});
var lumContrastSlider = new Slider('#contrastSlider', {
    id: "cSlider",
    formatter: function(value) {
		  return value;
    },
    rangeHighlights: [{ "start": -1, "end": 1 }]
});
var gammaSlider = new Slider('#gamSlider', {
    id: "gSlider",
    formatter: function(value) {
		  return value;
    },
    rangeHighlights: [{ "start": 0, "end": 2 }]
});
var brightnessSlider = new Slider('#brightSlider', {
    id: "bSlider",
    formatter: function(value) {
		  return value;
    },
    rangeHighlights: [{ "start": 0, "end": 2 }]
});
var fadeInOutSlider = new Slider('#fadeSlider', {
    id: "fSlider",
    min: 0,
    max: 0,
    step: 1,
    formatter: function (value) {
      let val = Math.floor(value / 60) + ":" + (value % 60 ? value % 60 : '00');
      return val;
    }
});
var rotateSlider = new Slider('#rotSlider', {
    id: "rSlider",
    formatter: function (value) {
      return value + String.fromCharCode(176);
    }
});

document.getElementsByClassName("fa-spinner")[0].style.display = "none";

function openEditor(){
    //document.getElementById("uploadForm").submit();

    let file = document.getElementById("startUpload").files[0];

    document.body.style.backgroundImage = "linear-gradient(12deg, rgba(193, 193, 193,0.05) 0%, rgba(193, 193, 193,0.05) 2%,rgba(129, 129, 129,0.05) 2%, rgba(129, 129, 129,0.05) 27%,rgba(185, 185, 185,0.05) 27%, rgba(185, 185, 185,0.05) 66%,rgba(83, 83, 83,0.05) 66%, rgba(83, 83, 83,0.05) 100%),linear-gradient(334deg, rgba(240, 240, 240,0.05) 0%, rgba(240, 240, 240,0.05) 13%,rgba(231, 231, 231,0.05) 13%, rgba(231, 231, 231,0.05) 34%,rgba(139, 139, 139,0.05) 34%, rgba(139, 139, 139,0.05) 71%,rgba(112, 112, 112,0.05) 71%, rgba(112, 112, 112,0.05) 100%),linear-gradient(236deg, rgba(189, 189, 189,0.05) 0%, rgba(189, 189, 189,0.05) 47%,rgba(138, 138, 138,0.05) 47%, rgba(138, 138, 138,0.05) 58%,rgba(108, 108, 108,0.05) 58%, rgba(108, 108, 108,0.05) 85%,rgba(143, 143, 143,0.05) 85%, rgba(143, 143, 143,0.05) 100%),linear-gradient(96deg, rgba(53, 53, 53,0.05) 0%, rgba(53, 53, 53,0.05) 53%,rgba(44,44,44, 0.050980392156862744) 53%, rgba(44,44,44, 0.050980392156862744) 82%,rgba(77, 77, 77,0.05) 82%, rgba(77, 77, 77,0.05) 98%,rgba(8, 8, 8,0.05) 98%, rgba(8, 8, 8,0.05) 100%),linear-gradient(321deg, rgb(255,255,255),rgb(255,255,255))";

    //document.body.style.backgroundImage = "linear-gradient(12deg, rgba(193, 193, 193,0.05) 0%, rgba(193, 193, 193,0.05) 2%,rgba(129, 129, 129,0.05) 2%, rgba(129, 129, 129,0.05) 27%,rgba(185, 185, 185,0.05) 27%, rgba(185, 185, 185,0.05) 66%,rgba(83, 83, 83,0.05) 66%, rgba(83, 83, 83,0.05) 100%),linear-gradient(321deg, rgba(240, 240, 240,0.05) 0%, rgba(240, 240, 240,0.05) 13%,rgba(231, 231, 231,0.05) 13%, rgba(231, 231, 231,0.05) 34%,rgba(139, 139, 139,0.05) 34%, rgba(139, 139, 139,0.05) 71%,rgba(112, 112, 112,0.05) 71%, rgba(112, 112, 112,0.05) 100%),linear-gradient(236deg, rgba(189, 189, 189,0.05) 0%, rgba(189, 189, 189,0.05) 47%,rgba(138, 138, 138,0.05) 47%, rgba(138, 138, 138,0.05) 58%,rgba(108, 108, 108,0.05) 58%, rgba(108, 108, 108,0.05) 85%,rgba(143, 143, 143,0.05) 85%, rgba(143, 143, 143,0.05) 100%),linear-gradient(96deg, rgba(53, 53, 53,0.05) 0%, rgba(53, 53, 53,0.05) 53%,rgba(44, 44, 44,0.05) 53%, rgba(44, 44, 44,0.05) 82%,rgba(77, 77, 77,0.05) 82%, rgba(77, 77, 77,0.05) 98%,rgba(8, 8, 8,0.05) 98%, rgba(8, 8, 8,0.05) 100%),linear-gradient(334deg, rgb(237,235,215),rgb(237,235,215))";

    console.log("Hello there!");
    document.getElementById("home").style.display = "none";
    document.getElementById("editor").style.display = "block";

    if(file.type == "video/mp4"){
      addVideo(file);
    }else{
      console.log("błąd - zły format");
      document.getElementById('thead').innerHTML = "This format is not supported";
      $('.toast').toast('show');
    }
}

function addMoreVideo(){
    //document.getElementById("uploadForm2").submit();

    let file = document.getElementById("nextUpload").files[0];
    if(file.type == "video/mp4"){
      addVideo(file);
    }else{
      console.log("błąd - zły format");
      document.getElementById('thead').innerHTML = "This format is not supported";
      $('.toast').toast('show');
    }

}

function addVideo(file) {

  let active = false;
  let canUpload = true;

  console.log("new file name: " + file.name);

  for(i=3; i<document.getElementById("videoBar").childNodes.length; i++){
    console.log('Hello!!!');
    console.log(document.getElementById("videoBar").childNodes.item(i).name);
    if(document.getElementById("videoBar").childNodes.item(i).name == file.name){
      console.log('Hello2!!!');
      console.log(document.getElementById("videoBar").childNodes.item(i).name + " // " + file.name);
      console.log("This video already exist!!");
      canUpload = false;
    }
  }

  console.log("can upload or not: " + canUpload);

  if(canUpload){
    var data = new FormData();
    //data = document.getElementById("startUpload").files[0];
    data.append('myVideo', file)
    console.log(data);
        $.ajax({
            url: '/upload',
            method: 'POST',
            type: 'POST',
            cache: false,
            data: data,
            processData: false,
            contentType: false,
            success: function (data) {
                //alert(data)
                console.log(data);
            },
            //error: function (jqXHR, textStatus, err) {
            //    alert('text status ' + textStatus + ', err ' + err)
            //}
        });


    console.log(file);

    let fileDisplay = document.createElement('video');
    fileDisplay.classList.add("fileListDisplay");
    document.getElementById("videoBar").appendChild(fileDisplay);
    let blobURL = URL.createObjectURL(file);
    console.log(blobURL);
    fileDisplay.src = blobURL;
    console.log(fileDisplay.src);
    fileDisplay.name = file.name;
    fileDisplay.onclick = function() {
      console.log("children: " + document.getElementById("videoBar").childNodes.item(3).name);
      console.log("hello, i'm a video");
      console.log("name: " + file.name);
      console.log("duration: " + fileDisplay.duration);
      if(active) {
        fileDisplay.classList.remove("active");
        active = false;
        for(var i = 0; i < activeObjects.length; i++){
          if (activeObjects[i] === file.name){
            activeObjects.splice(i, 1);
          }
        }
        document.querySelector("video").src = "./videos/" + activeObjects[activeObjects.length - 1];
        for(i=0; i<document.getElementById("videoBar").childNodes.length; i++){
          if(activeObjects[activeObjects.length - 1] == document.getElementById("videoBar").childNodes.item(i).name){
            videoDuration = document.getElementById("videoBar").childNodes.item(i).duration;
            if(activeObjects.length > 0){
              vHeight = document.getElementById("videoBar").childNodes.item(i).videoHeight;
              vWidth = document.getElementById("videoBar").childNodes.item(i).videoWidth;
              console.log("dimensions: " + vWidth + " " + vHeight);
              document.getElementById("videoDimensions").innerHTML = vWidth + "x" + vHeight + "px";
              cropXSlider.setAttribute("max", vWidth);
              cropYSlider.setAttribute("max", vHeight);
              drawCanvas(vHeight, vWidth);
            }else{
              cropXSlider.setAttribute("max", 0);
              cropYSlider.setAttribute("max", 0);
              drawCanvas(0, 0);
            }
          }
        }
        console.log("vidDur: " + videoDuration);
        slider.setAttribute("max", Math.round(videoDuration));
        GIFSlider.setAttribute("max", Math.round(videoDuration));
        fadeInOutSlider.setAttribute("max", Math.round(videoDuration));
        console.log("join: " + activeObjects);
      }else {

        //vid = document.querySelector("video");
        vHeight = fileDisplay.videoHeight;
        vWidth = fileDisplay.videoWidth;
        console.log("dimensions: " + vWidth + " " + vHeight);
        document.getElementById("videoDimensions").innerHTML = vWidth + "x" + vHeight + "px";
        document.getElementById("error").style.display = "none";
        videoDuration = fileDisplay.duration;
        fileDisplay.classList.add("active");
        active = true;
        console.log("join: " + activeObjects);
        slider.setAttribute("max", Math.round(videoDuration));
        GIFSlider.setAttribute("max", Math.round(videoDuration));
        fadeInOutSlider.setAttribute("max", Math.round(videoDuration));
        cropXSlider.setAttribute("max", vWidth);
        cropYSlider.setAttribute("max", vHeight);
        drawCanvas(vHeight, vWidth);
        document.querySelector("video").src = blobURL;
        activeObjects.push(file.name);
      }
      console.log("join active: " + activeObjects[activeObjects.length - 1])
      updateJoinList();
    }
  }else{
    console.log("cannot upload file already exist :<");
    document.getElementById('thead').innerHTML = "Cannot upload file";
    $('.toast').toast('show');
  }
}

$('.btn-group').on('click', '.subNavButton', function() {
  $(this).addClass('clicked').siblings().removeClass('clicked');
});
$('.btn-group-sideBar').on('click', '.button', function() {
  $(this).addClass('clicked2').siblings().removeClass('clicked2');
});

function toggleClick(id){
  console.log('Clicked!!');
  console.log('id: ' + id);
  document.getElementById("optionsSideBar").style.display = "none";
  document.getElementById('optionsTxt').style.display = "none";
  document.getElementById('applyButton').style.display = "none";
  document.getElementById("error").style.display = "none";
  //console.log(document.getElementById(id).classList[1]);
  //document.getElementById('sideBar').style.display = "block";
  if(id == "editNavButton"){
    console.log('display edit');
    document.getElementById("editButtons").style.display = "flex";
    document.getElementById("editButtons2").style.display = "none";
  }else if(id == "filtersNavButton"){
    console.log('display filter');
    document.getElementById("editButtons2").style.display = "flex";
    document.getElementById("editButtons").style.display = "none";

  }
}



function trim(){
  let vid = document.getElementById("videoBar");
  displayOptions("trim");
  clicked = "trim";
  slider.setAttribute("max", Math.round(videoDuration));
}

function trimSend(){
  document.getElementById("loadingDiv").style.display = "flex";
  name = activeObjects[activeObjects.length - 1];
  let t1 = slider.getValue()[0];
  let t2 = slider.getValue()[1];
  console.log("trim: " + name + " " + t1 + " " + t2);
  //console.log("value: " + slider.getValue()[1])
  let data = {name: name, t1: t1, t2: t2} ;
  console.log(data);
  console.log(data.name);
  socket.emit('trim', data);
}
socket.on('fromPythonTrim', (data) => {
  document.getElementById("loadingDiv").style.display = "none";

  if(data == "OK"){
    replaceAfterFilter('trim');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }
});

function join(){
  displayOptions("join");
  clicked = "join";
  updateJoinList();
  console.log("join click: " + activeObjects);
}

function joinSend(){
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('join', activeObjects);
}

function updateJoinList(){
  document.getElementById("joinVideoList").innerHTML = "";
  for(i=0; i<activeObjects.length; i++){
    var li = document.createElement("LI");
    console.log("li: " + activeObjects[i].substring(activeObjects[i].indexOf("s/") + 1));
    li.appendChild(document.createTextNode(activeObjects[i].substring(activeObjects[i].indexOf("s/") + 1)));
    document.getElementById("joinVideoList").appendChild(li);
  }
}

socket.on('fromPythonJoin', (data) => {
  console.log("Hello after join");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    let active = false;
    console.log('fromPythonJoin: ' + data);
    fileSrc = "./videos/join_" + activeObjects[0];
    console.log("fileSRC: " + fileSrc);
    let fileDisplay = document.createElement('video');
    fileDisplay.classList.add("fileListDisplay");
    document.getElementById("videoBar").appendChild(fileDisplay);
    fileDisplay.src = fileSrc;
    fileDisplay.name = "join_" + activeObjects[0];
    fileDisplay.onclick = function() {
      console.log("hello, i'm a video");
      console.log("duration: " + fileDisplay.duration);
      if(active) {
        fileDisplay.classList.remove("active");
        active = false;
        for(var i = 0; i < activeObjects.length; i++){
          console.log("for, " + activeObjects[i] + ", " + fileDisplay.name);
          if (activeObjects[i] === fileDisplay.name){
            activeObjects.splice(i, 1);
          }
        }
        document.querySelector("video").src = "./videos/" + activeObjects[activeObjects.length - 1];
        for(i=0; i<document.getElementById("videoBar").childNodes.length; i++){
          if(activeObjects[activeObjects.length - 1] == document.getElementById("videoBar").childNodes.item(i).name){
            videoDuration = document.getElementById("videoBar").childNodes.item(i).duration;
            if(activeObjects.length > 0){
              vHeight = document.getElementById("videoBar").childNodes.item(i).videoHeight;
              vWidth = document.getElementById("videoBar").childNodes.item(i).videoWidth;
              console.log("dimensions: " + vWidth + " " + vHeight);
              document.getElementById("videoDimensions").innerHTML = vWidth + "x" + vHeight + "px";
              cropXSlider.setAttribute("max", vWidth);
              cropYSlider.setAttribute("max", vHeight);
              drawCanvas(vHeight, vWidth);
            }else{
              cropXSlider.setAttribute("max", 0);
              cropYSlider.setAttribute("max", 0);
              drawCanvas(0, 0);
            }
          }
        }
        console.log("vidDur: " + videoDuration);
        slider.setAttribute("max", Math.round(videoDuration));
        GIFSlider.setAttribute("max", Math.round(videoDuration));
        fadeInOutSlider.setAttribute("max", Math.round(videoDuration));
        console.log("join: " + activeObjects);
      }else {
        vHeight = fileDisplay.videoHeight;
        vWidth = fileDisplay.videoWidth;
        document.getElementById("videoDimensions").innerHTML = vWidth + "x" + vHeight + "px";
        document.getElementById("error").style.display = "none";
        videoDuration = fileDisplay.duration;
        fileDisplay.classList.add("active");
        active = true;
        console.log("join: " + activeObjects);
        slider.setAttribute("max", Math.round(videoDuration));
        GIFSlider.setAttribute("max", Math.round(videoDuration));
        fadeInOutSlider.setAttribute("max", Math.round(videoDuration));
        cropXSlider.setAttribute("max", vWidth);
        cropYSlider.setAttribute("max", vHeight);
        drawCanvas(vHeight, vWidth);
        document.querySelector("video").src = fileSrc;
        activeObjects.push(fileDisplay.name);
      }
      updateJoinList();
    }
    console.log("active " + activeObjects);
    for(j=0; j<activeObjects.length; j++){
      for(i=3; i<document.getElementById("videoBar").childNodes.length; i++){
        console.log("active before slice: " + activeObjects[j] + "/// " + document.getElementById("videoBar").childNodes.item(i).name);
        if(document.getElementById("videoBar").childNodes.item(i).name == activeObjects[j]){
          console.log("delete: " + document.getElementById("videoBar").childNodes.item(i).name + activeObjects[j])
          document.getElementById("videoBar").childNodes.item(i).classList.remove("active");
          activeObjects.splice(j, 1);
          console.log("active after slice: " + activeObjects);
          document.getElementById("videoBar").removeChild(document.getElementById("videoBar").childNodes.item(i));
          document.querySelector("video").src = "";
          updateJoinList();
          i--;
        }
      }
    }
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }
});

function loop(){
  displayOptions("loop");
  clicked = "loop";
  GIFSlider.setAttribute("max", Math.round(videoDuration));
}
function loopSend(){
  name = activeObjects[activeObjects.length - 1];
  timeStart = GIFSlider.getValue()[0];
  timeEnd = GIFSlider.getValue()[1];
  let data = {name: name, ts: timeStart, te: timeEnd};
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('loop', data);
}
socket.on('fromPythonLoop', (data) => {
  console.log("Hello after Loop");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    let active = false;
    let fileDisplay = document.createElement('IMG');
    fileDisplay.classList.add("fileListDisplay");
    document.getElementById("videoBar").appendChild(fileDisplay);

    name = activeObjects[activeObjects.length - 1];
    console.log("loop name: " + name);
    console.log(name.substring(0,name.lastIndexOf('.')));
    let gifName = name.substring(0,name.lastIndexOf('.')) + '.gif';
    let fileSrc = "./videos/" + gifName;
    console.log("fileSrc: " + fileSrc);
    gifList.push(gifName);

    fileDisplay.src = fileSrc;
    fileDisplay.onclick = function() {
      if(active){
        fileDisplay.classList.remove("active");
        active = false;
        document.getElementsByTagName("video")[0].style.display = "flex";
        document.getElementById('gifDisplay').style.display = "none";
        document.getElementById('gifDisplay').src = "";
      }else {
        fileDisplay.classList.add("active");
        active = true;
        document.getElementsByTagName("video")[0].style.display = "none";
        document.getElementById('gifDisplay').style.display = "block";
        console.log('gif fileSrc: ' + fileSrc);
        document.getElementById('gifDisplay').src = fileSrc;
      }
    }
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }


  //replaceAfterFilter('loop');
});

function fps(){
  displayOptions("fps");
  clicked = "fps";
}
function fpsSend(){
  name = activeObjects[activeObjects.length - 1];
  fpsValue = document.getElementById("fpsInput").value;
  console.log("fpsValue: " + fpsValue);
  if(fpsValue == ""){
    document.getElementById('fpsErrorEmpty').innerHTML = "This field cannot be empty";
  }else{
    let data = {name: name, fps: fpsValue};
    console.log("fps: " + data.fps);
    document.getElementById('fpsErrorEmpty').innerHTML = "";
    document.getElementById("loadingDiv").style.display = "flex";
    socket.emit('fps', data);
  }
  //speedfinaldurValue = document.getElementById("speedfinaldurInput").value;
}
socket.on('fromPythonFPS', (data) => {
  console.log("Hello after FPS");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('fps');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }
});


function displayOptions(option){
  document.getElementById('optionsTxt').style.display = "flex";
  document.getElementById('applyButton').style.display = "flex";
  document.getElementById("optionsSideBar").style.display = "block";
  document.getElementById("error").style.display = "none";
  for(i=0; i<filtersNames.length; i++){
    id = filtersNames[i] + "Options";
    document.getElementById(id).style.display = "none";
    if(filtersNames[i] == option){
      if(filtersNames[i] == "fade"){
        document.getElementById(id).style.display = "flex";
        document.getElementById('insideFadeOptions').style.display = "flex";
      }else {
        document.getElementById(id).style.display = "flex";
        document.getElementById('insideFadeOptions').style.display = "none";
      }
    }
  }
}

function replaceAfterFilter(filterName){
  console.log("Filter Here: " + filterName);
  document.getElementById("loadingDiv").style.display = "none";
  let active = false;
  let fileSrc = "./videos/" + filterName + '_' + activeObjects[activeObjects.length - 1];
  console.log("fileSRC: " + fileSrc);
  let fileDisplay = document.createElement('video');
  fileDisplay.classList.add("fileListDisplay");
  document.getElementById("videoBar").appendChild(fileDisplay);
  fileDisplay.src = fileSrc;
  fileDisplay.name = filterName + '_' + activeObjects[activeObjects.length - 1];
  fileDisplay.onclick = function() {
    if(active) {
      fileDisplay.classList.remove("active");
      active = false;
      for(var i = 0; i < activeObjects.length; i++){
        if (activeObjects[i] === fileDisplay.name){
          activeObjects.splice(i, 1);
        }
      }
      document.querySelector("video").src = "./videos/" + activeObjects[activeObjects.length - 1];
      for(i=0; i<document.getElementById("videoBar").childNodes.length; i++){
        if(activeObjects[activeObjects.length - 1] == document.getElementById("videoBar").childNodes.item(i).name){
          videoDuration = document.getElementById("videoBar").childNodes.item(i).duration;
          if(activeObjects.length > 0){
            vHeight = document.getElementById("videoBar").childNodes.item(i).videoHeight;
            vWidth = document.getElementById("videoBar").childNodes.item(i).videoWidth;
            console.log("dimensions: " + vWidth + " " + vHeight);
            document.getElementById("videoDimensions").innerHTML = vWidth + "x" + vHeight + "px";
            cropXSlider.setAttribute("max", vWidth);
            cropYSlider.setAttribute("max", vHeight);
            drawCanvas(vHeight, vWidth);
          }else{
            cropXSlider.setAttribute("max", 0);
            cropYSlider.setAttribute("max", 0);
            drawCanvas(0, 0);
          }
        }
      }
      slider.setAttribute("max", Math.round(videoDuration));
      GIFSlider.setAttribute("max", Math.round(videoDuration));
      fadeInOutSlider.setAttribute("max", Math.round(videoDuration));
    }else {
      vHeight = fileDisplay.videoHeight;
      vWidth = fileDisplay.videoWidth;
      document.getElementById("videoDimensions").innerHTML = vWidth + "x" + vHeight + "px";
      document.getElementById("error").style.display = "none";
      videoDuration = fileDisplay.duration;
      fileDisplay.classList.add("active");
      active = true;
      slider.setAttribute("max", Math.round(videoDuration));
      GIFSlider.setAttribute("max", Math.round(videoDuration));
      fadeInOutSlider.setAttribute("max", Math.round(videoDuration));
      cropXSlider.setAttribute("max", vWidth);
      cropYSlider.setAttribute("max", vHeight);
      drawCanvas(vHeight, vWidth);
      document.querySelector("video").src = fileSrc;
      activeObjects.push(fileDisplay.name);
    }
    updateJoinList();
  }
  for(i=3; i<document.getElementById("videoBar").childNodes.length; i++){
    if(document.getElementById("videoBar").childNodes.item(i).name == activeObjects[activeObjects.length - 1]){
      console.log(document.getElementById("videoBar").childNodes.item(i).name + " // " + activeObjects[activeObjects.length - 1])
      document.getElementById("videoBar").childNodes.item(i).classList.remove("active");
      activeObjects.splice((activeObjects.length - 1), 1);
      document.getElementById("videoBar").removeChild(document.getElementById("videoBar").childNodes.item(i));
      document.querySelector("video").src = "";
      updateJoinList();
      break;
    }
  }
}
function luminosity(){
  displayOptions("luminosity");
  clicked = "luminosity";
}
function luminositySend(){
  name = activeObjects[activeObjects.length - 1];
  lumiBrightnessValue = luminositySlider.getValue();
  lumiContrastValue = lumContrastSlider.getValue();
  console.log("slider from lum: " + lumiBrightnessValue + " / " + lumiContrastValue);
  let data = {name: name, lbv: lumiBrightnessValue, lcv: lumiContrastValue};
  console.log(data.lbv + " / " + data.lcv);
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('luminosity', data);
}
socket.on('fromPythonLuminosity', (data) => {
  console.log("Hello after Luminosity");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('lm');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }

});

function gamma(){
  displayOptions("gamma");
  clicked = "gamma";
}
function gammaSend(){
  name = activeObjects[activeObjects.length - 1];
  gammaValue = gammaSlider.getValue();
  let data = {name: name, gv: gammaValue};
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('gamma', data);
}
socket.on('fromPythonGamma', (data) => {
  console.log("Hello after Gamma");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('g');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }
});

function blackwhite(){
  displayOptions("blackwhite");
  clicked = "blackwhite";
}
function blackwhiteSend(){
  name = activeObjects[activeObjects.length - 1];
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('blackwhite', name);
}
socket.on('fromPythonBlackWhite', (data) => {
  console.log("Hello after BlackAndWhite");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('bw');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }

});

function brightness(){
  displayOptions("brightness");
  clicked = "brightness";
}
function brightnessSend(){
  name = activeObjects[activeObjects.length - 1];
  brightnessValue = brightnessSlider.getValue();
  let data = {name: name, bv: brightnessValue};
  console.log("brData: " + data.name + " " + data.bv);
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('brightness', data);
}
socket.on('fromPythonBrightness', (data) => {
  console.log("Hello after Brightness");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('br');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }

});

function fade(){
  displayOptions("fade");
  clicked = "fade";
  fadeInOutSlider.setAttribute("max", Math.round(videoDuration));
}
function fadeSend(){
  name = activeObjects[activeObjects.length - 1];
  let inOut;
  fadeDuration = fadeInOutSlider.getValue();
  console.log("inout lenght: " + document.getElementsByClassName("clicked3").length);
  if(document.getElementsByClassName("clicked3").length == 0){
    console.log("pusto inOut");
    document.getElementById('error').innerHTML = "No In/Out selected";
    document.getElementById('error').style.display = "block";
  }else{
    inOut = document.getElementsByClassName("clicked3")[0].id;
    document.getElementById('error').style.display = "none";
    let data = {name: name, inOut: inOut, fd: fadeDuration};
    document.getElementById("loadingDiv").style.display = "flex";
    socket.emit('fade', data);
  }
}
socket.on('fromPythonFade', (data) => {
  console.log("Hello after Fade");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('f');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }
});

$('.btn-group-fade').on('click', '.button', function() {
  $(this).addClass('clicked3').siblings().removeClass('clicked3');
  document.getElementById('error').style.display = "none";
});

function mirror(){
  displayOptions("mirror");
  clicked = "mirror";
}
function mirrorSend(){
  name = activeObjects[activeObjects.length - 1];
  if(document.getElementsByClassName("clicked4").length == 0){
    document.getElementById('error').innerHTML = "No direction selected";
    document.getElementById('error').style.display = "block";
  }else{
    mirrorXY = document.getElementsByClassName("clicked4")[0].id;
    console.log('xy: ' + mirrorXY);
    console.log(mirrorXY .split("mirror")[1]);
    xy = mirrorXY .split("mirror")[1]
    let data = {name: name, xy: xy};
    document.getElementById("loadingDiv").style.display = "flex";
    socket.emit('mirror', data);
  }
}

$('.btn-group-mirror').on('click', '.button', function() {
  $(this).addClass('clicked4').siblings().removeClass('clicked4');
  document.getElementById('error').style.display = "none";
});

socket.on('fromPythonMirror', (data) => {
  console.log("Hello after Mirror");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('m');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }

});

function rotate(){
  displayOptions("rotate");
  clicked = "rotate";
}
function rotateSend(){
  name = activeObjects[activeObjects.length - 1];
  rotateValue = rotateSlider.getValue();
  let data = {name: name, rv: rotateValue};
  console.log("angle: " + data.rv);
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('rotate', data);
}
socket.on('fromPythonRotate', (data) => {
  console.log("Hello after Rotate");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('r');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }

});

function crop(){
  displayOptions("crop");
  clicked = "crop";
  vid = document.querySelector("video");
  console.log('vid: ' + vid);
  vHeight = vid.videoHeight;
  vWidth = vid.videoWidth;
  drawCanvas(vHeight, vWidth);
/*  canvas = document.getElementById('cropCanvas');
  var ctx = canvas.getContext("2d");

  let x1, x2, y1, y2;
  let scaleX;
  let scaleY;

  vid = document.querySelector("video");
  console.log('vid: ' + vid);
  vHeight = vid.videoHeight;
  vWidth = vid.videoWidth;
  cropXSlider.setValue([0, vWidth]);
  cropYSlider.setValue([0, vHeight]);
  console.log('Dimensions: ' + vHeight + " " + vWidth);
  document.getElementById("videoDimensions").innerHTML = vWidth + "x" + vHeight + "px";
  ctx.fillStyle = "#5e2c49";
  scaleX = vWidth/225;
  scaleY = vHeight/125;
  x1 = 0;
  y1 = 0;
  x2 = vWidth/scaleX;
  y2 = vHeight/scaleY;
  ctx.fillRect(x1,y1,x2-x1,y2-y1);
  cropXSlider.on("slide", function(sliderValue) {
	   //console.log(sliderValue[0]);
     x1 = Math.round(sliderValue[0]/scaleX);
     x2 = Math.round(sliderValue[1]/scaleX);
     ctx.fillRect(x1,y1,x2-x1,y2-y1);
     ctx.clearRect(0,y1,x1,y2-y1);
     ctx.clearRect(x2,y1,225-x2,y2-y1);
  });
  cropYSlider.on("slide", function(sliderValue) {
	   //console.log(sliderValue[0]);
     y1 = Math.round(sliderValue[0]/scaleY);
     y2 = Math.round(sliderValue[1]/scaleY);
     ctx.fillRect(x1,y1,x2-x1,y2-y1);
     ctx.clearRect(x1,0,x2-x1,y1);
     ctx.clearRect(x1,y2,x2-x1,225-y2);
  }); */
}
function cropSend(){
  name = activeObjects[activeObjects.length - 1];
  x1Value = cropXSlider.getValue()[0];
  x2Value = cropXSlider.getValue()[1];
  y1Value = cropYSlider.getValue()[0];
  y2Value = cropYSlider.getValue()[1];
  widthValue = document.getElementById("cropWidthInput").value;
  heightValue = document.getElementById("cropHeightInput").value;
  //xcenterValue = document.getElementById("cropXcenterInput").value;
  //ycenterValue = document.getElementById("cropYcenterInput").value;

  console.log('crop: ' + x1Value + " " + x2Value + " " + y1Value + " " + y2Value + " // " + widthValue + " " + heightValue);

  let data = {name: name, x1: x1Value, x2: x2Value, y1: y1Value, y2: y2Value, width: widthValue, height: heightValue};
  console.log('crop data: ' + data.x1 + " " + data.x2 + " " + data.y1 + " " + data.y2);
  //document.getElementById('error').style.display = "none";
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('crop', data);

  //speedfinaldurValue = document.getElementById("speedfinaldurInput").value;
}
socket.on('fromPythonCrop', (data) => {
  console.log("Hello after Crop");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('c');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }
});

function speed(){
  displayOptions("speed");
  clicked = "speed";
}
function speedSend(){
  name = activeObjects[activeObjects.length - 1];
  speedxValue = document.getElementById("speedxInput").value;
  if(speedxValue == ""){
    document.getElementById('speedErrorEmpty').innerHTML = "This field cannot be empty";
  }else{
    let data = {name: name, sx: speedxValue/*, sfd: speedfinaldurValue*/};
    document.getElementById('speedErrorEmpty').innerHTML = "";
    document.getElementById("loadingDiv").style.display = "flex";
    socket.emit('speed', data);
  }
  //speedfinaldurValue = document.getElementById("speedfinaldurInput").value;
}
socket.on('fromPythonSpeed', (data) => {
  console.log("Hello after Speed");
  document.getElementById("loadingDiv").style.display = "none";
  if(data == "OK"){
    replaceAfterFilter('s');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }
});

function drawCanvas(height, width){
  canvas = document.getElementById('cropCanvas');
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,255,125);

  console.log('dimensions: ' + height + "x" + width);
  vHeight = height;
  vWidth = width;
  cropXSlider.setValue([0, vWidth]);
  cropYSlider.setValue([0, vHeight]);
  console.log('Dimensions: ' + vHeight + " " + vWidth);
  document.getElementById("videoDimensions").innerHTML = vWidth + "x" + vHeight + "px";
  ctx.fillStyle = "#5e2c49";
  scaleX = vWidth/225;
  scaleY = vHeight/125;
  x1 = 0;
  y1 = 0;
  x2 = vWidth/scaleX;
  y2 = vHeight/scaleY;
  ctx.fillRect(x1,y1,x2-x1,y2-y1);
  cropXSlider.on("slide", function(sliderValue) {
	   //console.log(sliderValue[0]);
     x1 = Math.round(sliderValue[0]/scaleX);
     x2 = Math.round(sliderValue[1]/scaleX);
     ctx.fillRect(x1,y1,x2-x1,y2-y1);
     ctx.clearRect(0,y1,x1,y2-y1);
     ctx.clearRect(x2,y1,225-x2,y2-y1);
  });
  cropYSlider.on("slide", function(sliderValue) {
	   //console.log(sliderValue[0]);
     y1 = Math.round(sliderValue[0]/scaleY);
     y2 = Math.round(sliderValue[1]/scaleY);
     ctx.fillRect(x1,y1,x2-x1,y2-y1);
     ctx.clearRect(x1,0,x2-x1,y1);
     ctx.clearRect(x1,y2,x2-x1,225-y2);
  });
}

function apply(){
  console.log("apply: " + clicked);
  if(activeObjects == ""){
    console.log('pusto');
    document.getElementById("error").innerHTML = "No video selected";
    document.getElementById("error").style.display = "block";
    console.log('active now: ' + activeObjects.length);
    //if(clicked == "join"){
    //  document.getElementById("errorNoVideo").innerHTML = "At least two videos must be selected";
    //}
  }else{
    switch(clicked){
      case 'trim':
        trimSend();
        console.log('Hello trim');
        break;
      case 'join':
        joinSend();
        break;
      case 'luminosity':
        luminositySend();
        break;
      case 'gamma':
        gammaSend();
        break;
      case 'blackwhite':
        blackwhiteSend();
        break;
      case 'brightness':
        brightnessSend();
        break;
      case 'fade':
        fadeSend();
        break;
      case 'mirror':
        mirrorSend();
        break;
      case 'loop':
        loopSend();
        break;
      case 'fps':
        fpsSend();
        break;
      case 'rotate':
        rotateSend();
        break;
      case 'crop':
        cropSend();
        break;
      case 'speed':
        speedSend();
        break;
    }
  }
}

function isNumberKey(evt){
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)){
	   return false;
  }
	return true;
}


function save(){
  console.log("Save click!");
  document.getElementsByClassName("fa-spinner")[0].style.display = "inline";

  zip = new JSZip();
  videoZip = zip.folder('Videos');
  count = 0;
  fileURL = [];
  for(i=3; i<document.getElementById("videoBar").childNodes.length; i++){
    console.log("forSave: " + document.getElementById("videoBar").childNodes.item(i).name)
    fileURL.push({url: "./videos/" + document.getElementById("videoBar").childNodes.item(i).name, name: document.getElementById("videoBar").childNodes.item(i).name});
  }
  console.log(fileURL[0].url);
  for (i=0; i<gifList.length; i++){
    console.log(gifList[i]);
    fileURL.push({url: "./videos/" + gifList[i], name: gifList[i]});
  }

  fileURL.forEach(function(url){
    console.log("url: " + url.url);
    let filename = url.name
    JSZipUtils.getBinaryContent(url.url, function (err, data) {
      if(err) {
        console.log(err); // or handle the error
      }
      videoZip.file(filename, data, {binary:true});
      count++;
      console.log("count: " + count);
      console.log("length: " + fileURL.length);
      if(count == fileURL.length){
        console.log("Hurray!");
        zip.generateAsync({type:"blob"}).then(function (blob) {
          console.log("Before Saved");
          saveAs(blob, "download.zip");
          console.log("Saved!!");
          document.getElementsByClassName("fa-spinner")[0].style.display = "none";
        }, function (err) {
          console.log(err);
        });
      }
    });
  })
}
