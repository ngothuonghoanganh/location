let express = require('express');
let router = express.Router();

const userController = require('../controller/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post("/create-user", userController.createUser);
router.post("/user-login",userController.userLogin);
// router.post('/login', userController.login);

module.exports = router;
