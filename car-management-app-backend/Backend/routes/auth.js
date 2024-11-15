const express=require('express');
const router=express.Router();
const User=require('../models/User');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

router.post('/register',async(req,res)=>{
    const {username,email,password}=req.body;
    try {
        let user=await User.findOne({email});
        if(user){return res.status(400).json({message:'User Alredy Exist'})};
        user=new User({username,email,password});
        await user.save();
        console.log("testing 2");
        console.log("User ID",user.id || user._id);
        const payload={user:{id:user._id || user.id}};
        console.log(payload,"before signing");
        const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1h'});
        console.log("testing 3");
        res.json({token});
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.post('/login',async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await User.findOne({email});
        if(!user){return res.status(400).json({message:'Invalid Credential'})};
        const isMatch=await bcrypt.compare(password, user.password);
        if(!isMatch){return res.status(400).json({message:'Invalid Credential'})};

        const payload={user:{id: user.id}};

        const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1h'});
        res.json({token});

    } catch (error) {
        res.status(500).send('Server errror');
    }
});
// Logout Route
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

module.exports=router


