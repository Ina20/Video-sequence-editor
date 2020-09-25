const express = require('express');
//const {spawn} = require('child_process');
const app = express();
const port = 3000;
const upload = require('express-fileupload');
var bodyParser = require('body-parser');
let http = require('http').Server(app);
let io = require('socket.io')(http);
let fs = require("fs");


let fromPython = '';
//let arg1 = 'Hello';

app.use(express.static(__dirname + '/scripts'));
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/results', express.static(__dirname + '/results'));

app.use(upload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', (req, res) => {
  console.log("halfsuccess");
  if(req.files) {
    console.log(req.files);
    var file = req.files.myVideo;
    var filename = file.name;
    console.log(filename);


/*
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", toPython]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
    });
*/

     //save file
    file.mv('./uploads/' + filename, function (err) {
      if(err) {
        //res.send(err);
      }else {
        //res.send("File Uploaded");
        console.log("success");
      }
    })

  }
});

io.on("connection", (socket) => {
  console.log('a user connected');


  socket.on('trim', (data) => {
    let name = data.name;
    let t1 = data.t1;
    let t2 = data.t2;
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", name, t1, t2]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonTrim', data.toString());
    });

    /*
    let result = JSON.parse(data);
    console.log('result: ' + result.name);
    console.log('data: ' + data);
    arg1 = data;
    console.log("Hello from socket " + arg1.name);

      const spawn = require("child_process").spawn;

      const pythonProcess = spawn('python', ["./scripts/editVideo.py"]);

      pythonProcess.stdout.on('data', (data) => {
        // Do something with the data returned from python script
        fromPython = data.toString();
        console.log(fromPython);
        console.log(data.toString());

      });
      pythonProcess.stdout.on('end', () => {
        try {
          let fromPythonJSON = JSON.parse(fromPython);
          console.log("coming from python: " + fromPythonJSON.name);
          console.log(fromPython);
          socket.emit('fromPython', fromPython);
        } catch (e) {
          console.log(fromPython);
        }
      });
      pythonProcess.stdin.write(arg1);
      pythonProcess.stdin.end();

      */
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

/*
app.get('/', (req, res) => {
  var dataToSend;
  const python = spawn('python', ['./scripts/editVideo.py']);
  python.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...');
    dataToSend = data.toString();
  });
  python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    res.send(dataToSend)
  });
});
*/

//app.listen(port, () => console.log("App listening at http://localhost:3000"));
