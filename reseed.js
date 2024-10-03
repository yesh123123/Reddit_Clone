const express = require('express');
const mongoose = require('mongoose');
const Community = require('./models/Community');
const Comment=require('./models/comments');
const Post=require('./models/post')

mongoose.connect('mongodb://127.0.0.1:27017/reddit')
    .then(() => {
        console.log(" mongo connection open");
        console.log("Database connected");
    }).catch((err) => {
        console.log("ERROR");
        console.log(err);
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB=async ()=>{
    await Community.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
}

seedDB().then(() => {
    mongoose.connection.close();
})