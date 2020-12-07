var express = require("express");
var router  = express.Router();
var passport= require("passport");
var User    = require("../models/user");

//root route
router.get("/",function(req,res){
    res.render("landing");
});

//===================
//AUTHENTICATION ROUTES
//====================

// show register form (sign up form)
router.get("/register", function(req, res){
    res.render("register"); 
 });

//handle sign up logic

router.post("/register",passport.authenticate("local-signup",{
    successRedirect: "/campgrounds",
    failureRedirect: "/register"
}),function(req,res){
});

//show login form
router.get("/login",function(req,res){
    res.render("login");
});
//handling login logic
router.post("/login",passport.authenticate("local-login",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}),function(req,res){
});

//logout route
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged you out")
    res.redirect("/campgrounds");
});

module.exports  = router;