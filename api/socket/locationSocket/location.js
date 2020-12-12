const Room = require("../../models/models.js").Room;
const UserStatusDetails = require("../../models/models.js").UserStatusDetails;
const User = require("../../models/models.js").User;

let currentSessions = {};

module.exports = {
  quizGameSocket(socket, io) {
    console.log("New client connected");

    socket.on("create room", async ({ hostId, zone, status } = {}) => {
      /**
       * {
       * hostId: String,
       * zone:{
       *  a: String,
       *  b: String,
       *  c: String
       *  },
       * status: full/new/...
       * }
       **/
      try {
        // room = new Room();
        // room.host = hostId;
        // room.zone = zone;
        // room.status = status;

        const messages = await Room.create({
          host: hostId,
          zone: zone,
          status: status,
        });
        console.log("new room of " + hostId.toString());
        console.log(messages);
        if (messages) {
          io.sockets.emit("new room of " + hostId.toString(), messages);
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("get room list", async ({ hostId } = {}) => {
      /**
       * {
       * hostId: String
       * }
       **/
      try {
        const filter = hostId ? { host: hostId } : {};
        const messages = await Room.find(filter);
        console.log(messages);
        console.log("room list");
        if (messages) {
          io.sockets.emit("room list", messages);
        }
      } catch (error) {
        console.log(error);
      }
    });

    // broadcast the latest player list if someone requested
    socket.on("get player list", (roomPIN) => {
      try {
        const pinFilter = { roomPIN: roomPIN };
        Room.findOne(pinFilter, function (err, doc) {
          // console.log("FOUND DOC:", doc);
          if (err) {
          } else {
            if (doc) {
              console.log(doc);
              io.sockets.emit("update player list " + roomPIN, doc.members);
            }
          }
        });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("join room", async ({ roomPIN, userId } = {}) => {
      /**
       * {
       * roomPIN: number,
       * userId: String
       * }
       */
      try {
        const filter = roomPIN ? { roomPIN: roomPIN } : {};
        const room = await Room.findOne(filter);
        console.log(roomPIN);
        // room.members.push(userId);
        await room.save();
        let members = await User.find({ _id: { $in: room.members } });
        members = members.map((member) => {
          member = member.toJSON();
          delete member.password;
          return member;
        });
        if (members) {
          io.sockets.emit("player list " + roomPIN, members);
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on(
      "location of user",
      async ({ roomPIN, userId, location, lastTimeOnl, status } = {}) => {
        /**
         * {
         * roomPIN: String,
         * userId: String,
         * lastTimeOnl: date,
         * location,
         * status: onl/off
         * }
         **/
        try {
          let userDetail = await UserStatusDetails.findOne({ userID: userId });
          if (userDetail) {
            userDetail.lastTimeOnl = lastTimeOnl;
            userDetail.locations.push(userDetail.lastLocation);
            userDetail.lastLocation = location;
            userDetail.status = status;
            await userDetail.save();
          } else {
            userDetail = await UserStatusDetails.create({
              userID: userId,
              lastTimeOnl: lastTimeOnl,
              lastLocation: location,
              status: status,
            });
          }

          const room = await Room.findOne({ 'roomPIN': roomPIN });
          console.log("location of user for " + room.host)
          if (room) {
            io.sockets.emit("location of user for " + room.host, userDetail);
          }
        } catch (error) {
          console.log(error);
        }
      }
    );
  },
};
