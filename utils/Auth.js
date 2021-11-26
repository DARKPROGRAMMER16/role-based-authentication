const bcrypt = require('bcryptjs');
const jwt =  require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User.js');

const {SECRET} = require('../config/index.js');


// A function to registger (Admin,Super-Admin,User).
const userRegister = async(userDets,role,res) => {
    // validate the user

    try {
        let usernameNotTaken = await(validateUsername(userDets.username));
        if(!usernameNotTaken){
            return res.status(400).json({
                message: 'Username already taken',
                success:false
            })
        }
    
        // validate the email
        let emailNotRegistered = await(validateEmail(userDets.email));
        if(!emailNotRegistered){
            return res.status(400).json({
                message: 'Email is already in use',
                success:false
            })
        }
    
        // get the hashed password
        const password = await bcrypt.hash(userDets.password,12);
    
        // Create a new User
        const newUser = new User({
            ...userDets,
            password,
            role
        });
        await newUser.save();
    
        return res.status(201).json({
            message: 'User created successfully',
            success: true
        });

    } catch (err) {
        // implement logger function
        // console.log(err.message);
        return res.status(500).json({
            message: 'Unable to create account',
            success: false
        });

    }
};


// A function to login (Admin,Super-Admin,User).
const userLogin = async(userCreds,role,res) => {

    let { username,password } = userCreds;

    // checking if the user is there or not...
    const user = await User.findOne({username})
    if(!user){
        return res.status(403).json({
            message:"User not found ! Invalid login credentials",
            success:false
        });
    }

    // check if user is valid or not 
    if(user.role !== role){
        return res.status(403).json({
            message:"Please make sure you are logging through right portal.",
            success:false
        });
    }

    // Now check for password match if the user is valid
    let isMatch = await bcrypt.compare(password,user.password);
    if(isMatch){
        // sign it to the token and issue it to the user
        let token = jwt.sign({
            user_id:user._id,
            role:user.role,
            username:user.username,
            email:user.email
        },
        SECRET,
        {expiresIn:'7 days'}
        );

        let result = {
            username:user.username,
            role:user.role,
            email:user.email,
            token:`Bearer ${token}`,
            expiresIn:168
        }

        return res.status(200).json({
            ...result,
            message:"Hurray! You are now logged in",
            success:true
        })
    }
    else{
        return res.status(403).json({
            message:"Incorrect password! please try again",
            success:false
        });
    }
}

const validateUsername = async username => {
    let user = await User.findOne({username});
    return user ? false : true;
}

const validateEmail = async email => {
    let user = await User.findOne({email});
    return user ? false : true;
}


// passport middleware
const userAuth = passport.authenticate("jwt", {session:false});


// serialize user
const serializeUser = user => {
    return {
        role:user.role,
        username:user.username,
        email:user.email,
        name:user.name,
        _id:user._id,
        updatedAt:user.updatedAt,
        createdAt:user.createdAt
    }
}


// Check role Middleware
const checkRole = roles => (req,res,next) => 
    !roles.includes(req.user.role)
        ?res.status(401).json("UnAuthorised")
            :next();
// {
//     if(roles.includes(req.user.role)){
//         return next();
//     }
//     return res.status(401).json({
//         message:"UnAuthorised",
//         success:false
//     })
// }


// get all data of user roles
const get_all_users = async(res) => {
    try {

        const a_users = await User.find({role:"user"});
        res.status(200).json(a_users);
        
    } catch (err) {
        return res.status(500).json({
            message:"Internal server error",
            success:false
        })
    }
}

const get_all_users_admin = async(res) => {
    try {

        const a_users_admin = await User.find({role:["user","admin"]})
        res.status(200).json(a_users_admin);
        
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message:"Internal server error",
            success:false
        })
    }
}

module.exports = {
    get_all_users,
    get_all_users_admin,
    checkRole,
    userAuth,
    userLogin,
    userRegister,
    serializeUser
}