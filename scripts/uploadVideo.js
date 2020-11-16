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
let filterList = [];
let videoDuration = 0;
let filterListLoop = 0;
let isList = false;
//Detail ID
let detailIDNumber = 0;
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
  document.getElementById("listButtons").style.display = "none";
  //console.log(document.getElementById(id).classList[1]);
  //document.getElementById('sideBar').style.display = "block";
  if(id == "editNavButton"){
    console.log('display edit');
    document.getElementById("editButtons").style.display = "flex";
    document.getElementById("editButtons2").style.display = "none";
    document.getElementById("editList").style.display = "none";
  }else if(id == "filtersNavButton"){
    console.log('display filter');
    document.getElementById("editButtons2").style.display = "flex";
    document.getElementById("editButtons").style.display = "none";
    document.getElementById("editList").style.display = "none";
  }else if(id == "listNavButton"){
    console.log('display list');
    document.getElementById("editList").style.display = "flex";
    document.getElementById("listButtons").style.display = "flex";
    document.getElementById("editButtons2").style.display = "none";
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
  let t1 = slider.getValue()[0];
  let t2 = slider.getValue()[1];
  let data = {name: "", t1: t1, t2: t2} ;
  return data;
}
socket.on('fromPythonTrim', (data) => {
  document.getElementById("loadingDiv").style.display = "none";

  if(data == "OK"){
    console.log('Hello after Trim!!!!');
    replaceAfterFilter('trim');
  }else{
    console.log("Oops, something went wrong");
    document.getElementById('thead').innerHTML = "Oops, something went wrong";
    $('.toast').toast('show');
  }
});

function join(){
  displayOptions("join");
  document.getElementById("addToListButton").style.display = "none";
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
  document.getElementById("addToListButton").style.display = "block";
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
  activeObjects.push(fileDisplay.name);
  console.log("aktywne teraz: " + activeObjects[activeObjects.length - 1]);
}

function luminosity(){
  displayOptions("luminosity");
  clicked = "luminosity";
}
function luminositySend(){
  let lumiBrightnessValue = luminositySlider.getValue();
  let lumiContrastValue = lumContrastSlider.getValue();
  let data = {name: "", lbv: lumiBrightnessValue, lcv: lumiContrastValue};
  return data;
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
  let gammaValue = gammaSlider.getValue();
  let data = {name: "", gv: gammaValue};
  return data;
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
  let name = activeObjects[activeObjects.length - 1];
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
  let brightnessValue = brightnessSlider.getValue();
  let data = {name: "", bv: brightnessValue};
  return data;
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
  let inOut;
  let fadeDuration = fadeInOutSlider.getValue();
  console.log("inout lenght: " + document.getElementsByClassName("clicked3").length);
  if(document.getElementsByClassName("clicked3").length == 0){
    document.getElementById("loadingDiv").style.display = "none";
    console.log("pusto inOut");
    document.getElementById('error').innerHTML = "No In/Out selected";
    document.getElementById('error').style.display = "block";
  }else{
    inOut = document.getElementsByClassName("clicked3")[0].id;
    document.getElementById('error').style.display = "none";
    let data = {name: "", inOut: inOut, fd: fadeDuration};
    return data;
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
  if(document.getElementsByClassName("clicked4").length == 0){
    document.getElementById("loadingDiv").style.display = "none";
    document.getElementById('error').innerHTML = "No direction selected";
    document.getElementById('error').style.display = "block";
  }else{
    mirrorXY = document.getElementsByClassName("clicked4")[0].id;
    console.log('xy: ' + mirrorXY);
    console.log(mirrorXY .split("mirror")[1]);
    xy = mirrorXY .split("mirror")[1]
    let data = {name: "", xy: xy};
    return data;
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
  rotateValue = rotateSlider.getValue();
  let data = {name: "", rv: rotateValue};
  return data;
  console.log("angle: " + data.rv);
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
  x1Value = cropXSlider.getValue()[0];
  x2Value = cropXSlider.getValue()[1];
  y1Value = cropYSlider.getValue()[0];
  y2Value = cropYSlider.getValue()[1];
  widthValue = document.getElementById("cropWidthInput").value;
  heightValue = document.getElementById("cropHeightInput").value;

  console.log('crop: ' + x1Value + " " + x2Value + " " + y1Value + " " + y2Value + " // " + widthValue + " " + heightValue);
  let data = {name: "", x1: x1Value, x2: x2Value, y1: y1Value, y2: y2Value, width: widthValue, height: heightValue};
  return data;
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
  speedxValue = document.getElementById("speedxInput").value;
  if(speedxValue == ""){
    document.getElementById("loadingDiv").style.display = "none";
    document.getElementById('speedErrorEmpty').innerHTML = "This field cannot be empty";
  }else{
    let data = {name: "", sx: speedxValue};
    document.getElementById('speedErrorEmpty').innerHTML = "";
    return data;
  }
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

function addToList(){
  console.log("Hello add to list: " + clicked);
  document.getElementById("emptyList").style.display = "none";
  let listElement;
  switch(clicked){
    case 'trim':
      listElement = trimSend();
      listElement.Fname = clicked;
      listElement.displayName = "Trim";
      filterList.push(listElement);
      break;
    case 'luminosity':
      listElement = luminositySend();
      listElement.Fname = clicked;
      listElement.displayName = "Luminosity-contrast Correction";
      filterList.push(listElement);
      break;
    case 'gamma':
      listElement = gammaSend();
      listElement.Fname = clicked;
      listElement.displayName = "Gamma correction";
      filterList.push(listElement);
      break;
    case 'blackwhite':
      listElement = {};
      listElement.Fname = clicked;
      listElement.displayName = "Black and white";
      filterList.push(listElement);
      break;
    case 'brightness':
      listElement = brightnessSend();
      listElement.Fname = clicked;
      listElement.displayName = "Brightness";
      filterList.push(listElement);
      break;
    case 'fade':
      listElement = fadeSend();
      listElement.Fname = clicked;
      listElement.displayName = "Fade";
      filterList.push(listElement);
      break;
    case 'mirror':
      listElement = mirrorSend();
      listElement.Fname = clicked;
      listElement.displayName = "Mirror";
      filterList.push(listElement);
      break;
    case 'loop':
      listElement = loopSend();
      listElement.Fname = clicked;
      filterList.push(listElement);
      break;
    case 'fps':
      listElement = fpsSend();
      listElement.Fname = clicked;
      listElement.displayName = "Change FPS";
      filterList.push(listElement);
      break;
    case 'rotate':
      listElement = rotateSend();
      listElement.Fname = clicked;
      listElement.displayName = "Rotate";
      filterList.push(listElement);
      break;
    case 'crop':
      listElement = cropSend();
      listElement.Fname = clicked;
      listElement.displayName = "Crop";
      filterList.push(listElement);
      break;
    case 'speed':
      listElement = speedSend();
      listElement.Fname = clicked;
      listElement.displayName = "Speed up";
      filterList.push(listElement);
      break;
  }


  console.log(filterList);
  let divMain = document.createElement("DIV");
  divMain.classList.add("listElements");
  divMain.setAttribute('data-toggle', 'collapse');
  divMain.innerHTML = listElement.displayName;
  document.getElementById("editList").appendChild(divMain);

  let divDetail = document.createElement("DIV");
  for(i=1; i<Object.values(listElement).length-2; i++){
    divDetail.innerHTML += "Value: " + Object.values(listElement)[i];
    divDetail.innerHTML += '<br/>'
  }
  divDetail.id = clicked + detailIDNumber;
  divDetail.classList.add("collapse");
  divDetail.classList.add("listElements");
  console.log(divDetail.id);
  document.getElementById("editList").appendChild(divDetail);

  let detailID = '#' + divDetail.id;
  divMain.setAttribute('data-target', detailID);

  detailIDNumber++;

}

function clearList() {
  filterList = [];
  console.log(filterList);
  const myNode = document.getElementById("editList");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }
  let p = document.createElement("P");
  p.id = "emptyList";
  p.innerHTML = "List is empty";
  document.getElementById("editList").appendChild(p);
  document.getElementById("emptyList").style.display = "block";
}

function apply(){
  isList = false;
  console.log("apply: " + clicked);
  let sendObject;
  if(activeObjects == ""){
    console.log('pusto');
    document.getElementById("error").innerHTML = "No video selected";
    document.getElementById("error").style.display = "block";
    console.log('active now: ' + activeObjects.length);
    //if(clicked == "join"){
    //  document.getElementById("errorNoVideo").innerHTML = "At least two videos must be selected";
    //}
  }else{
    document.getElementById("loadingDiv").style.display = "flex";
    switch(clicked){
      case 'trim':
        sendObject = trimSend();
        sendObject.name = activeObjects[activeObjects.length - 1];
        socket.emit('trim', sendObject);
        break;
      case 'join':
        joinSend();
        break;
      case 'luminosity':
        sendObject = luminositySend();
        sendObject.name = activeObjects[activeObjects.length - 1];
        socket.emit('luminosity', sendObject);
        break;
      case 'gamma':
        sendObject = gammaSend();
        sendObject.name = activeObjects[activeObjects.length - 1];
        socket.emit('gamma', sendObject);
        break;
      case 'blackwhite':
        blackwhiteSend();
        break;
      case 'brightness':
        sendObject = brightnessSend();
        sendObject.name = activeObjects[activeObjects.length - 1];
        socket.emit('brightness', sendObject);
        break;
      case 'fade':
        sendObject = fadeSend();
        sendObject.name = activeObjects[activeObjects.length - 1];
        socket.emit('fade', sendObject);
        break;
      case 'mirror':
        sendObject = mirrorSend();
        sendObject.name = activeObjects[activeObjects.length - 1];
        socket.emit('mirror', sendObject);
        break;
      case 'loop':
        loopSend();
        break;
      case 'fps':
        fpsSend();
        break;
      case 'rotate':
        sendObject = rotateSend();
        sendObject.name = activeObjects[activeObjects.length - 1];
        socket.emit('rotate', sendObject);
        break;
      case 'crop':
        sendObject = cropSend();
        sendObject.name = activeObjects[activeObjects.length - 1];
        socket.emit('crop', sendObject);
        break;
      case 'speed':
        sendObject = speedSend();
        sendObject.name = activeObjects[activeObjects.length - 1];
        socket.emit('speed', sendObject);
        break;
    }
  }
}

function applyList() {
  isList = true;
  console.log('Długosć na początku: ' + filterList.length);
  console.log('name: ' + activeObjects[activeObjects.length - 1]);
  if(filterList == ""){
    document.getElementById("error").innerHTML = "List is empty";
    document.getElementById("error").style.display = "block";
  }else if(activeObjects == ""){
    console.log("no video!!");
    document.getElementById("error").innerHTML = "No video selected";
    document.getElementById("error").style.display = "block";
  }else {
    document.getElementById("error").style.display = "none";
    document.getElementById("loadingDiv").style.display = "flex";
    console.log(filterList);
    console.log("!!!!START!!!!");
    console.log('name: ' + activeObjects[activeObjects.length - 1]);
    filterList[filterListLoop].name = activeObjects[activeObjects.length - 1];
    console.log(filterList[filterListLoop].Fname);
    socket.emit(filterList[filterListLoop].Fname, filterList[filterListLoop]);
  }
}
socket.on('fromPython', (data) => {
  if(isList == true){
    console.log('After Filter, Hello!!!!');
    console.log('Długosć: ' + filterListLoop + " " + filterList.length);
    filterListLoop++;
    if(filterListLoop < filterList.length){
      console.log('Długosć: ' + filterListLoop + " " + filterList.length);
      applyList();
    }else{
      console.log("!!!KONIEC!!!");
      document.getElementById("loadingDiv").style.display = "none";
      filterListLoop = 0;
    }
  }
});

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
