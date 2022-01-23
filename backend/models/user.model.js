const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please Enter A Name"],
    },
    
    avatar: {
        public_id: String,
        url: String
    },
    
    email: {
        type: String,
        required: [true, "Please Enter An Email"],
        unique: [true, "Email Is Already Exists"]
    },
    
    password: {
        type: String,
        required: [true, "Please Enter An Email"],
        minlength: [6, "Password Must Be At Least 6 Characters"],
        select: false
    },

    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        }
    ],
    
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],

}, 
{ 
    timestamps: true 
});

userSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hashSync(this.password, 10);
    }

    next();
})

userSchema.methods.matchPassword = async function (password) {
    console.log(password, this.password);
    return await bcrypt.compareSync(password, this.password); // true
}

userSchema.methods.generateToken = async function (user) {
    return jwt.sign({user}, process.env.JWT_SECRET);
}

module.exports = mongoose.model('User', userSchema);