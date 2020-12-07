var mongoose=require("mongoose");
var bcrypt   = require('bcrypt-nodejs');
// var passportLocalMongoose=require("passport-local-mongoose");

var userSchema=new mongoose.Schema({
    username: String,
    password: String
});



// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);