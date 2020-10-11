const express = require('express');
const loginController = require('./controllers/loginController');
const signupController = require('./controllers/signupController');
const dbController = require('./controllers/dbController')
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'PCS Team 16', auth: false });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'PCS Team 16', auth: true });
});

router.get('/pricing', function(req, res, next) {
  res.render('pricing', { title: 'PCS Team 16', auth: false });
});

router.get('/caretaker', function(req, res, next) {
  res.render('caretaker', { title: 'PCS Team 16', auth: false });
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
