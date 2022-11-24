const express = require("express");
const router = express.Router()
const mongoose = require("mongoose")
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")

mongoose.set('useFindAndModify', false);
//find all posts
router.get('/allposts',requireLogin, (req, res)=>{
    Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")  //sort in descending order. toshow the latest post first
    .then(posts =>{
        res.json({posts})
    })
    .catch(err =>{console.log(err)})
})

// //find all posts of users whom i follow
// router.get('/followposts',requireLogin, (req, res)=>{
//     Post.find({postedBy:{$in:req.user.following}})   //if postedBy in following
//     .populate("postedBy", "_id name")
//     .populate("comments.postedBy", "_id name")
//     .then(posts =>{
//         res.json({posts})
//     })
//     .catch(err =>{console.log(err)})
// })

//create post
router.post('/createpost',requireLogin, (req, res)=>{
    const {title, body, pic} = req.body
    if(!title || !body || !pic){
      return  res.status(422).json({errror: "please add all fields"})
    }
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then(result =>{
        res.json({post:result})
    })
    .catch(error =>{console.log(error)})
})

//find posts of signed in user
router.get('/profile',requireLogin, (req, res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy", "_id name")
    .then(myposts =>{
        res.json({myposts})
    })
    .catch(err =>{console.log(err)})
})


//likes
router.put('/like',requireLogin, (req, res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}  //this id the user who liked the post... this will add to likes array
    },{
        new:true  //to get updated value
    }).exec((err, result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            res.json(result)
        }
    })
})

//unlike
router.put('/unlike',requireLogin, (req, res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}  // this will remove the user from likes array
    },{
        new:true  //to get updated value
    }).exec((err, result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            res.json(result)
        }
    })
})

//comments
router.put('/comment',requireLogin, (req, res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}  //
    },{
        new:true  //to get updated value
    })
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            res.json(result)
        }
    })
})

router.delete("/deletepost/:postId",requireLogin, (req, res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy", "_id")
    .exec((err, post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then(result =>{
                res.json({result})
            }).catch(err =>{console.log(err)})
        }
    })
})

module.exports = router