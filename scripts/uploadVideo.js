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
let trimObject;
let joinObject = [];
let videoDuration = 0;
var slider = new Slider('#timeSlider', {
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
      for(var i = 0; i < joinObject.length; i++){
        if (joinObject[i] === file.name || joinObject[i] === "trim_" + file.name){
          joinObject.splice(i, 1);
        }
      }
      console.log("join: " + joinObject);
    }else {
      videoDuration = fileDisplay.duration;
      fileDisplay.classList.add("active");
      active = true;
      trimObject = file;
      console.log("join: " + joinObject);
      slider.setAttribute("max", Math.round(videoDuration));
      if(!fileDisplay.isTrimed){
        document.querySelector("video").src = blobURL;
        joinObject.push(file.name);
      }else {
        document.querySelector("video").src = "./videos/trim_" + file.name;
        joinObject.push("trim_" + file.name);
      }
    }
    console.log("trim active: " + trimObject.name);
    updateJoinList();
  }
}

function trim(){
  let vid = document.getElementById("videoBar");
  document.getElementById("trimOptions").style.display = "flex";
  document.getElementById("joinOptions").style.display = "none";
  slider.setAttribute("max", Math.round(videoDuration));
}

function trimSend(){
  name = trimObject.name;
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
  document.getElementById("joinOptions").style.display = "flex";
  document.getElementById("trimOptions").style.display = "none";
  updateJoinList();
  console.log("join click: " + joinObject);
}

function joinSend(){
  socket.emit('join', joinObject);
}

function updateJoinList(){
  document.getElementById("joinVideoList").innerHTML = "";
  for(i=0; i<joinObject.length; i++){
    var li = document.createElement("LI");
    console.log("li: " + joinObject[i].substring(joinObject[i].indexOf("s/") + 1));
    li.appendChild(document.createTextNode(joinObject[i].substring(joinObject[i].indexOf("s/") + 1)));
    document.getElementById("joinVideoList").appendChild(li);
  }
}

socket.on('fromPythonTrim', (data) => {
  console.log(data);
  let name = "trim_" + trimObject.name;
  let trimResult = "./videos/" + name;
  console.log("trimResult: " + trimResult);
  console.log("./videos/" + name);
  console.log("children: " + document.getElementById("videoBar").childNodes);

  for(i=0; i<document.getElementById("videoBar").childNodes.length; i++){
    console.log(i + " " + document.getElementById("videoBar").childNodes.item(i).name);
    if(trimObject.name == document.getElementById("videoBar").childNodes.item(i).name){
      console.log("Found it! " + document.getElementById("videoBar").childNodes.item(i).name);
      document.getElementById("videoBar").childNodes.item(i).src = trimResult;
      document.querySelector("video").src = trimResult;
      document.getElementById("videoBar").childNodes.item(i).isTrimed = true;
    }
  }
});

socket.on('fromPythonJoin', (data) => {
  let active = false;
  console.log('fromPythonJoin: ' + data);
  fileSrc = "./videos/join_" + joinObject[0];
  let fileDisplay = document.createElement('video');
  fileDisplay.classList.add("fileListDisplay");
  document.getElementById("videoBar").appendChild(fileDisplay);
  fileDisplay.src = fileSrc;
  fileDisplay.name = "join_" + joinObject[0];
  fileDisplay.onclick = function() {
    console.log("hello, i'm a video");
    console.log("duration: " + fileDisplay.duration);
    if(active) {
      fileDisplay.classList.remove("active");
      active = false;
      for(var i = 0; i < joinObject.length; i++){
        console.log("for, " + joinObject[i] + ", " + fileDisplay.name);
        if (joinObject[i] === fileDisplay.name || joinObject[i] === "trim_" + fileDisplay.name){
          joinObject.splice(i, 1);
        }
      }
      console.log("join: " + joinObject);
    }else {
      videoDuration = fileDisplay.duration;
      fileDisplay.classList.add("active");
      active = true;
      trimObject = fileDisplay;
      trimObject.name = fileDisplay.name;
      console.log("join: " + joinObject);
      slider.setAttribute("max", Math.round(videoDuration));
      if(!fileDisplay.isTrimed){
        document.querySelector("video").src = fileSrc;
        joinObject.push(fileDisplay.name);
      }else {
        document.querySelector("video").src = "./videos/trim_" + fileDisplay.name;
        joinObject.push("trim_" + fileDisplay.name);
      }
    }
    console.log("trim active: " + trimObject.name);
    updateJoinList();
  }
});
