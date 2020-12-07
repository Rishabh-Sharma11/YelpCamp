var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");  //index.js is automatically included

//INDEX - SHOW ALL CAMPGROUNDS
router.get("/",function(req,res){
    Campground.find({},function(err,allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    });
});

//CREATE - ADD NEW CAMPGROUND TO DB
router.post("/",middleware.isLoggedIn,function(req,res){
    var name=req.body.name;
    var price=req.body.price;
    var image=req.body.image;
    var desc=req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground={name:name, price:price ,image:image,description:desc, author:author};
    // campgrounds.push(newCampground);

    //Create a new Campground and save it to database
    Campground.create(newCampground,function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/campgrounds");
        }
    });
    // res.redirect("/campgrounds");
});

//NEW - SHOW FORM TO CREATE NEW CAMPGROUND
router.get("/new",middleware.isLoggedIn,function(req,res){
    res.render("campgrounds/new.ejs");
});

//SHOW - SHOWS MORE INFO ABOUT ONE CAMPGROUND
router.get("/:id",function(req,res){

    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show",{campground:foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id, function(err,foundCampground){
         res.render("campgrounds/edit",{campground: foundCampground});
    }); 
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
    //find and update the required campground and then redirect somewhere(show page)
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership,async(req, res) => {
    try {
      let foundCampground = await Campground.findById(req.params.id);
      await foundCampground.remove();
      res.redirect("/campgrounds");
    } catch (error) {
      console.log(error.message);
      res.redirect("/campgrounds");
    }
  });

module.exports  = router;