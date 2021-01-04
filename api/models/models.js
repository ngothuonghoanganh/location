let mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose); // npm install --save mongoose-sequence

// User model
let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, "can't be blank"],
  },
  //  image:{type: [PictureSchema]},
  //  bio:[String],
  phone: {
    type: String,
    lowercase: true,
    index: true,
  },
  update: {
    type: Date,
    default: Date.now,
  },
});

let userStatusDetails = new mongoose.Schema({
  userID: {
    type: String,
  },
  lastTimeOnl: {
    type: Date,
  },
  status: { type: String },
  locations: [{ type: Object }],
  lastLocation: { type: Object },
});

let roomSchema = new mongoose.Schema({
  roomPIN: Number,
  host: { type: String },
  members: [String],
  zone: { type: Object },
  status: { type: String },
});

roomSchema.plugin(AutoIncrement, {
  id: 'roomPIN_seq',
  inc_field: 'roomPIN'
});
// mongoose.model('Picture', PictureSchema);
let User = mongoose.model("User", UserSchema);
let UserStatusDetails = mongoose.model("UserStatusDetails", userStatusDetails);
let Room = mongoose.model("Room", roomSchema);

// var Picture = mongoose.model('Picture', PictureSchema);
module.exports = {
  User,
  UserStatusDetails,
  Room,
};
