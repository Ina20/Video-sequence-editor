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
let filtersNames = ["trim", "join", "luminosity", "gamma", "brightness", "fade", "mirror", "loop", "rotate", "speed"];
let videoDuration = 0;
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



function openEditor(){
    //document.getElementById("uploadForm").submit();

    let file = document.getElementById("startUpload").files[0];

    document.body.style.backgroundImage = "linear-gradient(12deg, rgba(193, 193, 193,0.05) 0%, rgba(193, 193, 193,0.05) 2%,rgba(129, 129, 129,0.05) 2%, rgba(129, 129, 129,0.05) 27%,rgba(185, 185, 185,0.05) 27%, rgba(185, 185, 185,0.05) 66%,rgba(83, 83, 83,0.05) 66%, rgba(83, 83, 83,0.05) 100%),linear-gradient(321deg, rgba(240, 240, 240,0.05) 0%, rgba(240, 240, 240,0.05) 13%,rgba(231, 231, 231,0.05) 13%, rgba(231, 231, 231,0.05) 34%,rgba(139, 139, 139,0.05) 34%, rgba(139, 139, 139,0.05) 71%,rgba(112, 112, 112,0.05) 71%, rgba(112, 112, 112,0.05) 100%),linear-gradient(236deg, rgba(189, 189, 189,0.05) 0%, rgba(189, 189, 189,0.05) 47%,rgba(138, 138, 138,0.05) 47%, rgba(138, 138, 138,0.05) 58%,rgba(108, 108, 108,0.05) 58%, rgba(108, 108, 108,0.05) 85%,rgba(143, 143, 143,0.05) 85%, rgba(143, 143, 143,0.05) 100%),linear-gradient(96deg, rgba(53, 53, 53,0.05) 0%, rgba(53, 53, 53,0.05) 53%,rgba(44, 44, 44,0.05) 53%, rgba(44, 44, 44,0.05) 82%,rgba(77, 77, 77,0.05) 82%, rgba(77, 77, 77,0.05) 98%,rgba(8, 8, 8,0.05) 98%, rgba(8, 8, 8,0.05) 100%),linear-gradient(334deg, rgb(237,235,215),rgb(237,235,215))";

    console.log("Hello there!");
    document.getElementById("home").style.display = "none";
    document.getElementById("editor").style.display = "block";

    addVideo(file);
}

function addMoreVideo(){
    //document.getElementById("uploadForm2").submit();

    let file = document.getElementById("nextUpload").files[0];

    addVideo(file);
}

function addVideo(file) {

  let active = false;

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
              alert(data)
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
  fileDisplay.isTrimed = false;
  console.log(fileDisplay.isTrimed)
  fileDisplay.onclick = function() {
    console.log("children: " + document.getElementById("videoBar").childNodes.item(3).name);
    console.log("hello, i'm a video");
    console.log("name: " + file.name);
    console.log("duration: " + fileDisplay.duration);
    if(active) {
      fileDisplay.classList.remove("active");
      active = false;
      for(var i = 0; i < activeObjects.length; i++){
        if (activeObjects[i] === file.name || activeObjects[i] === "trim_" + file.name){
          activeObjects.splice(i, 1);
        }
      }
      document.querySelector("video").src = "./videos/" + activeObjects[activeObjects.length - 1];
      for(i=0; i<document.getElementById("videoBar").childNodes.length; i++){
        if(activeObjects[activeObjects.length - 1] == document.getElementById("videoBar").childNodes.item(i).name){
          videoDuration = document.getElementById("videoBar").childNodes.item(i).duration;
        }
      }
      console.log("vidDur: " + videoDuration);
      slider.setAttribute("max", Math.round(videoDuration));
      console.log("join: " + activeObjects);
    }else {
      videoDuration = fileDisplay.duration;
      fileDisplay.classList.add("active");
      active = true;
      console.log("join: " + activeObjects);
      slider.setAttribute("max", Math.round(videoDuration));
      if(!fileDisplay.isTrimed){
        document.querySelector("video").src = blobURL;
        activeObjects.push(file.name);
      }else {
        document.querySelector("video").src = "./videos/trim_" + file.name;
        activeObjects.push("trim_" + file.name);
      }
    }
    console.log("join active: " + activeObjects[activeObjects.length - 1])
    updateJoinList();
  }
}

$('.btn-group').on('click', '.subNavButton', function() {
  $(this).addClass('clicked').siblings().removeClass('clicked');
});

function toggleClick(id){
  console.log('Clicked!!');
  console.log('id: ' + id);
  //console.log(document.getElementById(id).classList[1]);
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

function join(){
  displayOptions("join");
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



socket.on('fromPythonTrim', (data) => {
  document.getElementById("loadingDiv").style.display = "none";
  console.log(data);
  let name = "trim_" + activeObjects[activeObjects.length - 1];
  let trimResult = "./videos/" + name;
  console.log("trimResult: " + trimResult);
  console.log("./videos/" + name);
  console.log("children: " + document.getElementById("videoBar").childNodes);

  for(i=0; i<document.getElementById("videoBar").childNodes.length; i++){
    console.log(i + " " + document.getElementById("videoBar").childNodes.item(i).name);
    if(activeObjects[activeObjects.length - 1] == document.getElementById("videoBar").childNodes.item(i).name){
      console.log("Found it! " + document.getElementById("videoBar").childNodes.item(i).name);
      document.getElementById("videoBar").childNodes.item(i).src = trimResult;
      document.getElementById("videoBar").childNodes.item(i).name = "trim_" + document.getElementById("videoBar").childNodes.item(i).name;
      document.querySelector("video").src = trimResult;
      document.getElementById("videoBar").childNodes.item(i).isTrimed = true;
    }
  }
});

socket.on('fromPythonJoin', (data) => {
  console.log("Hello after join");
  document.getElementById("loadingDiv").style.display = "none";
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
        if (activeObjects[i] === fileDisplay.name || activeObjects[i] === "trim_" + fileDisplay.name){
          activeObjects.splice(i, 1);
        }
      }
      document.querySelector("video").src = "./videos/" + activeObjects[activeObjects.length - 1];
      for(i=0; i<document.getElementById("videoBar").childNodes.length; i++){
        if(activeObjects[activeObjects.length - 1] == document.getElementById("videoBar").childNodes.item(i).name){
          videoDuration = document.getElementById("videoBar").childNodes.item(i).duration;
        }
      }
      console.log("vidDur: " + videoDuration);
      slider.setAttribute("max", Math.round(videoDuration));
      console.log("join: " + activeObjects);
    }else {
      videoDuration = fileDisplay.duration;
      fileDisplay.classList.add("active");
      active = true;
      console.log("join: " + activeObjects);
      slider.setAttribute("max", Math.round(videoDuration));
      if(!fileDisplay.isTrimed){
        document.querySelector("video").src = fileSrc;
        activeObjects.push(fileDisplay.name);
      }else {
        document.querySelector("video").src = "./videos/trim_" + fileDisplay.name;
        activeObjects.push("trim_" + fileDisplay.name);
      }
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
});


function displayOptions(option){
  for(i=0; i<filtersNames.length; i++){
    id = filtersNames[i] + "Options";
    document.getElementById(id).style.display = "none";
    if(filtersNames[i] == option){
      document.getElementById(id).style.display = "flex";
    }
  }
}

function replaceAfterFilter(filterName){
  console.log("Filter Here: " + filterName);
  document.getElementById("loadingDiv").style.display = "none";
  let active = false;
  if(filterName == "loop"){
    tmpName = activeObjects[activeObjects.length - 1];
    console.log(tmpName.substring(0,tmpName.lastIndexOf('.')));
    fileName = tmpName.substring(0,tmpName.lastIndexOf('.')) + '.gif';
    fileSrc = "./videos/" + fileName;
    console.log(fileSrc);
  }else {
    fileSrc = "./videos/" + filterName + '_' + activeObjects[activeObjects.length - 1];
  }
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
        if (activeObjects[i] === fileDisplay.name || activeObjects[i] === "trim_" + fileDisplay.name){
          activeObjects.splice(i, 1);
        }
      }
      document.querySelector("video").src = "./videos/" + activeObjects[activeObjects.length - 1];
      for(i=0; i<document.getElementById("videoBar").childNodes.length; i++){
        if(activeObjects[activeObjects.length - 1] == document.getElementById("videoBar").childNodes.item(i).name){
          videoDuration = document.getElementById("videoBar").childNodes.item(i).duration;
        }
      }
      slider.setAttribute("max", Math.round(videoDuration));
    }else {
      videoDuration = fileDisplay.duration;
      fileDisplay.classList.add("active");
      active = true;
      slider.setAttribute("max", Math.round(videoDuration));
      if(!fileDisplay.isTrimed){
        document.querySelector("video").src = fileSrc;
        activeObjects.push(fileDisplay.name);
      }else {
        document.querySelector("video").src = "./videos/trim_" + fileDisplay.name;
        activeObjects.push("trim_" + fileDisplay.name);
      }
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
}
function luminositySend(){
  name = activeObjects[activeObjects.length - 1];
  lumiBrightnessValue = document.getElementById("lumiBrightnessInput").value;
  lumiContrastValue = document.getElementById("lumiContrastInput").value;
  let data = {name: name, lbv: lumiBrightnessValue, lcv: lumiContrastValue};
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('luminosity', data);
}
socket.on('fromPythonLuminosity', (data) => {
  console.log("Hello after Luminosity");
  replaceAfterFilter('lm');
});

function gamma(){
  displayOptions("gamma");
}
function gammaSend(){
  name = activeObjects[activeObjects.length - 1];
  gammaValue = document.getElementById("gammaInput").value;
  let data = {name: name, gv: gammaValue};
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('gamma', data);
}
socket.on('fromPythonGamma', (data) => {
  console.log("Hello after Gamma");
  replaceAfterFilter('g');
});

function blackwhite(){
  name = activeObjects[activeObjects.length - 1];
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('blackwhite', name);
}
socket.on('fromPythonBlackWhite', (data) => {
  console.log("Hello after BlackAndWhite");
  replaceAfterFilter('bw');
});

function brightness(){
  displayOptions("brightness");
}
function brightnessSend(){
  name = activeObjects[activeObjects.length - 1];
  brightnessValue = document.getElementById("brightnessInput").value;
  let data = {name: name, bv: brightnessValue};
  console.log("brData: " + data.name + " " + data.bv);
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('brightness', data);
}
socket.on('fromPythonBrightness', (data) => {
  console.log("Hello after Brightness");
  replaceAfterFilter('br');
});

function fade(){
  displayOptions("fade");
}
function fadeSend(){
  name = activeObjects[activeObjects.length - 1];
  inOut = document.getElementsByClassName("active")[0].id;
  fadeDuration = document.getElementById("fadeInput").value;
  console.log(inOut);
  let data = {name: name, inOut: inOut, fd: fadeDuration};
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('fade', data);
}
socket.on('fromPythonFade', (data) => {
  console.log("Hello after Fade");
  replaceAfterFilter('f');
});

$('.btn-group').on('click', '.button', function() {
  $(this).addClass('active').siblings().removeClass('active');
});

function mirror(){
  displayOptions("mirror");
}
function mirrorSendX(){
  name = activeObjects[activeObjects.length - 1];
  let data = {name: name, xy: "X"};
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('mirror', data);
}
function mirrorSendY(){
  name = activeObjects[activeObjects.length - 1];
  let data = {name: name, xy: "Y"};
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('mirror', data);
}
socket.on('fromPythonMirror', (data) => {
  console.log("Hello after Mirror");
  replaceAfterFilter('m');
});

function loop(){
  displayOptions("loop");
}
function loopSend(){
  name = activeObjects[activeObjects.length - 1];
  timeStart = document.getElementById("timeStartInput").value;
  timeEnd = document.getElementById("timeEndInput").value;
  let data = {name: name, ts: timeStart, te: timeEnd};
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('loop', data);
}
socket.on('fromPythonLoop', (data) => {
  console.log("Hello after Loop");
  name = activeObjects[activeObjects.length - 1];
  console.log(name.substring(0,name.lastIndexOf('.')));
  replaceAfterFilter('loop');
});

function rotate(){
  displayOptions("rotate");
}
function rotateSend(){
  name = activeObjects[activeObjects.length - 1];
  rotateValue = document.getElementById("rotateInput").value;
  let data = {name: name, rv: rotateValue};
  console.log("angle: " + data.rv);
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('rotate', data);
}
socket.on('fromPythonRotate', (data) => {
  console.log("Hello after Rotate");
  replaceAfterFilter('r');
});

function backwards(){
  name = activeObjects[activeObjects.length - 1];
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('backwards', name);
}
socket.on('fromPythonBackwards', (data) => {
  console.log("Hello after Backwards");
  replaceAfterFilter('back');
});

function speed(){
  displayOptions("speed");
}
function speedSend(){
  name = activeObjects[activeObjects.length - 1];
  speedxValue = document.getElementById("speedxInput").value;
  //speedfinaldurValue = document.getElementById("speedfinaldurInput").value;
  let data = {name: name, sx: speedxValue/*, sfd: speedfinaldurValue*/};
  document.getElementById("loadingDiv").style.display = "flex";
  socket.emit('speed', data);
}
socket.on('fromPythonSpeed', (data) => {
  console.log("Hello after Speed");
  replaceAfterFilter('s');
});

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
