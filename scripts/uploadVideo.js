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
let videoDuration = 0;




function openEditor(){
    //document.getElementById("uploadForm").submit();

    let file = document.getElementById("startUpload").files[0];
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

    document.body.style.backgroundImage = "linear-gradient(12deg, rgba(193, 193, 193,0.05) 0%, rgba(193, 193, 193,0.05) 2%,rgba(129, 129, 129,0.05) 2%, rgba(129, 129, 129,0.05) 27%,rgba(185, 185, 185,0.05) 27%, rgba(185, 185, 185,0.05) 66%,rgba(83, 83, 83,0.05) 66%, rgba(83, 83, 83,0.05) 100%),linear-gradient(321deg, rgba(240, 240, 240,0.05) 0%, rgba(240, 240, 240,0.05) 13%,rgba(231, 231, 231,0.05) 13%, rgba(231, 231, 231,0.05) 34%,rgba(139, 139, 139,0.05) 34%, rgba(139, 139, 139,0.05) 71%,rgba(112, 112, 112,0.05) 71%, rgba(112, 112, 112,0.05) 100%),linear-gradient(236deg, rgba(189, 189, 189,0.05) 0%, rgba(189, 189, 189,0.05) 47%,rgba(138, 138, 138,0.05) 47%, rgba(138, 138, 138,0.05) 58%,rgba(108, 108, 108,0.05) 58%, rgba(108, 108, 108,0.05) 85%,rgba(143, 143, 143,0.05) 85%, rgba(143, 143, 143,0.05) 100%),linear-gradient(96deg, rgba(53, 53, 53,0.05) 0%, rgba(53, 53, 53,0.05) 53%,rgba(44, 44, 44,0.05) 53%, rgba(44, 44, 44,0.05) 82%,rgba(77, 77, 77,0.05) 82%, rgba(77, 77, 77,0.05) 98%,rgba(8, 8, 8,0.05) 98%, rgba(8, 8, 8,0.05) 100%),linear-gradient(334deg, rgb(237,235,215),rgb(237,235,215))";

    console.log("Hello there!");
    document.getElementById("home").style.display = "none";
    document.getElementById("editor").style.display = "block";
    console.log(file);

    let fileDisplay = document.createElement('video');
    fileDisplay.classList.add("fileListDisplay");
    document.getElementById("videoBar").appendChild(fileDisplay);
    let blobURL = URL.createObjectURL(file);
    console.log(blobURL);
    fileDisplay.src = blobURL;
    fileDisplay.onclick = function() {
      console.log("hello, i'm a video");
      console.log("name: " + file.name);
      console.log("duration: " + fileDisplay.duration);
      document.querySelector("video").src = blobURL;
      if(active) {
        fileDisplay.classList.remove("active");
        active = false;
      }else {
        fileDisplay.classList.add("active");
        active = true;
        trimObject = file;
        videoDuration = fileDisplay.duration;
      }
      console.log("trim active: " + trimObject.name);
    }

    /*
    let fileDisplay = document.createElement('div');
    fileDisplay.classList.add("fileListDisplay");
    document.getElementById("videoBar").appendChild(fileDisplay);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {

  }
      fileDisplay.style.backgroundImage = `url('${ reader.result }')`;
    };
    */
}
function addMoreVideo(){
    //document.getElementById("uploadForm2").submit();

    let file = document.getElementById("nextUpload").files[0];
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
    fileDisplay.onclick = function() {
      console.log("hello, i'm a video");
      console.log("name: " + file.name);
      console.log("duration: " + fileDisplay.duration);
      document.querySelector("video").src = blobURL;
      if(active) {
        fileDisplay.classList.remove("active");
        active = false;
      }else {
        fileDisplay.classList.add("active");
        active = true;
        trimObject = file;
        videoDuration = fileDisplay.duration;
      }
      console.log("trim active: " + trimObject.name);
    }

    /*
    let fileDisplay = document.createElement('div');
    fileDisplay.classList.add("fileListDisplay");
    document.getElementById("videoBar").appendChild(fileDisplay);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      fileDisplay.style.backgroundImage = `url('${ reader.result }')`;
    };
    */
}

var slider = new Slider('#timeSlider', {
    min: 0,
    max: 0,
    step: 1
  });

function trim(){
  let vid = document.getElementById("videoBar");
  console.log(videoDuration);

  data = trimObject.name;
  console.log("trim: " + data);

  slider.setAttribute("max", videoDuration);
  //socket.emit('trim', data);


 /*
  console.log("Cięcie");
  console.log(trimObject);
  trimObject.toJSON = function() { return {
       'lastModified'     : trimObject.lastModified,
       'lastModifiedDate' : trimObject.lastModifiedDate,
       'name'             : trimObject.name,
       'size'             : trimObject.size,
       'type'             : trimObject.type
    };}
    data = JSON.stringify(trimObject);
    console.log(data);
    */
  /*
  let trimObjectJSON = JSON.stringify(trimObject);
  console.log(trimObjectJSON);
  let data = trimObjectJSON;
  */
//  socket.emit('trim', data);
}

socket.on('fromPython', (data) => {
  console.log(data);
  console.log(JSON.parse(data));
});
