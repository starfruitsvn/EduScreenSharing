import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import path from 'path';
import bodyParser  from 'body-parser';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

//const port = 80;
const port = process.env.PORT || 3001;
const app = express();
const server = createServer(app); 
const io = new Server(server);

app.use(express.json());
   
// For serving static HTML files

app.use(bodyParser.urlencoded({extended: false}));



server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

const onlineServers = [];
const sockets = [];

io.on('connection', (client) => {
  console.log('a user connected');
  const sessionId = client.id;
  sockets.push(client)
  io.emit('welcome');

  client.on("test", () => {
    console.log("received test"); // not displayed
    io.emit("ok");
  })
  client.on('peerid', (data) => {
    console.log("received peerid = "+client.id);
    console.log(data)
    //client.broadcast.emit("get_pid",data);
	io.emit("get_pid",data);
  });

  client.on('joinroom', (data) => {
    console.log("received joinroom = "+client.id);
    console.log(data)
    /*
    client.username = data.username;
    client.room  = data.room;
    client.type = data.type;
    sockets.push(client)
    */
    data.id = sessionId;
    const hasSv = onlineServers.some(obj => obj.name === data.name);

    if (hasSv) {
      console.log('Mảng có chứa đối tượng JSON với thuộc tính name là John');
    } else {
      console.log('Mảng không chứa đối tượng JSON với thuộc tính name là John');
      onlineServers.push(data)
      


      client.join(data.room);
      console.log(`User joined room ${data.room}`);
      //client.emit('message', `You joined room ${room}`);
      //client.broadcast.to(room).emit('message', 'A new user has joined the room.');
      if (data.type === 'student')
        client.to(data.room).emit("add_mem",data);
    }
  });
  client.on('disconnect', (user) => {
      console.log("disconnect sessionId = "+sessionId)
      for (let i = 0; i < onlineServers.length; i++) {
        console.log("onlineServers id = "+onlineServers[i].id)
        if (onlineServers[i].id === sessionId) {
          client.to(onlineServers[i].room).emit("rem_mem",onlineServers[i]);
          onlineServers.splice(i, 1);
          break;
        }
      }
      for (let i = 0; i < sockets.length; i++) {
        if (sockets[i].id === sessionId) {
          sockets.splice(i, 1);
          break;
        }
      }

      console.log("disconnect onlineServers  len = "+onlineServers.length)
      console.log("disconnect sockets  len = "+sockets.length)
      //io.emit('win', onlineServers);
  });
});
app.get("/", (req, res) => res.type('html').send(html));

/*
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.type('html').send(html));

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
*/
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`
