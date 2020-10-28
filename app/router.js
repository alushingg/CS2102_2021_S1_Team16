const express = require('express');
const loginController = require('./controllers/loginController');
const signupController = require('./controllers/signupController');
const userController = require('./controllers/userController');
const petownerController = require('./controllers/petownerController');
const caretakerController = require('./controllers/caretakerController');
const adminController = require('./controllers/adminController');
const editProfileController = require("./controllers/editProfileController");
const petController = require('./controllers/petController');
const availabilityController = require('./controllers/availabilityController');
const bidController = require('./controllers/bidController');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.authenticated) {
    if (userController.getUser().isAdmin()) {
      res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true });
    } else {
      res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false });
    }
  } else {
    res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated, user: userController.getUsername() });
  }
});

router.get('/pricing', function(req, res, next) {
  var isAdmin = userController.getUser() && userController.getUser().isAdmin();
  res.render('pricing', { title: 'PCS Team 16', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: isAdmin });
});

router.get('/caretaker', function(req, res, next) {
  var isAdmin = userController.getUser() && userController.getUser().isAdmin();
  res.render('caretaker', { title: 'Find Care Taker', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: isAdmin, error: "" });
}).post('/caretaker', function(req, res, next) {
  req.session.ptype = req.body.type;
  req.session.sdate = req.body.start_date;
  req.session.edate = req.body.end_date;
  res.redirect('availability');
});

router.get('/availability', function(req, res, next) {
  var isAdmin = userController.getUser() && userController.getUser().isAdmin();
  availabilityController.findCaretaker(req.session.ptype, req.session.sdate, req.session.edate, (result) => {
    res.render('availability', { title: 'Availability', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: isAdmin, data: result });
  })
});

router.get('/bid/:ctuname', function(req, res, next) {
  var isAdmin = userController.getUser() && userController.getUser().isAdmin();
  bidController.getPets(req, req.session.ptype, req.session.sdate, req.session.edate, (pet, price) => {
    const { ctuname } = req.params;
//    res.render('bid', { title: 'Bid', auth: req.session.authenticated, isAdmin: isAdmin, pet: pet, price: price,
//            start: req.session.sdate, end: req.session.edate, type: req.session.ptype, ctuname: ctuname});
      caretakerController.showProfile(ctuname, (data) => {
            caretakerController.showReview(ctuname, (dataR) => {
//              res.render('profile_ct', { title: 'Profile', auth: req.session.authenticated, isAdmin: false,
//                data: data, dataP: dataP, dataA: dataA, dataR: dataR });
                res.render('bid', { title: 'Bid', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: isAdmin, pet: pet, price: price,
                            start: req.session.sdate, end: req.session.edate, type: req.session.ptype, ctuname: ctuname,
                            data: data, dataR: dataR});
            })

       })
  });

}).post('/bid/:ctuname', function(req, res, next) {
  var isAdmin = userController.getUser() && userController.getUser().isAdmin();
  bidController.addBid(req, req.session.ptype, req.session.sdate, req.session.edate, (result) => {
          console.log("Add bid Result: ")
          console.log(result);
          if (result != "") {
            res.render('caretaker', { title: 'Find Care Taker', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: isAdmin, error: result });
          } else {
            res.redirect('/pastorders');
          }
  });
});

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
  signupController.registerUser(req.body, (result) => {
    if (result == 201) {
      // If successfully added to user table or user already exists
      signupController.registerOwner(req.body, (result) => {
        if(result == 201) {
          loginController.getUserType(req.body.username, (isOwner, isCaretaker, isAdmin) => {
            // Authenticate the user
            loginController.authUser(req.body, isOwner, isCaretaker, isAdmin, req.session);
            res.redirect('/');
          })
        } else {
          console.log("Result otherwise");
          const pageInfo = signupController.getErrorPageInfo('exists');
          res.render('signup', pageInfo);
        }
      });
    } else {
      const pageInfo = signupController.getErrorPageInfo('exists');
      res.render('signup', pageInfo);
    }
  });
});

router.get('/ct_signup', function(req, res, next) {
  const pageInfo = signupController.getPageInfo();
  res.render('ct_signup', pageInfo);
}).post('/ct_signup', function(req, res, next) { 
  console.log(req.body);
  loginController.getCredentials(req.body, (result) => {
    console.log(result);
    if (loginController.checkCredentials(result)) {
      loginController.getUserType(result[0].username, (isOwner, isCaretaker, isAdmin) => {
        console.log(result[0]);
        // Authenticate the user
        if(isCaretaker) {
          signupController.registerOwner(req.body, (code) => {
            if(code == 201) {
                loginController.authUser(result[0], true, isCaretaker, isAdmin, req.session);
                res.redirect('/');
            } else {
              const pageInfo = signupController.getErrorPageInfo('exists');
              res.render('ct_signup', pageInfo);
            }
          });
        } else {
          const pageInfo = signupController.getErrorPageInfo('not_found');
          res.render('ct_signup', pageInfo);
        }
      })
    } else {
      const pageInfo = signupController.getErrorPageInfo('not_found');
      res.render('ct_signup', pageInfo);
    }    
  });
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
      res.render('profile_a', { title: 'Profile', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true, data: data });
    })
  } else if (isOwner && isCaretaker) {
    res.render('profile_poct', { title: 'Profile', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false });
  } else if (isOwner) {
    petownerController.showProfile((data) => {
      petownerController.showPet((dataP) => {
        res.render('profile_po', { title: 'Profile', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, data: data, dataP: dataP });
      })
    })
  } else if (isCaretaker) {
    const user = userController.getUser().getUsername();
    caretakerController.showProfile(user, (data) => {
      caretakerController.showPricing(user, (dataP) => {
        caretakerController.showAvailability(user, (dataA) => {
          caretakerController.showReview(user, (dataR) => {
            res.render('profile_ct', { title: 'Profile', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false,
              data: data, dataP: dataP, dataA: dataA, dataR: dataR });
          })
        })
      })
    })
  }
}).post('/profile', function(req, res, next) {
    editProfileController.deleteProfile((result) => {
        console.log("Delete profile Result: ")
        console.log(result);
    });
    res.redirect('/logout');
});

router.get('/edit_profile', function(req, res, next) {
  const isOwner = userController.getUser().isOwner();
  const isCaretaker = userController.getUser().isCaretaker();
  const isAdmin = userController.getUser().isAdmin();
  if (isAdmin) {
    editProfileController.showCurrentAdminProfile(([data, usertype]) => {
      res.render('edit_profile', {title: 'Edit Profile', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true, data: data, usertype: usertype });
    })
  } else if (isOwner) {
    editProfileController.showCurrentPOProfile(([data, usertype]) => {
      res.render('edit_profile', {title: 'Edit Profile', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, data: data, usertype: usertype });
    })
  }
 else if (isCaretaker) {
  editProfileController.showCurrentCaretakerProfile(([data, usertype]) => {
    res.render('edit_profile', {title: 'Edit Profile', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, data: data, usertype: usertype });
  })
}
}).post('/edit_profile', function(req, res, next) {
  const isOwner = userController.getUser().isOwner();
  const isCaretaker = userController.getUser().isCaretaker();
  const isAdmin = userController.getUser().isAdmin();
  if (isOwner) {
    editProfileController.editPOProfile(req.body, (result) => {
      console.log("Edit profile Result: ")
      console.log(result);
    });
  } else if (isAdmin) {
    editProfileController.editAdminProfile(req.body, (result) => {
      console.log("Edit profile Result: ")
      console.log(result);
    });
  }
   else if (isCaretaker) {
    editProfileController.editCaretakerProfile(req.body, (result) => {
      console.log("Edit profile Result: ")
      console.log(result);
    });
  }
  res.redirect('profile');
});

router.get('/addtype', function(req, res, next) {
  const user = userController.getUser().getUsername();
  const isCaretaker = userController.getUser().isCaretaker();
  if (isCaretaker) {
    res.render('addtype', {title: 'Add Pet Type', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, error: "" });
  }
}).post('/addtype', function(req, res, next) {
     editProfileController.addType(req.body, (result, err) => {
       console.log(result);
       if (err != "") {
            console.log(err);
            res.render('addtype', { title: 'Add Pet Type', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, error: err });
       } else {
             res.redirect('/profile');
       }
     });
});

router.get('/ct/:type/set', function(req, res, next) {
  const user = userController.getUser().getUsername();
  const isCaretaker = userController.getUser().isCaretaker();
  if (isCaretaker) {
    const { type } = req.params;
    res.render('setprice', {title: 'Set Price', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, type: type, error: "" });
  }
}).post('/ct/:type/set', function(req, res, next) {
  const { type } = req.params;
  editProfileController.setPrice(req.body, type, (result, err) => {
   console.log(result);
   if (err != "") {
      console.log(err);
      res.render('setprice', { title: 'Set Price', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, type: type, error: err });
   } else {
      res.redirect('/profile');
   }
  });
});

router.get('/pastorders', function(req, res, next) {
    const isOwner = userController.getUser().isOwner();
    const isCaretaker = userController.getUser().isCaretaker();
    if (isOwner && isCaretaker) {
        res.render('pastorders_poct', {title: 'Past Orders', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false });
    } else if (isOwner) {
        petownerController.showPastOrders((data) => {
            res.render('pastorders_po', {
                title: 'Past Orders',
                auth: req.session.authenticated,
                user: userController.getUsername(),
                isAdmin: false,
                data: data
            });
        })
    } else if (isCaretaker) {
      caretakerController.showPastOrders((data) => {
        caretakerController.showPetdays((dataPd) =>{
          res.render('pastorders_ct', {
              title: 'Past Orders',
              auth: req.session.authenticated,
              user: userController.getUsername(),
              isAdmin: false,
              data: data,
              dataPd: dataPd

            });
          })
        })
    }
});

router.post('/ct/:name/:pouname/:day/:month/:year/paid', function(req, res, next) {
    caretakerController.updatePaid(req, (result) => {
            console.log("Update paid Result: ")
            console.log(result);
        });
        res.redirect("/pastorders")
})

router.post('/ct/:name/:pouname/:day/:month/:year/completed', function(req, res, next) {
    caretakerController.updateCompleted(req, (result) => {
            console.log("Update completed Result: ")
            console.log(result);
        });
        res.redirect("/pastorders")
})
router.get('/po/:name/:day/:month/:year/:ctuname/review', function(req, res, next) {
    petownerController.showOrder(req, (data, name, day, month, year, ctuname) => {
        res.render('rate_review', {title: 'Rate and Review Care Taker', auth: req.session.authenticated, user: userController.getUsername(),
                                     isAdmin: false, data: data, name: name, day: day, month: month, year: year, ctuname: ctuname});
    });
}).post('/po/:name/:day/:month/:year/:ctuname/review', function(req, res, next) {
    petownerController.postReview(req.body, req.params, (result) => {
        console.log("Review and rate result: ")
        console.log(result);
    });
    res.redirect('/pastorders');
});

router.get('/pet/:petname/update', function(req, res, next) {
    petController.trackPet(req, (data, petname) => {
        res.render('petupdate', { title: 'Pet Update', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, 
                                    data: data, petname: petname });
    });
}).post('/pet/:petname/update', function(req, res, next) {
     petController.editPet(req.body, req.params, (result) => {
       console.log("Edit pet Result: ")
       console.log(result);
     });
     res.redirect('/profile');
});

router.get('/petadd', function(req, res, next) {
     res.render('petadd', { title: 'Add Pet', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, error: "" });
}).post('/petadd', function(req, res, next) {
     petController.addPet(req.body, (result, err) => {
       console.log("Add Pet Result: ")
       console.log(result);
       //if pet exists already, trigger will return error
       if (err != "") {
            console.log(err);
            res.render('petadd', { title: 'Add Pet', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, error: err });
       } else {
             res.redirect('/profile');
       }
     });
});

router.post('/pet/:petname/delete', function(req, res, next) {
    petController.deletePet(req, (result) => {
        console.log("Delete pet Result: ")
        console.log(result);
    });
    res.redirect("/profile");
});

router.get('/getmonthlyreport', function(req, res, next) {
  if (userController.getUser() && userController.getUser().isAdmin()) {
    res.render('getmonthlyreport', { title: 'Get Monthly Report', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true });
  }
}).post('/getmonthlyreport', function(req, res, next) {
  req.session.month = req.body.month;
  req.session.year = req.body.year;
  res.redirect('monthlyreport');
});

router.get('/monthlyreport', function(req, res, next) {
  if (userController.getUser() && userController.getUser().isAdmin()) {
    adminController.getMonthlyCtReport(req.session.month, req.session.year, (dataC) => {
      adminController.getMonthlyReport(req.session.month, req.session.year, (data) => {
        res.render('monthlyreport', { title: 'Monthly Report', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true,
          month: req.session.month, year: req.session.year, dataC: dataC, data: data });
      })
    })
  }
});

router.get('/addAvailability', function(req, res, next) {
 if (userController.getUser() && userController.getUser().isCaretaker()) {
      res.render('addAvailability', { title: 'Add Availability', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, msg: ""});
  }
}).post('/addAvailability', function(req, res, next) {
  caretakerController.addAvailability(req.body, (msg) => {
    if (msg != "Success!") {
      res.render('addAvailability', { title: 'Add Availability', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, msg: msg });
    } else {
      res.redirect('/profile');
    }
  });
});

router.get('/applyleave', function(req, res, next) {
 if (userController.getUser() && userController.getUser().isCaretaker()) {
      res.render('applyleave', { title: 'Apply Leave', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, msg: ""});
  }
}).post('/applyleave', function(req, res, next) {
  caretakerController.applyleave(req.body, (msg) => {
    if (msg != "Success!") {
      res.render('applyleave', { title: 'Apply Leave', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: false, msg: msg });
    } else {
      res.redirect('/profile');
    }
  });
});

router.get('/summary', function(req, res, next) {
  if (userController.getUser() && userController.getUser().isAdmin()) {
    adminController.getMthSummary((data) => {
      adminController.getSummary((dataT, dataP, dataPd, dataS, dataE, dataPf) => {
        res.render('summary', { title: 'Summary', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true, data: data,
          dataT: dataT, dataP: dataP, dataPd: dataPd, dataS: dataS, dataE: dataE, dataPf, dataPf });
      })
    })
  }
});

router.get('/addadmin', function(req, res, next) {
  if (userController.getUser() && userController.getUser().isAdmin()) {
     res.render('add_admin', { title: 'Add New Admin', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true , msg: "" });
  }
}).post('/addadmin', function(req, res, next) {
  adminController.addAdmin(req.body, (result, msg) => {
     console.log("Add admin Result: ")
     console.log(result);
     console.log(msg);
     res.render('add_admin', { title: 'Add New Admin', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true, msg: msg });
  });
});

router.get('/addcaretaker', function(req, res, next) {
  if (userController.getUser() && userController.getUser().isAdmin()) {
     res.render('add_caretaker', { title: 'Add New Care Taker', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true , msg: "" });
  }
}).post('/addcaretaker', function(req, res, next) {
  adminController.addCaretaker(req.body, (msg) => {
     res.render('add_caretaker', { title: 'Add New Care Taker', auth: req.session.authenticated, user: userController.getUsername(), isAdmin: true, msg: msg });
  });
});

module.exports = router;
