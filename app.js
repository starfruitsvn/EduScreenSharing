const express = require("express");
const app = express();

let broadcaster;
const onlineServers = [];
const sockets = [];

const port = 3000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));


io.sockets.on("connection", socket => {
  const sessionId = socket.id;
  sockets.push(socket)
  io.emit('welcome');

  socket.on("test", () => {
    console.log("received test"); // not displayed
    io.emit("ok");
  })
  socket.on('peerid', (data) => {
    console.log("received peerid = "+socket.id);
    console.log(data)
    io.emit("get_pid",data);
  });

  socket.on('joinroom', (data) => {
    console.log("received joinroom = "+socket.id);
    console.log(data)
    
    data.id = sessionId;
    const hasSv = onlineServers.some(obj => obj.name === data.name);

    if (hasSv) {
      console.log('Mảng có chứa đối tượng JSON với thuộc tính name là John');
    } else {
      console.log('Mảng không chứa đối tượng JSON với thuộc tính name là John');
      onlineServers.push(data)
      


      socket.join(data.room);
      console.log(`User joined room ${data.room}`);
      //client.emit('message', `You joined room ${room}`);
      //client.broadcast.to(room).emit('message', 'A new user has joined the room.');
      if (data.type === 'student')
      {
        console.log("Send add_mem to "+data.room);
        socket.to(data.room).emit("add_mem",data);
      }
    }
  });
  socket.on('disconnect', (user) => {
      console.log("disconnect sessionId = "+sessionId)
      for (let i = 0; i < onlineServers.length; i++) {
        console.log("onlineServers id = "+onlineServers[i].id)
        if (onlineServers[i].id === sessionId) {
          socket.to(onlineServers[i].room).emit("rem_mem",onlineServers[i]);
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


  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    console.log("watcher ...");
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));



/*
const io = require('socket.io')();

const onlineServers = [];
const sockets = [];

io.on('connection', (client) => {

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
    socket.emit("get_pid",data);
  });

  client.on('joinroom', (data) => {
    console.log("received joinroom = "+client.id);
    console.log(data)
    
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

  //Socket for WebRTC
  let broadcaster;

  client.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  client.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  client.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  client.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  client.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  client.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});

io.listen(3000);
*/
