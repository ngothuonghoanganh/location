const User = require('../models/models.js').User;
const config = require('../config/config')
const jwt = require('jsonwebtoken')

module.exports = {

  async createUser(req, res) { 
    try {
   
    const filter = {
      username: req.body.user.username
    };
   
       const user= await User.findOne(filter);
        if (user != null) {
          res.send({
            username: null
          })
        } else {
          let user = new User(req.body.user);
          user.save().then(function (obj) {
            console.log("New user", obj._id);
            res.send({
              username: obj.username
            })
          })
        }
    }catch(error){

      res.sendStatus(500);
  }
  },

  async userLogin(req, res) {
    // console.log(req)
    try {      
      console.log("user-login " + req.body.username)
      console.log("user-login " + req.body.password)
      const filter = {
        username: req.body.username,
        password: req.body.password
      };
  
      let user = await User.findOne(filter)
      if (!user) {
        console.log(user)
        return res.send(500)
      }
      user = user.toJSON()
      delete user.password
      const token = await jwt.sign(user, "userlocation");
      console.log(token)
      return res.send(Object.assign(user, { token }))
    } catch (error) {

      return res.send(400)
    }
  },

  // async login(req, res) {
  //   console.log(req.headers)
  //   const {
  //     username,
  //     password
  //   } = req.body
  //   const filter = {
  //     username,
  //     password
  //   }

  //   const user = await User.findOne(filter, {
  //     username
  //   })
  //   // console.log(user)
  //   if (!user) {
  //     res.sendStatus(500)
  //   }

  //   res.header('authorization', 'Basic ' + user); 
  // }
}