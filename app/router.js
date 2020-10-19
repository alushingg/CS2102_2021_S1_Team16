const express = require('express');
const loginController = require('./controllers/loginController');
const signupController = require('./controllers/signupController');
const userController = require('./controllers/userController');
const dbController = require('./controllers/dbController');
const petownerController = require('./controllers/petownerController');
const editProfileController = require("./controllers/editProfileController");
const adminController = require('./controllers/adminController');
const petupdateController = require('./controllers/petupdateController');
const availabilityController = require('./controllers/availabilityController');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.authenticated) {
    if (userController.getUser().isAdmin()) {
      res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated, isAdmin: true });
    } else {
      res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated, isAdmin: false });
    }
  } else {
    res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated });
  }
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'PCS Team 16', auth: req.session.authenticated, isAdmin: false });
});

router.get('/pricing', function(req, res, next) {
  res.render('pricing', { title: 'PCS Team 16', auth: req.session.authenticated, isAdmin: false });
});

router.get('/caretaker', function(req, res, next) {
  res.render('caretaker', { title: 'Find Caretaker', auth: req.session.authenticated, isAdmin: false });
}).post('/caretaker', function(req, res, next) {
  req.session.ptype = req.body.type;
  req.session.sdate = req.body.start_date;
  req.session.edate = req.body.end_date;
  res.redirect('availability');
});

router.get('/availability', function(req, res, next) {
  availabilityController.findCaretaker(req.session.ptype, req.session.sdate, req.session.edate, (result) => {
    res.render('availability', { title: 'Availability', auth: req.session.authenticated, isAdmin: false, data: result });
  })
})

router.get('/login', function(req, res, next) {
  const pageInfo = loginController.getPageInfo();
  res.render('login', pageInfo);
}).post('/login', function(req, res, next) {
  // Check if entry is correct
  loginController.getCredentials(req.body, (result) => {
    console.log("Result:");
    console.log(result);
    if (loginController.checkCredentials(result)) {
      loginController.getUserType(result[0].username, (isOwner, isCaretaker, isAdmin) => {
        // Authenticate the user
        loginController.authUser(result[0], isOwner, isCaretaker, isAdmin, req.session);
        res.redirect('/');
      })
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

router.get('/profile', function(req, res, next) {

  const isOwner = userController.getUser().isOwner();
  const isCaretaker = userController.getUser().isCaretaker();
  const isAdmin = userController.getUser().isAdmin();

  if (isAdmin) {
    adminController.showProfile((data) => {
      res.render('profile_a', { title: 'Profile', auth: req.session.authenticated, isAdmin: true, data: data });
    })
  } else if (isOwner && isCaretaker) {
    res.render('profile_poct', { title: 'Profile', auth: req.session.authenticated, isAdmin: false });
  } else if (isOwner) {
    petownerController.showProfile((data) => {
      petownerController.showPet((dataP) => {
        res.render('profile_po', { title: 'Profile', auth: req.session.authenticated, isAdmin: false, data: data, dataP: dataP });
      })
    })
  } else if (isCaretaker) {
    res.render('profile_ct', { title: 'Profile', auth: req.session.authenticated, isAdmin: false });
  }
}).post('/profile_po', function(req, res, next) {
    editProfileController.deleteProfile((result) => {
        console.log("Delete profile Result: ")
        console.log(result);
    });
    res.redirect('/logout');
});

router.get('/edit_profile', function(req, res, next) {
  editProfileController.showCurrentProfile((data) => {
      res.render('edit_profile', { title: 'Edit Profile', auth: req.session.authenticated, isAdmin: false, data: data});
  })
}).post('/edit_profile', function(req, res, next) {
  editProfileController.editProfile(req.body, (result) => {
    console.log("Edit profile Result: ")
    console.log(result);
  });
  res.redirect('profile');
});

router.get('/pastorders', function(req, res, next) {
    const isOwner = userController.getUser().isOwner();
    const isCaretaker = userController.getUser().isCaretaker();
    if (isOwner && isCaretaker) {
        res.render('pastorders_poct', {title: 'Past Orders', auth: req.session.authenticated, isAdmin: false});
    } else if (isOwner) {
        petownerController.showPastOrders((data) => {
            res.render('pastorders_po', {
                title: 'Past Orders',
                auth: req.session.authenticated,
                isAdmin: false,
                data: data
            });
        })
    } else if (isCaretaker) {
        res.render('pastorders_ct', {title: 'Past Orders', auth: req.session.authenticated, isAdmin: false});
    }
});

router.get('/petupdate', function(req, res, next) {
    const isOwner = userController.getUser().getIsOwner();
    const isCaretaker = userController.getUser().getIsCaretaker();
    petupdateController.getPets((data) => {
        res.render('petupdate', { title: 'Pet Update', auth: req.session.authenticated, isAdmin: false, data: data});
    });
}).post('/petupdate', function(req, res, next) {
     petupdateController.editPet(req.body, (result) => {
       console.log("Edit pet Result: ")
       console.log(result);
     });
     res.redirect('profile');
});

router.route('/db')
  .get(dbController.queryGet)
  .post(dbController.queryPost)
  .put(dbController.queryPut)
  .delete(dbController.queryDelete);

module.exports = router;
