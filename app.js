if (!process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const dotenv = require('dotenv');
dotenv.config();


const express=require('express');
const mongoose=require('mongoose');
const ejsmate = require('ejs-mate');
const methodOverride = require('method-override');
const path = require('path');
const app=express();
const Community=require('./models/Community.js');
const Post=require('./models/post.js');
const multer = require('multer');
const { storage } = require('./cloudinary');
const { title } = require('process');
const upload = multer({ storage });
const Comment=require('./models/comments.js');
const post = require('./models/post.js');
const session = require('express-session');
const passport = require('passport');
const LocalStratergy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const {isLoggedIn}=require('./public/javascripts/middleware.js');



app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/reddit')
    .then(() => {
        console.log(" mongo connection open");
        console.log("Database connected");
    }).catch((err) => {
        console.log("ERROR");
        console.log(err);
    })


    app.use(cookieParser());
    const sessionConfig = {
        secret: 'thisshouldbeabettersecret!',
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    }
    
    app.use(session(sessionConfig));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStratergy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    
    app.use((req, res, next) => {
        //console.log(req.session);
        res.locals.currentUser = req.user;
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        res.locals.user = req.user;
        next();
    })
    
    app.use('/', userRoutes);


app.get('/r/index',isLoggedIn,async (req,res)=>{
const channels=await Community.find({});
//console.log("current user is "+req.user);
const oo=req.user;

//console.log("oo is "+oo);
//console.log(oo.username);
const gg=oo.username;
res.render('index.ejs',{channels,gg});
 })
    


app.get('/r/createcommunity',async (req,res)=>{
    res.render('new.ejs');
})


app.post('/r/createcommunity',async (req,res)=>{
    const dd=req.body.reddit["title"];
    const ddl=dd.length;
    if(ddl>0){
    const community=new Community(req.body.reddit);
    community.author=req.user._id;
    await community.save();
   // console.log(community);
    console.log("owned by "+community.author);
    req.flash('success','New Community Created');
    res.redirect(`/r/rendershowpage/${community._id}`);
    }else{
        req.flash('error','Cannot Be Empty!');
        res.redirect('/r/createcommunity');
    }
})


app.get('/r/rendershowpage/:id',async (req,res)=>{   
    const community=await Community.findById(req.params.id).populate('post');
     console.log(community._id);
    let post=await Post.find({community:{$in:community._id}}).populate('community');
    console.log( "post is " +post);
   const titles= post.map(f=>f.title);
   const image=post.map(k=>k.images);
   const url=image.map(u=>u[0].url);
   let surl=url.map(a=>a[0].surl);
   const srl=[url];
   const iurl=(srl[0]);
   let cc=[{title:titles},{url:iurl}];
 let postid=post.map(p=>p._id);
 const pid=post.map(i=>i._id);
const authorname=community.author;
const name=await User.findById({_id:authorname});
const hh=name.username;

   res.render('show.ejs',{community,post,titles,image,cc,postid,authorname,hh,pid}); 
    })


app.get('/r/rendershowpage/:id/createpost',upload.array('image'),async (req,res) =>{
    const community=await Community.findById(req.params.id);
    res.render('newpost.ejs',{community});
});


app.post('/r/rendershowpage/:id/createpost',upload.array('image'),async (req,res)=>{
    const community=await Community.findById(req.params.id).populate('post');
    const pp=req.body.post["title"];
    const yy=pp.length;
    if(yy>0){
    const post= new Post(req.body.post);
//post.images='https://res.cloudinary.com/dndrb9od6/image/upload/v1686164775/RedditClone/pdctxxx9nelw1e5auxik.jpg';
    post.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    post.community=community._id;
    community.post.push(post);
    await post.save();
    await community.save();
    res.redirect(`/r/rendershowpage/${community._id}`);
    }else{
        req.flash('error','Cannot Be Empty');
        res.redirect(`/r/rendershowpage/${community._id}`);
    }
})



app.get('/r/comments/:postid/createcomment',async(req,res) =>{
    const post=await Post.find({});
    let pid=post.map(m =>m._id);
    const id=req.params.postid;
    res.render('comment.ejs',{pid,post,post,id});
})


app.post('/r/comments/:postid',async (req,res)=>{
    console.log("creating commment post id is"+ req.params.postid);
    const hh=req.params.postid;
    const cc=req.body.comment["title"];
    const ccy=cc.length;
    if(ccy>0){
    const comment= new Comment(req.body.comment);
    const post= await Post.findById(req.params.postid).populate('comment');
    post.comment.push(comment);
    await comment.save();
    await post.save();
    const cp=req.params.postid;
   // console.log("cp is "+cp);   
   res.redirect(`/r/${cp}/showcomments`);
    }else{
        req.flash('error','Cannot Be Empty');
        res.redirect(`/r/comments/${hh}/createcomment`);
    }
})


app.get('/r/:postid/showcomments',async (req,res)=>{
    const posts= await Post.findById(req.params.postid);
 //   console.log(posts);
    const cms=posts.comment;
  //  console.log("cms is "+cms);
    const coms=cms.map(m=>m._id);
   const findc= await Comment.find({_id:coms});


   let post=await Post.findById({_id:req.params.postid});
 //  console.log("post is "+post);
 //  console.log("community id  is "+post.community);
   const yy=post.community;
   console.log("community name is "+yy);
   const comm=await Community.findById({_id:yy});
   const rr=comm.author;
   const name=await User.findById({_id:rr});
   const cname=name.username;
   console.log(cname);
   console.log(req.session.user);

    res.render('showcomment',{posts,findc,yy,cname,comm});
});



app.get('/r/:postid/showcomments',async (req,res)=>{
    res.render('showcomments.ejs');
})

app.get('/testimage',(req,res)=>{
    res.render('testimage.ejs');
})



app.delete('/r/:postid/deletecomment/:cid',async(req,res)=>{
    const {postid,cid}=req.params;
    await Post.findByIdAndUpdate(postid,{$pull:{comment:cid}});
    await Comment.findByIdAndDelete(cid);
    req.flash('error','Comment Deleted');
  //  console.log('hi');
   // console.log("post id is "+postid);
   // console.log("comment id is "+cid);
    res.redirect(`/r/${postid}/showcomments`);
})

app.get('/r/getallposts',async(req,res)=>{
    const post=await Post.find({});
    console.log("all post are "+post);
    const postc=post.map(o =>o.community);
    console.log("postc is " +postc);
    let gg=await Community.find({_id:postc});
    console.log(gg);
    const ft=gg.map(p =>p.title);
    console.log(ft);
  
    res.render('allposts',{post,postc,ft});
})






// app.get('/',(req,res)=>{
// res.send("Hi from reddit");
// })




app.listen(3000,()=>{
    console.log("Serving on port 3000");
})