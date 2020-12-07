var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require('passport-local'),
    bcrypt      = require('bcrypt-nodejs'),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds")

//requiring routes
var commentRoutes       =require("./routes/comments"),
    campgroundRoutes    =require("./routes/campgrounds"),
    indexRoutes         =require("./routes/index")

mongoose.connect("mongodb://localhost:27017/yelp_camp",{useNewUrlParser:true,useUnifiedTopology: true});
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();    //seed the database

//Passport Configuration

app.use(require("express-session")({
    secret:"Secret is secret only",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use('local-signup', new LocalStrategy({
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, username, password, done) {

    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {

    // find a user whose username is the same as the form's username
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'username' :  username }, function(err, user) {
        // if there are any errors, return the error
        if (err){
            return done(err);
        }

        // check to see if theres already a user with that username
        if (user) {
            req.flash("error","That username is already taken");
            return done(null, false);
        } else {

            // if there is no user with that username
            // create the user
            var newUser            = new User();

            // set the user's local credentials
            newUser.username = req.body.username;
            newUser.password = newUser.generateHash(password);
           
            // save the user
            newUser.save(function(err) {
                if (err)
                    throw err;
                req.flash("success", "Welcome "+ req.body.username);
                return done(null, newUser);
            });
        }

    });    

    });

}));

passport.use('local-login', new LocalStrategy({
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, username, password, done) { // callback with username and password from our form

    // find a user whose username is the same as the form;s username
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'username' :  username }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
            return done(err);

        // if no user is found, return the message
        if (!user){
            req.flash("error","No user found");
            return done(null, false);
        }
        // if the user is found but the password is wrong
        let correctPassword = bcrypt.compareSync(password,user.password);
        if (!correctPassword){
            req.flash("error","Oops! Wrong password");
            return done(null, false);
        }

        // all is well, return successful user
        req.flash("success","Logged In");
        return done(null, user);
    });

}));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

//middleware
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("The YelpCamp Server Has Started!");
});