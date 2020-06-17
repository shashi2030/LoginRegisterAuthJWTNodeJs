const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
var constants = require('../constants');

router.post("/signup", (req, res, next) => {
    User.findOne({email:req.body.email}, function (err, result) {
        // console.log(err);
        if(result){
            res.status(409).json({err:"already exists"})
        }else{

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if(err) throw err;
            
                   // Set the hashed password and save the model
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    username:req.body.name,
                    password: hash
                });
                user.save().then(result => {
                    return res.status(200).json({
                        message: 'User created'
                    })
                }).catch(err => {
                    return res.status(500).json({
                        error: err
                    })
                });               
                })
             });

        }
    })


});

router.post("/login", (req, res, next) => {
    try {       

        var user = {
            email: req.body.email,
            password: req.body.password
        };
        
        User.findOne({email:user.email}, function (err, result) {

            if(result){
                bcrypt.compare(user.password, result.password, function(errors, response) {
                    if(response){
                        jwt.sign({user}, 'secretkey', {expiresIn: '30s'},  (err, token) =>{
                            res.status(200).json({
                                token,
                                result
                            })
                        });
                    }else{
                        res.status(401).json({ error: 'Wrong Password' }); 
                    }
                })
            }
            if (err) {
                res.status(500).json({ error: constants.INTERNAL_SERVER_ERROR  });
            }
            if (result === null) {
                res.status(401).json({ error: constants.UNAUTHORIZED_USER });
            } 
        })
    } catch (error) {
        res.status(500).json({ error: constants.INTERNAL_SERVER_ERROR});
    }
});

router.post("/users", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'secretkey', (err, authData) =>{
        if(err){
            res.sendStatus(403)
        }else{
            User.find({username:username}, (err, response)=>{
                if(response){
                    res.status(200).json({
                        data:response,
                        authData:authData
                    })
                }
            })
        }
    })
    
})

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>
// Verify Token
function verifyToken(req, res, next){
    // Get the auth header value
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        
        // split at the space
        const bearer = bearerHeader.split(' ');

        // get token from array
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        
        // Forbitten
        res.sendStatus(403)
    }
}
module.exports = router;