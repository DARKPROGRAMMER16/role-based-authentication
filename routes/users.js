const router  = require('express').Router();

// requiring user register function
const { userRegister,userLogin,userAuth,serializeUser,checkRole } = require('../utils/Auth.js');

// user registration router
router.post('/register-user', async(req,res) => {

    await userRegister(req.body,"user",res);
    
});

// Admin registraton route
router.post('/register-admin', async(req,res) => {

    await userRegister(req.body,"admin",res);
    
});

// Super Admin registrato route
router.post('/register-super-admin', async(req,res) => {

    await userRegister(req.body,"superadmin",res);

});

// user login router
router.post('/login-user', async(req,res) => {

    await userLogin(req.body,'user',res);

});

// Admin login route
router.post('/login-admin', async(req,res) => {

    await userLogin(req.body,'admin',res);

});

// Super Admin login route
router.post('/login-super-admin', async(req,res) => {

    await userLogin(req.body,'superadmin',res);

});

// profile route
router.get('/profile',userAuth, async(req,res) => {
    // console.log(req);
    return res.json(serializeUser(req.user));
})

// user protected router
router.get('/user-protected',userAuth,checkRole(['user']), async(req,res) => {
    return res.json("hello user");
});

// Admin protected route
router.get('/admin-protected',userAuth,checkRole(['admin']), async(req,res) => {
    return res.json("hello admin");
});

// Super Admin protected route
router.get('/super-admin-protected',userAuth,checkRole(['superadmin']), async(req,res) => {
    return res.json("hello superadmin");
});

// Super Admin and Admin protected route
router.get('/super-admin-and-admin-protected',userAuth,checkRole(['superadmin','admin']), async(req,res) => {
    return res.json("hello admin and superadmin");
});



module.exports = router;

