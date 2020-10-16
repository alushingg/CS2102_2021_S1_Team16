const express = require('express');
const loginController = require('./controllers/loginController');
const signupController = require('./controllers/signupController');
const userController = require('./controllers/userController');
const dbController = require('./controllers/dbController');
const petownerController = require('./controllers/petownerController');
const editProfileController = require("./controllers/editProfileController");
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'PCS Team 16', auth: req.session.authenticated });
});

router.get('/pricing', function(req, res, next) {
  res.render('pricing', { title: 'PCS Team 16', auth: req.session.authenticated });
});

router.get('/caretaker', function(req, res, next) {
  res.render('caretaker', { title: 'PCS Team 16', auth: req.session.authenticated });
});

router.get('/login', function(req, res, next) {
  const pageInfo = loginController.getPageInfo();
  res.render('login', pageInfo);
}).post('/login', function(req, res, next) {
  // Check if entry is correct
  loginController.getCredentials(req.body, (result) => {

    console.log("Result:");
    console.log(result);
    if(loginController.checkCredentials(result)) {
      // Authenticate the user
      loginController.authUser(result[0], req.session);
      res.redirect('/');
    } else {
      const pageInfo = loginController.getErrorPageInfo();
      res.render('login', pageInfo);
    }    
  });
});

router.get('/signup', function(req, res, next) {
  const pageInfo = signupController.getPageInfo();
  res.render('signup', pageInfo);
}).post('/signup', function(req, res, next) {  
  res.redirect('/signup');
});

router.get('/logout', function(req, res, next) {
    req.session.destroy(loginController.logoutUser());
    res.redirect('/');
});

router.get('/profile_po', function(req, res, next) {
  petownerController.showProfile((data) => {
    petownerController.showPet((dataP) => {
      res.render('profile_po', { title: 'Profile', auth: req.session.authenticated, data: data, dataP: dataP });
    })
  })
}).post('/profile_po', function(req, res, next) {
  editProfileController.deleteProfile((result) => {
    console.log("Delete profile Result: ")
    console.log(result);
  });
  res.redirect('/logout');
});

router.get('/edit_profile', function(req, res, next) {
  editProfileController.showCurrentProfile((data) => {
      res.render('edit_profile', { title: 'Edit Profile', auth: req.session.authenticated, data: data});
  })
}).post('/edit_profile', function(req, res, next) {
  editProfileController.editProfile(req.body, (result) => {
    console.log("Edit profile Result: ")
    console.log(result);
  });
  res.redirect('profile_po');
});

router.route('/db')
  .get(dbController.queryGet)
  .post(dbController.queryPost)
  .put(dbController.queryPut)
  .delete(dbController.queryDelete);

module.exports = router;
