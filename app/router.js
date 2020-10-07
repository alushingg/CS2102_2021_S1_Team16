const express = require('express');
const loginController = require('./controllers/loginController');
const signupController = require('./controllers/signupController');
const dbController = require('./controllers/dbController')
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'PCS Team 16' });
});

router.get('/login', function(req, res, next) {
  const pageInfo = loginController.getPageInfo();
  res.render('login', pageInfo);
}).post('/login', function(req, res, next) {
  
  // Need use express-session
  
  res.redirect('/login');
});

router.get('/signup', function(req, res, next) {
  const pageInfo = signupController.getPageInfo();
  res.render('signup', pageInfo);
}).post('/signup', function(req, res, next) {
  
  // Need use express-session

  console.log(req.body);
  
  res.redirect('/signup');
});

router.route('/db')
  .get(dbController.queryGet)
  .post(dbController.queryPost)
  .put(dbController.queryPut)
  .delete(dbController.queryDelete);

module.exports = router;
