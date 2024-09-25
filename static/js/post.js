//TODO: 
//  ensure user has token
//  extract text in the text area, ensure its valid size, clean it (replace apostophes), send to endpoint, redirect page
async function postFetch(){
    let userAuthToken = localStorage.getItem('token');
    //check to see if user has a token (aka logged in)
    // if not redirect them to login page 
    if(!userAuthToken){
        window.alert("Please Log in to make a post!");
        window.location.href = '/login';
        return
    }
    postContent = document.getElementById("new-post-content").value;

    if(postContent === '' || postContent.trim() === ''){
        window.alert("Posts cannot be empty or whitespace. Please Try Again");
        return;
    }
    if(postContent.length > 200){
        window.alert("Post is to large. Please make it smaller than 200 characters");
        return;
    }

    //prep for making a post request to make a new post for the user.
    // give a body with json and header with authorization token
    const fetchOptions = {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "x-auth": userAuthToken
        },
        body: JSON.stringify({ content: postContent})
    };
    const response = await fetch("http://localhost:4131/posts/new", fetchOptions);
    const resjson = await response.json();
    //post was succesful for the user
    if(response.ok){
        window.alert("Post Successful!");
        window.location.href = '/';
    }
    else{
        //print out the error that was returned from the json
        window.alert(resjson.error);
    }
}
let postButton = document.getElementById("new-post-button");
postButton.addEventListener("click", postFetch);
