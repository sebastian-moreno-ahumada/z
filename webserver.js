// Configure the server and use express
const express = require('express');
const app = express();
const port = 4131;

//import data.js methods
const data = require("./data")

// Apply middleware for parsing body for http requests
app.use(express.urlencoded({ extended: true }));

// Apply middleware for receiving and send JSON formatted data 
app.use(express.json());

// Set the view for where to render out pug templates
app.set("views", "templates");
app.set("view engine", "pug");

// Configure basic GET for serving
app.use("/css", express.static("static/css")); //css files
app.use("/js", express.static("static/js")); //js files
app.use("/images", express.static("static/images")); //image files


//////////
///JWT user authentication imports (user login/logout w jwt and local storage from zybook readings)
//////////
const jwt = require("jwt-simple");
const secret = "f34f1340g91j34g3o";
////////////////////////
///Helper Functions
////////////////////////

// TODO:
//  Validates that neccessary information for registrations is available, not empty, and not garbage data
async function registerProcess(registerDictionary){
    // procces the username
    console.log(registerDictionary);
    if(typeof registerDictionary.username !== 'string' || registerDictionary.username === '' || registerDictionary.username.trim() === ''){
        console.log("invalid username");
        return false; // Invalid username
    }

    // process the password
    if(typeof registerDictionary.password !== 'string' || registerDictionary.password === '' || registerDictionary.password.trim() === ''){
        console.log("invalid password");
        return false; // Invalid password
    }
    //Further processing? add specifications?

    //all information neccessary is present and valid for registration
    //add new user to the database.
    await data.addUser(registerDictionary.username, registerDictionary.password);
    return true;
}

function xssCleaning(input) { // replace vulnerable characters for xss attacks with html tags. Seems like express does encodes already aswell with req.body and req.query
    input = input.replace(/&/g, "&amp;");
    input = input.replace(/</g, "&lt;");
    input = input.replace(/>/g, "&gt;");
    input = input.replace(/"/g, "&quot;");
    return input;
}

//TODO:
// Take in a date string, use parsedate, depending on how long ago it was edited,
//  return string a string with either seconds || minutes || hours || days || or weeks 
function dateString(postedDate){
    let postTimeStamp = Date.parse(postedDate);
    let currentTimeStamp = Date.now();
    let secondsSince = (currentTimeStamp - postTimeStamp) / 1000;
    //constants for finding a time
    const minuteInSeconds = 60;
    const hourInSeconds = 3600;
    const dayInSeconds = 86400;
    const weekInSeconds = 604800;

    if(secondsSince < minuteInSeconds) {
        return "less than a minute ago";
    }
    else if(secondsSince < hourInSeconds) {
        let minutes = Math.floor(secondsSince / minuteInSeconds);
        if (minutes === 1) {
            return minutes + " minute ago";
        } else {
            return minutes + " minutes ago";
        }
    }
    else if(secondsSince < dayInSeconds) {
        let hours = Math.floor(secondsSince / hourInSeconds);
        if (hours === 1) {
            return hours + " hour ago";
        } else {
            return hours + " hours ago";
        }
    }
    else if(secondsSince < weekInSeconds) {
        let days = Math.floor(secondsSince / dayInSeconds);
        if (days === 1) {
            return days + " day ago";
        } else {
            return days + " days ago";
        }
    }
    else {
        let weeks = Math.floor(secondsSince / weekInSeconds);
        if (weeks === 1) {
            return weeks + " week ago";
        } else {
            return weeks + " weeks ago";
        }
    }
}

////////////////////////
///GET REQUESTS
////////////////////////
app.get("/", async (req, res) => {
    // Post Ordering
    let posts;
    let order;
    if(req.query.order){
        if(req.query.order === 'time'){
            posts = await data.getPostsMostRecent();
            order = 'time';
        }
        else if(req.query.order === 'likes'){
            posts = await data.getPostsMostLikes();
            order = 'likes';
        }
        else{ //default ordering, still find page even though given wrong query value
            posts = await data.getPostsMostRecent();
            order = 'time';
        }
    }
    else{ //default ordering
        posts = await data.getPostsMostRecent();
        order = 'time';
    }

    // Post Pagination
    possiblePages = Math.ceil(posts.length / 10);
    let page = parseInt(req.query.page ?? 1);
    // check for invalid page numbers to avoid a 404 or have/blank page 
    if (!page || page < 1) { //check for NaN on a bad parse
        page = 1;
    }
    else if(page > possiblePages){
        page = possiblePages;
    }
    let offset = (page-1)*10;
    let totalNumberOfPosts = posts.length;
    posts = posts.slice(offset, offset+10);
    // Get the username for each post based on posterID 
    for (post of posts){
        queryRow = await data.getUsername(post.posterID);
        post.username = queryRow[0].userName;
    }

    //given an invalid page number
    if(page !== 1 && posts.length === 0){
        res.status(404).send("404 Not Found!")
        return
    }
    //render pug for next page or previous page based on booleans
    let tenBefore = true;
    let tenAfter = true;
    if(page === 1){ //first page, no previous posts
        tenBefore = false;
    }
    if(page >= possiblePages){ //if on last possible page, no next posts
        tenAfter = false;
    }
    
    //fix the date to be readable for users depending how long its been
    for (post of posts){
        post.timeReference = dateString(post.dateEdited);
    }

    //render posts based on information
    res.render('viewposts', {posts, order, page, tenBefore, tenAfter});
})

app.get("/make", (req, res) => {
    res.render('makepost');
})

app.get("/login", (req, res) => {
    res.render('login');
})

app.get("/register", (req, res) => {
    res.render('register');
})

app.get("/editpost", (req, res) => {
    res.render('editpost');
})

// checks to see if user token matches the user id of the person who made a post
app.get("/user-match", (req, res) => {
    console.log(req.query.posterID);
    let posterID = parseInt(req.query.posterID);
    if(!req.query.posterID || isNaN(posterID)){
        res.status(400).json({ error: "missing/incorrect posterID as query parameter"});
        return;
    }
    if (!req.headers["x-auth"]){
        res.status(401).json({error: "Missing X-Auth header"});
        return;
    }
    let token = req.headers["x-auth"];
    let decodedToken;
    try {
       decodedToken = jwt.decode(token, secret);
       console.log("decoded user token: " + decodedToken.userID);
    }
    catch (ex) {
       res.status(401).json({ error: "Invalid JWT" });
       return;
    }
    //return boolean representing if the posterID matches currently logged in person
    if(decodedToken.userID != posterID){
        res.json({ isMatch: false});
        return;
    }
    else{
        res.json({ isMatch: true});
        return;
    }
})

////////////////////////
///POST REQUESTS
////////////////////////

//TODO: endpoint for registering a user; expects json body with keys: username and password
//wont handle user auth, simply just get their info into the database (jwt)
//  -takes in a json with 2 things, username and password keys. 
app.post("/register", async (req, res) => {
    console.log(req.body);
    //check to see if we received json
    if(req.get('Content-Type') != 'application/json'){
        res.status(400);
        res.set('Content-Type', 'text/plain');
        res.send('Content-Type header is either not present or incorrect for the POST request for /register endpoint');
        return;
    }
    //check to see if 'username' and 'password' keys are present
    if(req.body.username == undefined || req.body.password == undefined){
        res.status(400);
        res.set('Content-Type', 'text/plain');
        res.send('Missing \'username\' key and/or \'password\' keys within the request JSON for the POST to /register endpoint');
        return;
    }
    //process the username and password
    let successfulRegister = await registerProcess(req.body);
    console.log(successfulRegister);
    if (successfulRegister){
        res.status(200);
        res.set('Content-Type', 'text/plain');
        res.send('succesful user registration');
        return;
    }
    else{
        res.status(400);
        res.set('Content-Type', 'text/plain');
        res.send('un-succesful login due to username and password parameters');
        return;
    }
})

//TODO: have a user login/authenticated
//  Expect json with keys: username and password to check the database  
//  Give back a jwt token for the browser to store and allow user specific tasks (delete and edit)
app.post("/auth", async (req, res) => {
    if(req.get('Content-Type') != 'application/json'){
        res.status(400).json({ error: "expecting JSON for request body"});
        return;
    }
    //make sure given neccessary headers
    if (req.body.username === undefined || req.body.password === undefined) {
        res.status(400).json({ error: "missing key(s) username/password in JSON"});
        return;
    }
    //checks users table to see if user is present with correct credentials
    console.log(req.body.username);
    console.log(req.body.password);
    let userId = await data.authenticateUser(req.body.username, req.body.password);
    if(userId !== -1) {
        // Send back a token that contains the user's username
        const token = jwt.encode({userID: userId}, secret);
        res.json({ token: token });
        return;
    }
    else {
        // Unauthorized access
        res.status(401).json({ error: "Bad username/password" }); 
        return;  
    }
})

//TODO: endpoint to create a post for user
//  Expects a header 'x-auth' for seeing if the user is logged in
//  Expects content type to be application/json
//      json should have key content, string containing user post
app.post("/posts/new", async (req, res) => {
    // See if the X-Auth header is set
    if (!req.headers["x-auth"]){
        res.status(401).json({error: "Missing X-Auth header"});
        return;
    }

    // X-Auth should contain the token and be valid when uncoded
    const token = req.headers["x-auth"];
    let decodedToken;
    try {
       decodedToken = jwt.decode(token, secret);
       console.log("decoded user token: " + decodedToken.userID);
    }
    catch (ex) {
       res.status(401).json({ error: "Invalid JWT" });
       return;
    }

    //check to see if content type is correct and we are given content for the new post
    if(req.get('Content-Type') != 'application/json'){
        res.status(400).json({ error: "expecting Content-Type \'application/json\'" });
        return;
    }
    if(req.body.content === undefined){
        res.status(400).json({ error: "missing key \'content\' in JSON" });
        return;
    }
    if(typeof req.body.content !== 'string' || req.body.content.length > 200){
        res.status(400).json({ error: "\'content\' needs to be string and cannot exceed 200 characters" });
        return;
    }
    //req.body.content = xssCleaning(req.body.content); //clean post information to avoid xss attacks
    await data.addPost(decodedToken.userID, req.body.content);
    res.json({ message: 'successful post' });
 });


////////////////////////
///DELETE REQUESTS
////////////////////////

app.delete("/posts/delete", async (req, res) => {
    // See if the X-Auth header is set
    if (!req.headers["x-auth"]){
        res.status(401).json({error: "Missing X-Auth header"});
        return;
    }

    // X-Auth should contain the token and be valid when uncoded
    const token = req.headers["x-auth"];
    let decodedToken;
    try {
       decodedToken = jwt.decode(token, secret);
       console.log("decoded user token: " + decodedToken.userID);
    }
    catch (ex) {
       res.status(401).json({ error: "Invalid JWT" });
       return;
    }

    // check for valid json 
    if(req.get('Content-Type') != 'application/json'){
        res.status(400).json({ error: "expecting Content-Type \'application/json\'" });
        return;
    }
    // the check for expected key-value fields (postID, and posterID)
    if(req.body.postID === undefined || req.body.posterID === undefined){
        res.status(400).json({ error: "missing JSON key(s) \'postID\' and/or \'posterID\'" });
        return;
    }
    // check that the decodedToken.userID(user logged in) matches posterID(user that made the post)
    if(decodedToken.userID != req.body.posterID){
        res.status(401).json({ error: "decoded jwt token does not match posterID"});
        return;
    }
    // check to see that the postID wanting to be deleted exists in table posts
    post = await data.getPostWithPostID(req.body.postID);
    if(post.length < 1){
        res.status(400).json({ error: "given postID does not match any posts in \'posts\' table"});
        return;
    }

    await data.deletePost(req.body.postID);
    res.json({ message: 'successful delete' });
    return;
})

////////////////////////
///PUT REQUESTS
////////////////////////
app.put("/posts/like", async (req, res) =>{
    // expecting valid jws token
    if (!req.headers["x-auth"]){
        res.status(401).json({error: "Missing X-Auth header"});
        return;
    }
    // X-Auth should contain the token and be valid when uncoded
    const token = req.headers["x-auth"];
    let decodedToken;
    try {
       decodedToken = jwt.decode(token, secret);
       console.log("decoded user token: " + decodedToken.userID);
    }
    catch (ex) {
       res.status(401).json({ error: "Invalid JWT" });
       return;
    }
    // expecting JSON with the respecitve post ID
    //check to see if content type is correct and we are given content neccesary content for liking post
    if(req.get('Content-Type') != 'application/json'){
        res.status(400).json({ error: "expecting Content-Type \'application/json\'" });
        return;
    }
    if(req.body.postID === undefined){
        res.status(400).json({ error: "missing key \'postID\' in JSON" });
        return;
    }
    //check to see if postID is in database.
    post = await data.getPostWithPostID(req.body.postID);
    if(post.length < 1){
        res.status(400).json({ error: "given postID does not match any posts in \'posts\' table"});
        return;
    }

    //update 'like' value for post with postID 
    await data.likePost(req.body.postID);
    res.json({ message: 'successful like' });
    return;
})

app.put("/posts/edit", async (req, res) => {
    //REMOVE THE token work?????
    // expecting valid jws token
    if (!req.headers["x-auth"]){
        res.status(401).json({error: "Missing X-Auth header"});
        return;
    }
    // X-Auth should contain the token and be valid when uncoded
    const token = req.headers["x-auth"];
    let decodedToken;
    try {
       decodedToken = jwt.decode(token, secret);
       console.log("decoded user token: " + decodedToken.userID);
    }
    catch (ex) {
       res.status(401).json({ error: "Invalid JWT" });
       return;
    }
    // expecting JSON with the respecitve postID
    //check to see if content type is correct and we are given content neccesary content for liking post
    if(req.get('Content-Type') != 'application/json'){
        res.status(400).json({ error: "expecting Content-Type \'application/json\'" });
        return;
    }
    if(req.body.postID === undefined){
        res.status(400).json({ error: "missing key \'postID\' in JSON" });
        return;
    }
    //check to see if postID is in database.
    post = await data.getPostWithPostID(req.body.postID);
    if(post.length < 1){
        res.status(400).json({ error: "given postID does not match any posts in \'posts\' table"});
        return;
    }
    // check to see if newContent is given
    if(req.body.newContent === undefined){
        res.status(400).json({ error: "missing key \'newContent\' in JSON" });
        return;
    }
    // check to see if newContent is valid
    if(typeof req.body.newContent !== 'string' || req.body.newContent.length > 200){
        res.status(400).json({ error: "\'newContent\' needs to be string and cannot exceed 200 characters" });
        return;
    }
    //req.body.newContent = xssCleaning(req.body.newContent); // clean content to avoid xss attacks
    // everything is valid, make the changes in the database
    await data.editPost(req.body.postID, req.body.newContent);
    res.json({ message: 'successful edit' });
    return;
})


app.use((req, res, next) => {
    res.status(404).send("404 Not Found!")
})

// Configure the server to listen to port 4131
app.listen(port , () => {
    console.log(`Listening on port ${port}`)
})