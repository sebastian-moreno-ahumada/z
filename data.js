require('dotenv').config();  // Load environment variables from .env file
const mysql = require('mysql-await');

// Create connection pool using environment variables
var connPool = mysql.createPool({
  connectionLimit: process.env.DB_CONNECTION_LIMIT, // Load connection limit from .env
  host: process.env.DB_HOST,                       // Load host from .env
  user: process.env.DB_USER,                       // Load user from .env
  database: process.env.DB_NAME,                   // Load database name from .env
  password: process.env.DB_PASS                    // Load password from .env
});

//////////////////////////////
/// USER QUERIES
//////////////////////////////
// query for adding users to 'users' table given a username and password
async function addUser(username, password){
  //add error handling? 
  await connPool.awaitQuery('INSERT INTO users (userName, userPassword) VALUES (?, ?)', [username, password]);
}

// query for ensuring a login information matches a row in the 'users' table, returns userID
async function authenticateUser(username, password){
  //add error handling? 
  users = await connPool.awaitQuery('SELECT userID, userPassword FROM users WHERE userName = ?', [username]);
  //Check if a user was returned, compare passwords, and return id for success or -1 for no success.
  for (const user of users) { //currently not checking that username are not duplicated, have to hope that passwords are unique...
    if (password === user.userPassword) {
      // Return the userID if the password matches for jwt unique jwt token hashing
      return user.userID;
    }
  }
  // No matching user found
  return -1;
}

async function getUsername(userID){
  userName = await connPool.awaitQuery('SELECT userName FROM users WHERE userID = ?', [userID]);
  return userName
}


//////////////////////////////
/// POST QUERIES
//////////////////////////////
async function addPost(id, text){
  await connPool.awaitQuery('INSERT INTO posts (posterID, content) VALUES (?, ?)', [id, text]);
}

async function getPostsMostRecent(){
  let posts =  await connPool.awaitQuery('SELECT * FROM posts ORDER BY dateEdited DESC');
  return posts;
}

async function getPostsMostLikes(){
  let posts = await connPool.awaitQuery('SELECT * FROM posts ORDER BY likes DESC');
  return posts;
}

async function getPostWithPostID(postID){
  let post = await connPool.awaitQuery('SELECT * FROM posts WHERE postID = ?', [postID]);
  return post;
}

async function deletePost(postID){
  await connPool.awaitQuery('DELETE FROM posts WHERE postID = ?', [postID]);
}

//increments the like counter for a post by 1
async function likePost(postID){
  await connPool.awaitQuery('UPDATE posts SET likes = likes + 1 WHERE postID = ?', [postID]);
}

//changes the content of a post and updates its edited time
async function editPost(postID, newContent){
    await connPool.awaitQuery('UPDATE posts SET content = ?, dateEdited = CURRENT_TIMESTAMP WHERE postID = ?', [newContent, postID]);
}
module.exports = {addUser, authenticateUser, addPost, getPostsMostRecent, getPostsMostLikes, getUsername, deletePost, getPostWithPostID, likePost, editPost}