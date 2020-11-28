const express = require('express');
//const {spawn} = require('child_process');
const app = express();
const port = 3000;
const upload = require('express-fileupload');
var bodyParser = require('body-parser');
let http = require('http').Server(app);
let io = require('socket.io')(http);
let fs = require("fs");
const path = require('path');



let fromPython = '';
//let arg1 = 'Hello';
let dir = './videos';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.use(express.static(__dirname + '/scripts'));
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/videos', express.static(__dirname + '/videos'));

app.use(upload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  console.log("statusCode: ", res.statusCode);
});

app.post('/upload', (req, res) => {
  console.log("halfsuccess");
  if(req.files) {
    console.log(req.files);
    var file = req.files.myVideo;
    var filename = file.name;
    console.log(filename);

     //save file
    file.mv('./videos/' + filename, function (err) {
      if(err) {
        res.send(err);
      }else {
        res.send("File Uploaded");
        console.log("success");
      }
    })

  }
});

io.on("connection", (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('disconnect!!!');
    fs.readdir('./videos', (err, files) => {
      if (err) {
        throw err;
      }
      for (const file of files) {
        fs.unlink(path.join('./videos', file), err => {
          if (err) throw err;
        });
      }
    });
  })

  socket.on('toPython', (data) => {
    console.log('Hello from serwer');
    console.log(data);
    console.log(data.Fname);
    Fname = data.Fname;
    data = JSON.stringify(data);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", Fname, data]);
    pythonProcess.stdout.on('data', (data) => {
      data = data.toString().split(/\r?\n/);
      console.log(data);
      ok = data[data.length-2].split('_')[1];
      console.log(ok);

      FnameCapitalize = Fname.charAt(0).toUpperCase() + Fname.slice(1);

      socket.emit('fromPython' + FnameCapitalize, ok);
      socket.emit('fromPython', 'OK');
    });
  });


  socket.on('join', (data) => {
    console.log("joinFromServer: " + data);
    console.log(data[0]);
    console.log(data[1]);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "join", data]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      data = data.toString().split(/\r?\n/);
      console.log(data);
      ok = data[data.length-2].split('_')[1];
      console.log(ok);

      socket.emit('fromPythonJoin', ok);
    });
  });

  socket.on('loop', (data) => {
    console.log("loopFromServer: " + data);
    name = data.name;
    ts = data.ts;
    te = data.te;
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "loop", name, ts, te]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      data = data.toString().split(/\r?\n/);
      console.log(data);
      ok = data[data.length-2].split('_')[1];
      console.log(ok);

      socket.emit('fromPythonLoop', ok);
      socket.emit('fromPython', 'OK');
    });
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
