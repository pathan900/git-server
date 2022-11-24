const express = require("express");
const router = express.Router()
const mongoose = require("mongoose")
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const User = mongoose.model("User")


router.get("/user/:id", requireLogin, (req, res) => {
    User.findOne({ _id: req.params.id })
        .select("-password") //will not send password to front end
        .then(user => {
            Post.find({ postedBy: req.params.id })
                .populate("postedBy", "_id name")
                .exec((err, posts) => {
                    if (err) { return res.status(422).json({ error: err }) }
                    res.json({ user, posts })
                })
        }).catch(err => {
            return res.status(404).json({ error: "User not found" })
        })
})

//for follow and unfollow we have to update followers count of the user we follow and following count of the loggedin user
//follow
router.put("/follow", requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.followId, {
        $push: { followers: req.user._id }
    }, { 
        new: true 
    },(err, result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        User.findByIdAndUpdate(req.user._id, {
            $push:{following:req.body.followId}
        },{
            new: true
        }).select("-password").then(result =>{
            res.json(result)
        }).catch(err =>{
            return res.status(422).json({error: err})
        })
    }
    )
})

//unfollow
router.put("/unfollow", requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, {
        $pull: { followers: req.user._id }
    }, { 
        new: true 
    },(err, result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        User.findByIdAndUpdate(req.user._id, {
            $pull:{following:req.body.unfollowId}
        },{
            new: true
        }).select("-password").then(result =>{
            res.json(result)
        }).catch(err =>{
            return res.status(422).json({error: err})
        })
    }
    )
})

//update profile pic
router.put('/updatepic',requireLogin,(req, res) =>{
    User.findByIdAndUpdate(req.user._id, {$set:{pic:req.body.pic}},{new:true}, (err, result)=>{
        if(err){
            return res.status(422).json({error:"failed"})
        }
        res.json(result)
    })
})

module.exports = router