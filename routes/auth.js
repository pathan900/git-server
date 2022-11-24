const express = require("express");
const router = express.Router()
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = mongoose.model("User")
const {JWT_SECRET} = require('../keys')
const requireLogin = require('../middleware/requireLogin')

 
// router.get('/protected',requireLogin,(req, res)=>{//if user want to access protected routes then it must varify token.requireLogin token will do the varification 
//     res.send("hello user")
// })

//signup route
router.post('/signup', (req, res) => { 
    const { name, email, password, pic} = req.body
    if (!name || !email || !password) {
        return res.status(422).json({ error: "please fill all fields" })
    }
    User.findOne({ email: email })//search the email in db which the user has entered
        .then((savedUser) => {
            if (savedUser) {         //if the email exists in db then
                return res.status(422).json({ error: "user already exists" })
            }
            bcrypt.hash(password, 12)//hashing the password before saving it to db, bigger the no. (12) more secure hashing, default is 1(0)
                .then((hashedPassword => {
                    const user = new User({ //if the email doesn't exists in db then creating a new user
                        name,
                        email,
                        password:hashedPassword,
                        pic
                    })
                    user.save()  //saving new user to db
                        .then(user => {
                            res.json({ message: "signed up successfully" })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }))


        })
        .catch(err => {
            console.log(err)
        })
})

//signin route
router.post('/signin', (req, res)=>{
    const {email, password} = req.body
    if(!email || !password){
        res.status(422).json({error:"please fill all feilds"})
    }
    User.findOne({email:email}) //search the email in db which the user has entered
    .then(savedUser =>{
        if(!savedUser){  //if the email is not present in db
           return res.status(422).json({error:"User not found"})
        }
        bcrypt.compare(password, savedUser.password) //if the email is present then comparing the password, it will return boolean
        .then(doMatch =>{
            if(doMatch){  //if password matches
               // res.json({message:"successfully signed in"})
               const token = jwt.sign({_id:savedUser._id}, JWT_SECRET) //providing user a token through which user can access protected resources
                const {_id, name, email, following, followers, pic} = savedUser
               res.json({token, user:{_id, name, email, followers, following, pic}})
            }
            else{
                return res.status(422).json({error:"Invalid credentials"})
            }
        })
        .catch(err =>{console.log(err)})
    })
})

module.exports = router;