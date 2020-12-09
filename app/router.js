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

router.get('/', function (req, res, next) {
    res.render('index', { 
        title: 'PCS Team 16', 
        cookie: req.session
    });
});

router.get('/pricing', function (req, res, next) {
    availabilityController.getBasePrice((data) => {
        res.render('pricing', { 
            title: 'Pricing', 
            cookie: req.session, 
            data: data 
        });
    })
});

router.get('/caretaker', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        userController.getOwnedPetTypes(req.session.user, function(result) {
            res.render('caretaker', { 
                title: 'Find Care Taker', 
                cookie: req.session, 
                petTypes: result
            });
        });
        
    }
}).post('/caretaker', function (req, res, next) {
    res.redirect('availability/?type=' + req.body.type + "&start=" + req.body.start_date + "&end=" + req.body.end_date);
});

router.get('/availability', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        availabilityController.findCaretaker(req.query.type, req.query.start, req.query.end, (result) => {
            res.render('availability', { 
                title: 'Availability', 
                cookie: req.session, 
                data: result, 
                type: req.query.type,  
                start: req.query.start, 
                end: req.query.end 
            });
        })
    }
});

router.get('/bid/:ctuname', function (req, res, next) {
    if (!req.session.authenticated) {
        console.log("Bid redirect: ");
        console.log(req.url);
        res.redirect('/login?redirect=' + req.url);
    } else {
        bidController.getPets(req, req.query.type, req.query.start, req.query.end, (pet, price) => {
            const { ctuname } = req.params;
            caretakerController.showProfile(ctuname, (data) => {
                caretakerController.showReview(ctuname, (dataR) => {
                    userController.getCreditCard(req.session.user.username, (cardNumber) => {
                        console.log(cardNumber);
                        res.render('bid', {
                            title: 'Bid', 
                            cookie:req.session, 
                            pet: pet, price: price, 
                            start: req.query.start, 
                            end: req.query.end, 
                            type: req.query.type, 
                            ctuname: ctuname,
                            data: data, dataR: dataR,
                            hasCreditCard: cardNumber !== null
                        });
                    })
                })
            })
        });
    }
}).post('/bid/:ctuname', function (req, res, next) {
    bidController.addBid(req, req.body.type, req.body.start, req.body.end, (result) => {
        console.log("Add bid Result: ")
        console.log(result);
        if (result != "") {
            res.render('caretaker', { 
                title: 'Find Care Taker', 
                cookie: req.session, 
                error: result 
            });
        } else {
            res.redirect('/pastorders');
        }
    });
});

router.get('/login', function (req, res, next) {
    const redirect = Object.keys(req.query).map(key => `${key}=${req.query[key]}`).join('&').slice(9);
    const pageInfo = loginController.getPageInfo(redirect);
    console.log(pageInfo);
    res.render('login', pageInfo);
}).post('/login', function (req, res, next) {
    // Check if entry is correct
    loginController.getCredentials(req.body, (result) => {
        if (loginController.checkCredentials(result)) {
            loginController.getUserType(result[0].username, (isOwner, isCaretaker, isAdmin, isPOCT) => {
                // Authenticate the user
                loginController.authUser(result[0], isOwner, isCaretaker, isAdmin, isPOCT, req.session);
                console.log("Session User");
                console.log(req.session.user);
                console.log(req.body.redirect);
                if(req.body.redirect === '') {
                    res.redirect('/');
                } else {
                    res.redirect(req.body.redirect);
                }
            })
        } else {
            const pageInfo = loginController.getErrorPageInfo();
            res.render('login', pageInfo);
        }
    });
});

router.get('/signup', function (req, res, next) {
    const pageInfo = signupController.getPageInfo();
    res.render('signup', pageInfo);
}).post('/signup', function (req, res, next) {
    signupController.registerUser(req.body, (result) => {
        if (result == 201) {
            // If successfully added to user table or user already exists
            signupController.registerOwner(req.body, (result) => {
                if (result == 201) {
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

router.get('/ct_signup', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        const pageInfo = signupController.getPageInfo();
        res.render('ct_signup', pageInfo);
    }
}).post('/ct_signup', function (req, res, next) {
    console.log(req.body);
    loginController.getCredentials(req.body, (result) => {
        console.log(result);
        if (loginController.checkCredentials(result)) {
            loginController.getUserType(result[0].username, (isOwner, isCaretaker, isAdmin, isPOCT) => {
                console.log(result[0]);
                // Authenticate the user
                if (isCaretaker) {
                    signupController.registerOwner(req.body, (code) => {
                        if (code == 201) {
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

router.get('/logout', function (req, res, next) {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

router.get('/profile', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isAdmin) {
            adminController.showProfile(req.session.user.username, (data) => {
                res.render('profile_a', { 
                    title: 'Profile', 
                    cookie: req.session,
                    data: data 
                });
            })
        } else if (req.session.user.isOwner) {
            petownerController.showProfile(req.session.user.username, (data) => {
                petownerController.showPet(req.session.user.username, (dataP) => {
                    res.render('profile_po', { 
                        title: 'Profile', 
                        cookie: req.session,
                        data: data, 
                        dataP: dataP 
                    });
                })
            })
        } else if (req.session.user.isCaretaker) {
            const user = req.session.user.username;
            caretakerController.showProfile(user, (data) => {
                caretakerController.showPricing(user, (dataP) => {
                    caretakerController.showAvailability(user, (dataA) => {
                        caretakerController.showReview(user, (dataR) => {
                            res.render('profile_ct', {
                                title: 'Profile', 
                                cookie: req.session,
                                data: data, 
                                dataP: dataP, 
                                dataA: dataA, 
                                dataR: dataR
                            });
                        })
                    })
                })
            })
        } else {
            res.redirect('/');
            // Redirect to sinkhole
        }
    }
}).post('/profile', function (req, res, next) {
    editProfileController.deleteProfile(req.session.user.username, (result) => {
        console.log("Delete profile Result: ")
        console.log(result);
    });
    res.redirect('/logout');
});

router.get('/edit_profile', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isAdmin) {
            editProfileController.showCurrentAdminProfile(req.session.user.username, ([data, usertype]) => {
                res.render('edit_profile', { 
                    title: 'Edit Profile', 
                    cookie: req.session, 
                    data: data, 
                    usertype: usertype 
                });
            })
        } else if (req.session.user.isOwner) {
            editProfileController.showCurrentPOProfile(req.session.user.username, ([data, usertype]) => {
                res.render('edit_profile', { 
                    title: 'Edit Profile', 
                    cookie: req.session, 
                    data: data, 
                    usertype: usertype 
                });
            })
        } else if (req.session.user.isCaretaker) {
            editProfileController.showCurrentCaretakerProfile(req.session.user.username, ([data, usertype]) => {
                res.render('edit_profile', { 
                    title: 'Edit Profile', 
                    cookie: req.session,
                    data: data, 
                    usertype: usertype 
                });
            })
        } else {
            res.redirect('/');
            // Redirect to sinkhole
        }
    }
}).post('/edit_profile', function (req, res, next) {
    if (req.session.user.isOwner) {
        editProfileController.editPOProfile(req.session.user.username, req.body, (result) => {
            console.log("Edit profile Result: ")
            console.log(result);
        });
    } else if (req.session.user.isAdmin) {
        editProfileController.editAdminProfile(req.session.user.username, req.body, (result) => {
            console.log("Edit profile Result: ")
            console.log(result);
        });
    }
    else if (req.session.user.isCaretaker) {
        editProfileController.editCaretakerProfile(req.session.user.username, req.body, (result) => {
            console.log("Edit profile Result: ")
            console.log(result);
        });
    }
    res.redirect('profile');
});

router.get('/addtype', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isCaretaker) {
            res.render('addtype', { 
                title: 'Add Pet Type', 
                cookie: req.session, 
                error: "" 
            });
        } else {
            res.redirect('/');
            // Redirect to sink hole
        }
    }
}).post('/addtype', function (req, res, next) {
    editProfileController.addType(req.session.user.username, req.body, (result, err) => {
        console.log(result);
        if (err != "") {
            console.log(err);
            res.render('addtype', { 
                title: 'Add Pet Type', 
                cookie: req.session, 
                error: err 
            });
        } else {
            res.redirect('/profile');
        }
    });
});

router.get('/ct/:type/set', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isCaretaker) {
            const { type } = req.params;
            res.render('setprice', { 
                title: 'Set Price', 
                cookie: req.session, 
                type: type, 
                error: "" 
            });
        } else {
            res.redirect('/');
            // Redirect to sinkhole
        }
    }
}).post('/ct/:type/set', function (req, res, next) {
    const { type } = req.params;
    editProfileController.setPrice(req.session.user.username, req.body, type, (result, err) => {
        console.log(result);
        if (err != "") {
            console.log(err);
            res.render('setprice', { title: 'Set Price', 
                cookie: req.session, 
                type: type, 
                error: err 
            });
        } else {
            res.redirect('/profile');
        }
    });
});

router.get('/pastorders', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isOwner) {
            petownerController.showPastOrders(req.session.user.username, (data) => {
                var currOrders = [];
                var pastOrders = [];

                data.forEach(function (item, index) {
                    if (item.is_completed) {
                        pastOrders.push(item);
                    } else {
                        currOrders.push(item);
                    }
                });

                res.render('pastorders_po', {
                    title: 'Past Orders',
                    cookie: req.session,
                    currOrders: currOrders,
                    pastOrders: pastOrders
                });
            })
        } else if (req.session.user.isCaretaker) {
            caretakerController.showPastOrders(req.session.user.username, (data) => {
                caretakerController.showSummary(req.session.user.username, (dataS) => {
                    console.log(dataS);
                    var currOrders = [];
                    var pastOrders = [];

                    data.forEach(function (item, index) {
                        if (item.is_completed) {
                            pastOrders.push(item);
                        } else {
                            currOrders.push(item);
                        }
                    });
                    res.render('pastorders_ct', {
                        title: 'Past Orders',
                        cookie: req.session,
                        currOrders: currOrders,
                        pastOrders: pastOrders,
                        dataS: dataS
                    });
                })
            })
        } else {
            res.redirect('/');
            // Redirect to sinkhole
        }
    }
});

router.post('/ct/:name/:pouname/:day/:month/:year/paid', function (req, res, next) {
    caretakerController.updatePaid(req, (result) => {
        console.log("Update paid Result: ")
        console.log(result);
    });
    res.redirect("/pastorders")
})

router.post('/ct/:name/:pouname/:day/:month/:year/completed', function (req, res, next) {
    caretakerController.updateCompleted(req, (result) => {
        console.log("Update completed Result: ")
        console.log(result);
    });
    res.redirect("/pastorders")
})

router.get('/po/:name/:day/:month/:year/:ctuname/review', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        petownerController.showOrder(req, (data, name, day, month, year, ctuname) => {
            res.render('rate_review', {
                title: 'Rate and Review Care Taker', 
                cookie: req.session, 
                data: data, 
                name: name, 
                day: day, 
                month: month, 
                year: year, 
                ctuname: ctuname
            });
        });
    }
}).post('/po/:name/:day/:month/:year/:ctuname/review', function (req, res, next) {
    petownerController.postReview(req.session.user.username, req.body, req.params, (result) => {
        console.log("Review and rate result: ")
        console.log(result);
    });
    res.redirect('/pastorders');
});

router.get('/pet/:petname/update', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        petController.trackPet(req, (data, petname) => {
            res.render('petupdate', {
                title: 'Pet Update', 
                cookie: req.session, 
                data: data, 
                petname: petname
            });
        });
    }
}).post('/pet/:petname/update', function (req, res, next) {
    petController.editPet(req.session.user.username, req.body, req.params, (result) => {
        console.log("Edit pet Result: ")
        console.log(result);
    });
    res.redirect('/profile');
});

router.get('/petadd', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        res.render('petadd', { 
            title: 'Add Pet', 
            cookie: req.session, 
            error: "" 
        });
    }
}).post('/petadd', function (req, res, next) {
    petController.addPet(req.session.user.username, req.body, (result, err) => {
        // If pet exists already, trigger will return error
        if (err != "") {
            console.log(err);
            res.render('petadd', { 
                title: 'Add Pet', 
                cookie: req.session, 
                error: err 
            });
        } else {
            res.redirect('/profile');
        }
    });
});

router.post('/pet/:petname/delete', function (req, res, next) {
    petController.deletePet(req, (result) => {
        console.log("Delete pet Result: ")
        console.log(result);
    });
    res.redirect("/profile");
});

router.get('/getmonthlyreport', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isAdmin) {
            res.render('getmonthlyreport', { 
                title: 'Get Monthly Report', 
                cookie: req.session
            });
        } else {
            res.redirect('/');
            // Redirect to sinkhole
        }
    }

}).post('/getmonthlyreport', function (req, res, next) {
    req.session.month = req.body.month;
    req.session.year = req.body.year;
    res.redirect('monthlyreport');
});

router.get('/monthlyreport', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isAdmin) {
            adminController.getMonthlyCtReport(req.session.month, req.session.year, (dataC) => {
                adminController.getMonthlyReport(req.session.month, req.session.year, (data) => {
                    res.render('monthlyreport', {
                        title: 'Monthly Report', 
                        cookie: req.session, 
                        month: req.session.month, 
                        year: req.session.year, 
                        dataC: dataC, 
                        data: data
                    });
                })
            })
        } else {
            res.redirect('/');
            // Redirect to sinkhole
        }
    }
});

router.get('/addAvailability', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        res.render('addAvailability', { 
            title: 'Add Availability', 
            cookie: req.session, 
            msg: "" 
        });
    }
}).post('/addAvailability', function (req, res, next) {
    caretakerController.addAvailability(req.session.user.username, req.body, (msg) => {
        if (msg != "Success!") {
            res.render('addAvailability', { 
                title: 'Add Availability', 
                cookie: req.session, 
                msg: msg 
            });
        } else {
            res.redirect('/profile');
        }
    });
});

router.get('/applyleave', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isCaretaker) {
            res.render('applyleave', { 
                title: 'Apply Leave', 
                cookie: req.session, 
                msg: "" 
            });
        } else {
            res.redirect('/');
            // Redirect to sinkhole
        }
    }
}).post('/applyleave', function (req, res, next) {
    caretakerController.applyleave(req.session.user.username, req.body, (msg) => {
        if (msg != "Success!") {
            res.render('applyleave', { 
                title: 'Apply Leave', 
                cookie: req.session, 
                msg: msg 
            });
        } else {
            res.redirect('/profile');
        }
    });
});

router.get('/summary', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user && req.session.user.isAdmin) {
            adminController.getMthSummary((data) => {
                adminController.getSummary((dataT, dataP, dataPd, dataS, dataE, dataPf) => {
                    res.render('summary', {
                        title: 'Summary', 
                        cookie: req.session, 
                        data: data,
                        dataT: dataT, 
                        dataP: dataP, 
                        dataPd: dataPd, 
                        dataS: dataS, 
                        dataE: dataE, 
                        dataPf: dataPf
                    });
                })
            })
        } else {
            res.redirect('/');
            // Redirect to sinkhole
        }
    }
});

router.get('/addadmin', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isAdmin) {
            res.render('add_admin', { 
                title: 'Add New Admin', 
                cookie: req.session, 
                msg: "" 
            });
        }
    }
}).post('/addadmin', function (req, res, next) {
    adminController.addAdmin(req.body, (result, msg) => {
        console.log("Add admin Result: ")
        console.log(result);
        console.log(msg);
        res.render('add_admin', { 
            title: 'Add New Admin', 
            cookie: req.session, 
            msg: msg 
        });
    });
});

router.get('/addcaretaker', function (req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isAdmin) {
            res.render('add_caretaker', { 
                title: 'Add New Care Taker', 
                cookie: req.session, 
                msg: "" 
            });
        }
    }
}).post('/addcaretaker', function (req, res, next) {
    adminController.addCaretaker(req.body, (msg) => {
        res.render('add_caretaker', { 
            title: 'Add New Care Taker', 
            cookie: req.session, 
            msg: msg 
        });
    });
});

router.get('/switch', function (req, res, next) {
    console.log(req.session.user.isCaretaker);
    console.log(req.session.user.isOwner);

    if (!req.session.authenticated) {
        res.redirect('/login?redirect=' + req.url);
    } else {
        if (req.session.user.isPOCT) {
            req.session.user = userController.changeUser(req.session.user);
            console.log(req.session.user.isCaretaker);
            console.log(req.session.user.isOwner);
            console.log(req.session.user.isPOCT);
            res.redirect('/');
        } else {
            res.redirect('/');
            // Redirect to sinkhole
        }
    }
});

module.exports = router;
