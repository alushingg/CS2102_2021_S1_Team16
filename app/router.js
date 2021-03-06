const express = require('express');
const loginController = require('./controllers/loginController');
const signupController = require('./controllers/signupController');
const petownerController = require('./controllers/petownerController');
const caretakerController = require('./controllers/caretakerController');
const adminController = require('./controllers/adminController');
const editProfileController = require("./controllers/editProfileController");
const petController = require('./controllers/petController');
const availabilityController = require('./controllers/availabilityController');
const bidController = require('./controllers/bidController');
const userController = require('./controllers/userController');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.authenticated) {
    if (req.session.user.isAdmin) {
      res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true, isPOCT: req.session.user.isPOCT });
    } else {
      res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: req.session.user.isPOCT });
    }
  } else {
    res.render('index', { title: 'PCS Team 16', auth: req.session.authenticated });
  }
});

router.get('/pricing', function(req, res, next) {
  var isAdmin = req.session.user && req.session.user.isAdmin;
  var isPOCT = req.session.user && req.session.user.isPOCT;
  availabilityController.getBasePrice((data) => {
    if (req.session.authenticated) {
      res.render('pricing', { title: 'Pricing', auth: req.session.authenticated, user: req.session.user.username, isAdmin: isAdmin, isPOCT: isPOCT, data: data });
    } else {
      res.render('pricing', { title: 'Pricing', auth: req.session.authenticated, isAdmin: isAdmin, isPOCT: isPOCT, data: data });
    }
  })
});

router.get('/caretaker', function(req, res, next) {
  var isAdmin = req.session.user && req.session.user.isAdmin;
  var isPOCT = req.session.user && req.session.user.isPOCT;
  if (req.session.authenticated) {
    res.render('caretaker', { title: 'Find Care Taker', auth: req.session.authenticated, user: req.session.user.username, isAdmin: isAdmin, isPOCT: isPOCT, error: "" });
  } else {
    res.redirect('/login');
  }
}).post('/caretaker', function(req, res, next) {
  req.session.ptype = req.body.type;
  req.session.sdate = req.body.start_date;
  req.session.edate = req.body.end_date;
  res.redirect('availability');
});

router.get('/availability', function(req, res, next) {
  var isAdmin = req.session.user && req.session.user.isAdmin;
  var isPOCT = req.session.user && req.session.user.isPOCT;
  availabilityController.findCaretaker(req.session.ptype, req.session.sdate, req.session.edate, (result) => {
    res.render('availability', { title: 'Availability', auth: req.session.authenticated, user: req.session.user.username, isAdmin: isAdmin, isPOCT: isPOCT, data: result });
  })
});

router.get('/bid/:ctuname', function(req, res, next) {
  var isAdmin = req.session.user && req.session.user.isAdmin;
  var isPOCT = req.session.user && req.session.user.isPOCT;
  bidController.getPets(req, req.session.ptype, req.session.sdate, req.session.edate, (pet, price) => {
    const { ctuname } = req.params;
//    res.render('bid', { title: 'Bid', auth: req.session.authenticated, isAdmin: isAdmin, pet: pet, price: price,
//            start: req.session.sdate, end: req.session.edate, type: req.session.ptype, ctuname: ctuname});
      caretakerController.showProfile(ctuname, (data) => {
            caretakerController.showReview(ctuname, (dataR) => {
//              res.render('profile_ct', { title: 'Profile', auth: req.session.authenticated, isAdmin: false,
//                data: data, dataP: dataP, dataA: dataA, dataR: dataR });
                res.render('bid', { title: 'Bid', auth: req.session.authenticated, user: req.session.user.username, isAdmin: isAdmin, isPOCT: isPOCT,
                            pet: pet, price: price, start: req.session.sdate, end: req.session.edate, type: req.session.ptype, ctuname: ctuname,
                            data: data, dataR: dataR});
            })

       })
  });

}).post('/bid/:ctuname', function(req, res, next) {
  var isAdmin = req.session.user && req.session.user.isAdmin;
  var isPOCT = req.session.user && req.session.user.isPOCT;
  bidController.addBid(req, req.session.ptype, req.session.sdate, req.session.edate, (result) => {
          console.log("Add bid Result: ")
          console.log(result);
          if (result != "") {
            res.render('caretaker', { title: 'Find Care Taker', auth: req.session.authenticated, user: req.session.user.username, isAdmin: isAdmin, isPOCT: isPOCT, error: result });
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
      loginController.getUserType(result[0].username, (isOwner, isCaretaker, isAdmin, isPOCT) => {
        // Authenticate the user
        loginController.authUser(result[0], isOwner, isCaretaker, isAdmin, isPOCT, req.session);
        console.log("Session User");
        console.log(req.session.user);
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
          loginController.getUserType(req.body.username, (isOwner, isCaretaker, isAdmin, isPOCT) => {
            // Authenticate the user
            loginController.authUser(req.body, isOwner, isCaretaker, isAdmin, isPOCT, req.session);
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
      loginController.getUserType(result[0].username, (isOwner, isCaretaker, isAdmin, isPOCT) => {
        console.log(result[0]);
        // Authenticate the user
        if(isCaretaker) {
          signupController.registerOwner(req.body, (code) => {
            if(code == 201) {
                loginController.authUser(result[0], true, false, isAdmin, 1, req.session);
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
    req.session.destroy(() => {
      res.redirect('/');
    });
});

router.get('/profile', function(req, res, next) {

  const isOwner = req.session.user.isOwner;
  const isCaretaker = req.session.user.isCaretaker;
  const isAdmin = req.session.user.isAdmin;
  const isPOCT = req.session.user && req.session.user.isPOCT;

  console.log(req.session.user);
  console.log(isOwner);
  console.log(isCaretaker);
  console.log(isAdmin);
  console.log(isPOCT);

  if (isAdmin) {
    adminController.showProfile(req.session.user.username, (data) => {
      res.render('profile_a', { title: 'Profile', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true, isPOCT: isPOCT, data: data });
    })
  } else if (isOwner) {
    petownerController.showProfile(req.session.user.username, (data) => {
      petownerController.showPet(req.session.user.username, (dataP) => {
        res.render('profile_po', { title: 'Profile', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, data: data, dataP: dataP });
      })
    })
  } else if (isCaretaker) {
    const user = req.session.user.username;
    const isPOCT = req.session.user && req.session.user.isPOCT;
    caretakerController.showProfile(user, (data) => {
      caretakerController.showPricing(user, (dataP) => {
        caretakerController.showAvailability(user, (dataA) => {
          caretakerController.showReview(user, (dataR) => {
            res.render('profile_ct', { title: 'Profile', auth: req.session.authenticated, user: user, isAdmin: false,
              isPOCT: isPOCT, data: data, dataP: dataP, dataA: dataA, dataR: dataR });
          })
        })
      })
    })
  }
}).post('/profile', function(req, res, next) {
    editProfileController.deleteProfile(req.session.user.username, (result) => {
        console.log("Delete profile Result: ")
        console.log(result);
    });
    res.redirect('/logout');
});

router.get('/edit_profile', function(req, res, next) {
  const isOwner = req.session.user.isOwner;
  const isCaretaker = req.session.user.isCaretaker;
  const isAdmin = req.session.user.isAdmin;
  const isPOCT = req.session.user && req.session.user.isPOCT;
  if (isAdmin) {
    editProfileController.showCurrentAdminProfile(req.session.user.username, ([data, usertype]) => {
      res.render('edit_profile', {title: 'Edit Profile', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true, isPOCT: isPOCT, data: data, usertype: usertype });
    })
  } else if (isOwner) {
    editProfileController.showCurrentPOProfile(req.session.user.username, ([data, usertype]) => {
      res.render('edit_profile', {title: 'Edit Profile', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, data: data, usertype: usertype });
    })
  }
 else if (isCaretaker) {
  editProfileController.showCurrentCaretakerProfile(req.session.user.username, ([data, usertype]) => {
    res.render('edit_profile', {title: 'Edit Profile', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, data: data, usertype: usertype });
  })
}
}).post('/edit_profile', function(req, res, next) {
  const isOwner = req.session.user.isOwner;
  const isCaretaker = req.session.user.isCaretaker;
  const isAdmin = req.session.user.isAdmin;
  if (isOwner) {
    editProfileController.editPOProfile(req.session.user.username, req.body, (result) => {
      console.log("Edit profile Result: ")
      console.log(result);
    });
  } else if (isAdmin) {
    editProfileController.editAdminProfile(req.session.user.username, req.body, (result) => {
      console.log("Edit profile Result: ")
      console.log(result);
    });
  }
   else if (isCaretaker) {
    editProfileController.editCaretakerProfile(req.session.user.username, req.body, (result) => {
      console.log("Edit profile Result: ")
      console.log(result);
    });
  }
  res.redirect('profile');
});

router.get('/addtype', function(req, res, next) {
  const isCaretaker = req.session.user.isCaretaker;
  const isPOCT = req.session.user && req.session.user.isPOCT;
  if (isCaretaker) {
    res.render('addtype', {title: 'Add Pet Type', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, error: "" });
  }
}).post('/addtype', function(req, res, next) {
    const isPOCT = req.session.user && req.session.user.isPOCT;
     editProfileController.addType(req.session.user.username, req.body, (result, err) => {
       console.log(result);
       if (err != "") {
            console.log(err);
            res.render('addtype', { title: 'Add Pet Type', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, error: err });
       } else {
             res.redirect('/profile');
       }
     });
});

router.get('/ct/:type/set', function(req, res, next) {
  const isCaretaker = req.session.user.isCaretaker;
  const isPOCT = req.session.user && req.session.user.isPOCT;
  if (isCaretaker) {
    const { type } = req.params;
    res.render('setprice', {title: 'Set Price', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, type: type, error: "" });
  }
}).post('/ct/:type/set', function(req, res, next) {
  const isPOCT = req.session.user && req.session.user.isPOCT;
  const { type } = req.params;
  editProfileController.setPrice(req.session.user.username, req.body, type, (result, err) => {
   console.log(result);
   if (err != "") {
      console.log(err);
      res.render('setprice', { title: 'Set Price', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, type: type, error: err });
   } else {
      res.redirect('/profile');
   }
  });
});

router.get('/pastorders', function(req, res, next) {
    const isOwner = req.session.user.isOwner;
    const isCaretaker = req.session.user.isCaretaker;
    const isPOCT = req.session.user && req.session.user.isPOCT;
    if (isOwner) {
        petownerController.showPastOrders(req.session.user.username, (data) => {
            res.render('pastorders_po', {
                title: 'Past Orders',
                auth: req.session.authenticated,
                user: req.session.user.username,
                isAdmin: false,
                isPOCT: isPOCT,
                data: data
            });
        })
    } else if (isCaretaker) {
      caretakerController.showPastOrders(req.session.user.username, (data) => {
        caretakerController.showSummary(req.session.user.username, (dataS) =>{
          console.log(dataS);
          res.render('pastorders_ct', {
              title: 'Past Orders',
              auth: req.session.authenticated,
              user: req.session.user.username,
              isAdmin: false,
              isPOCT: isPOCT,
              data: data,
              dataS: dataS
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
  const isPOCT = req.session.user && req.session.user.isPOCT;
  petownerController.showOrder(req, (data, name, day, month, year, ctuname) => {
        res.render('rate_review', {title: 'Rate and Review Care Taker', auth: req.session.authenticated, user: req.session.user.username,
                                     isAdmin: false, isPOCT: isPOCT, data: data, name: name, day: day, month: month, year: year, ctuname: ctuname});
    });
}).post('/po/:name/:day/:month/:year/:ctuname/review', function(req, res, next) {
    petownerController.postReview(req.session.user.username, req.body, req.params, (result) => {
        console.log("Review and rate result: ")
        console.log(result);
    });
    res.redirect('/pastorders');
});

router.get('/pet/:petname/update', function(req, res, next) {
    const isPOCT = req.session.user && req.session.user.isPOCT;
    petController.trackPet(req, (data, petname) => {
        res.render('petupdate', { title: 'Pet Update', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, 
                                    isPOCT: isPOCT, data: data, petname: petname });
    });
}).post('/pet/:petname/update', function(req, res, next) {
     petController.editPet(req.session.user.username, req.body, req.params, (result) => {
       console.log("Edit pet Result: ")
       console.log(result);
     });
     res.redirect('/profile');
});

router.get('/petadd', function(req, res, next) {
    const isPOCT = req.session.user && req.session.user.isPOCT;
    res.render('petadd', { title: 'Add Pet', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, error: "" });
}).post('/petadd', function(req, res, next) {
     const isPOCT = req.session.user && req.session.user.isPOCT;
     petController.addPet(req.session.user.username, req.body, (result, err) => {
       console.log("Add Pet Result: ")
       console.log(result);
       //if pet exists already, trigger will return error
       if (err != "") {
            console.log(err);
            res.render('petadd', { title: 'Add Pet', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, error: err });
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
  if (req.session.user && req.session.user.isAdmin) {
    res.render('getmonthlyreport', { title: 'Get Monthly Report', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true, isPOCT: 0 });
  }
}).post('/getmonthlyreport', function(req, res, next) {
  req.session.month = req.body.month;
  req.session.year = req.body.year;
  res.redirect('monthlyreport');
});

router.get('/monthlyreport', function(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    adminController.getMonthlyCtReport(req.session.month, req.session.year, (dataC) => {
      adminController.getMonthlyReport(req.session.month, req.session.year, (data) => {
        res.render('monthlyreport', { title: 'Monthly Report', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true, isPOCT: 0,
          month: req.session.month, year: req.session.year, dataC: dataC, data: data });
      })
    })
  }
});

router.get('/addAvailability', function(req, res, next) {
 const isPOCT = req.session.user && req.session.user.isPOCT;
 if (req.session.user && req.session.user.isCaretaker) {
      res.render('addAvailability', { title: 'Add Availability', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, msg: ""});
  }
}).post('/addAvailability', function(req, res, next) {
  const isPOCT = req.session.user && req.session.user.isPOCT;
  caretakerController.addAvailability(req.session.user.username, req.body, (msg) => {
    if (msg != "Success!") {
      res.render('addAvailability', { title: 'Add Availability', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, msg: msg });
    } else {
      res.redirect('/profile');
    }
  });
});

router.get('/applyleave', function(req, res, next) {
 const isPOCT = req.session.user && req.session.user.isPOCT;
 if (req.session.user && req.session.user.isCaretaker) {
      res.render('applyleave', { title: 'Apply Leave', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, msg: ""});
  }
}).post('/applyleave', function(req, res, next) {
  const isPOCT = req.session.user && req.session.user.isPOCT;
  caretakerController.applyleave(req.session.user.username, req.body, (msg) => {
    if (msg != "Success!") {
      res.render('applyleave', { title: 'Apply Leave', auth: req.session.authenticated, user: req.session.user.username, isAdmin: false, isPOCT: isPOCT, msg: msg });
    } else {
      res.redirect('/profile');
    }
  });
});

router.get('/summary', function(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    adminController.getMthSummary((data) => {
      adminController.getSummary((dataT, dataP, dataPd, dataS, dataE, dataPf) => {
        res.render('summary', { title: 'Summary', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true, isPOCT: 0, data: data,
          dataT: dataT, dataP: dataP, dataPd: dataPd, dataS: dataS, dataE: dataE, dataPf, dataPf });
      })
    })
  }
});

router.get('/addadmin', function(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
     res.render('add_admin', { title: 'Add New Admin', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true, isPOCT: 0, msg: "" });
  }
}).post('/addadmin', function(req, res, next) {
  adminController.addAdmin(req.body, (result, msg) => {
     console.log("Add admin Result: ")
     console.log(result);
     console.log(msg);
     res.render('add_admin', { title: 'Add New Admin', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true, isPOCT: 0, msg: msg });
  });
});

router.get('/addcaretaker', function(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
     res.render('add_caretaker', { title: 'Add New Care Taker', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true , isPOCT: 0, msg: "" });
  }
}).post('/addcaretaker', function(req, res, next) {
  adminController.addCaretaker(req.body, (msg) => {
     res.render('add_caretaker', { title: 'Add New Care Taker', auth: req.session.authenticated, user: req.session.user.username, isAdmin: true, isPOCT: 0, msg: msg });
  });
});

router.get('/switch', function(req, res, next) {
    const isPOCT = req.session.user && req.session.user.isPOCT;
    console.log(req.session.user.isCaretaker);

    console.log(req.session.user.isOwner);
    if (isPOCT) {
        req.session.user = userController.changeUser(req.session.user);
        console.log(req.session.user.isCaretaker);
        console.log(req.session.user.isOwner);
        console.log(req.session.user.isPOCT);
        res.redirect('/');
    }
});

module.exports = router;
