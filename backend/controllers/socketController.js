const cors = require("cors");
const { Server } = require("socket.io");

const socketInit = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  const connectedUsers = [];

  let users = {};

  let messages = {};

  let emergencyChat = {};

  io.on("connection", (socket) => {
    console.log(`A user has connected with id: ${socket.id}`);

    socket.emit("personalId", socket.id);

    socket.on("disconnect", () => {
      console.log(`User with id: ${socket.id} has left`);
      socket.broadcast.emit("callEnded");
    });

    socket.on("join-video-room", (roomId, userName) => {
      console.log(roomId, userName);
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", userName);
    });

    socket.on("callUser", (data) => {
      socket.to(data.roomId).emit("callUser", {
        signal: data.signalData,
        from: data.from,
      });
    });

    socket.on("answerCall", (data) => {
      socket
        .to(data.roomId)
        .emit("callAccepted", { signal: data.signal, callReceiver: data.name });
    });

    socket.on("endCall", (roomId, cb) => {
      socket.to(roomId).emit("callEnded");
      cb();
    });

    //Text chat

    socket.on("join-chat-room", (roomId, userName) => {
      console.log(roomId, userName);
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", userName);
    });

    socket.on("chatMsg", (data) => {
      socket.to(data.roomId).emit("user-sent-Msg", {
        text: data.text,
        sender: data.sender,
        senderPic: data.senderPic,
        timeStamp: data.timeStamp,
      });
    });

    // Emergency socket creation
    socket.on("broadcast-emergency", (room, userId, userType, cb) => {
      if (userType === "patient") {
        if (!emergencyChat[room]) {
          emergencyChat[room] = {
            patient: userId,
            doctor: "",
            messages: [],
          };
          socket.join(room);
          cb({ emergencyChat: emergencyChat[room], ...users });
        }
      } else if (userType === "doctor") {
        if (emergencyChat[room] && emergencyChat[room].doctor === "") {
          emergencyChat[room].doctor = userId;
          socket.join(room);
          cb({ emergencyChat: emergencyChat[room], ...users });
        }
      }
    });

    socket.on("send-emergency", (sentMessage) => {
      const room = sentMessage.room;
      if (emergencyChat[room]) {
        emergencyChat[room].messages.push(sentMessage);
        io.sockets.in(room).emit("receive-emergency", sentMessage);
      }
    });

    socket.on("join-room", (room, cb) => {
      // socket.emit("joined room", messages)
      socket.join(room);
      let objOnJoin = {};
      if (messages[room]) {
        cb({ messages: messages[room], ...users });
      } else {
        cb({ messages: [], ...users });
      }
    });

    //Group chat
    socket.on("sendAll", (sentMessage) => {
      if (!users[sentMessage.senderId]) {
        users[sentMessage.senderId] = [sentMessage];
      } else {
        let deleted = _.remove(users[sentMessage.senderId], (msgs) => {
          return (
            msgs.senderId === sentMessage.receiverId ||
            msgs.receiverId === sentMessage.receiverId
          );
        });
        users[sentMessage.senderId] = [
          sentMessage,
          ...users[sentMessage.senderId],
        ];
      }

      if (!users[sentMessage.receiverId]) {
        users[sentMessage.receiverId] = [sentMessage];
      } else {
        let deleted = _.remove(users[sentMessage.receiverId], (msgs) => {
          return (
            msgs.senderId === sentMessage.senderId ||
            msgs.receiverId === sentMessage.senderId
          );
        });
        users[sentMessage.receiverId] = [
          sentMessage,
          ...users[sentMessage.receiverId],
        ];
      }
      console.log(users);
      io.sockets.emit("getChatList", users);
    });

    //Get chat list
    socket.on("chatList", (id, cb) => {
      if (users[id]) {
        cb(users[id]);
      } else {
        cb([]);
      }
    });

    socket.on("send", (sentMessage) => {
      const room = sentMessage.room;
      if (messages[room]) {
        messages[room].push(sentMessage);
      } else {
        messages[room] = [sentMessage];
      }

      const obj = {
        sentMessage,
        users,
      };

      io.sockets.in(room).emit("receive", obj);
    });
  });
};

module.exports = socketInit;
