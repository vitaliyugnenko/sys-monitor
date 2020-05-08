const path = require("path");
var WebSocketServer = require("websocket").server;
var http = require("http");
var express = require("express");
var app = express();
const os = require("os-utils");
var port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname + "/build/")));

console.log(__dirname);

var server = http.createServer(app);
server.listen(port, function () {
  console.log(new Date() + `Server is listening on port ${port}`);
});

let wsServer = new WebSocketServer({
  httpServer: server,
});

wsServer.on("request", function (request) {
  console.log(`${new Date()} Connection from origin ${request.origin}.`);

  let connection = request.accept(null, request.origin);

  console.log(`${new Date()} Connection accepted.`);

  let interval;

  connection.on("message", function (msg) {
    interval = setInterval(() => {
      let time = new Date();
      let timeParse = `${
        time.getHours() < 10 ? `0${time.getHours()}` : time.getHours()
      }:${
        time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()
      }:${
        time.getSeconds() < 10 ? `0${time.getSeconds()}` : time.getSeconds()
      }`;
      let parseDate = `${
        time.getDate() < 10 ? `0${time.getDate()}` : time.getDate()
      }:${
        time.getMonth() + 1 < 10
          ? `0${time.getMonth() + 1}`
          : time.getMonth() + 1
      }:${time.getFullYear()}`;

      os.cpuUsage(function (v) {
        connection.sendUTF(
          JSON.stringify({
            cpu: parseInt(v.toFixed(2).toString().slice(2)),
            mem:
              100 -
              parseInt(os.freememPercentage().toFixed(2).toString().slice(2)),
            totalMem: (parseInt(os.totalmem().toFixed()) / 1024).toFixed(2),
            freeMem: (parseInt(os.freemem().toFixed()) / 1024).toFixed(2),
            time: timeParse,
            date: parseDate,
          })
        );
      });
    }, 1000);
  });

  connection.on("close", function (connection) {
    console.log(`${new Date()} Peer disconnected.`);
    clearInterval(interval);
  });
});
