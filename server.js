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

app.use(express.static(__dirname + '/scripts'));
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/videos', express.static(__dirname + '/videos'));

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
    file.mv('./videos/' + filename, function (err) {
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


  socket.on('trim', (data) => {
    let name = data.name;
    let t1 = data.t1;
    let t2 = data.t2;
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "trim", name, t1, t2]);
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

  socket.on('join', (data) => {
    console.log("joinFromServer: " + data);
    console.log(data[0]);
    console.log(data[1]);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "join", data]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonJoin', data.toString());
    });
  });

  socket.on('luminosity', (data) => {
    console.log("luminosityFromServer: " + data);
    name = data.name;
    lbv = data.lbv;
    lcv = data.lcv;
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "luminosity", name, lbv, lcv]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonLuminosity', data.toString());
    });
  });

  socket.on('gamma', (data) => {
    console.log("gammaFromServer: " + data);
    name = data.name;
    gv = data.gv;
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "gamma", name, gv]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonGamma', data.toString());
    });
  });

  socket.on('blackwhite', (data) => {
    console.log("blackWhiteFromServer: " + data);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "blackwhite", data]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonBlackWhite', data.toString());
    });
  });

  socket.on('brightness', (data) => {
    console.log("brightnessFromServer: " + data);
    let name = data.name;
    let bv = data.bv;
    console.log("server: " + name + " " + bv);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "brightness", name, bv]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonBrightness', data.toString());
    });
  });

  socket.on('fade', (data) => {
    console.log("fadeFromServer: " + data);
    let name = data.name;
    let inOut = data.inOut;
    let fd = data.fd;
    console.log(name + " " + inOut + " " + fd);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "fade", name, inOut, fd]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonFade', data.toString());
    });
  });

  socket.on('mirror', (data) => {
    console.log("mirrorFromServer: " + data);
    let name = data.name;
    let xy = data.xy;
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "mirror", name, xy]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonMirror', data.toString());
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
      console.log(data.toString());
      socket.emit('fromPythonLoop', data.toString());
    });
  });

  socket.on('rotate', (data) => {
    console.log("rotateFromServer: " + data);
    name = data.name;
    rv = data.rv;
    console.log("angle: " + rv);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "rotate", name, rv]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonRotate', data.toString());
    });
  });

  socket.on('backwards', (data) => {
    console.log("backwardsFromServer: " + data);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "backwards", data]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonBackwards', data.toString());
    });
  });

  socket.on('speed', (data) => {
    console.log("speedFromServer: " + data);
    name = data.name;
    sx = data.sx;
    //sfd = data.sfd;
    //console.log('name: ' + name + " sx: " + sx + " sfd: " + sfd);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python', ["./scripts/editVideo.py", "speed", name, sx]);
    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      console.log(data.toString());
      socket.emit('fromPythonSpeed', data.toString());
    });
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
