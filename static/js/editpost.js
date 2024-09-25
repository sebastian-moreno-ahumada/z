function setupEditPost(){
    //check local storage, if nothing is set return to home page. User hardcoded url???
    let oldContent = localStorage.getItem('old-content');
    localStorage.removeItem('old-content'); //no longer need to store
    let postID = localStorage.getItem('edited-postID');
    if(!oldContent || !postID){
        window.location.href = "/";
        return
    }
    // fill text area with old content
    let textarea = document.getElementById('new-post-content');
    textarea.value = oldContent;

    // set event listener for button edit button
    editBtn = document.getElementById('new-post-button');
    editBtn.addEventListener('click', editPost);
}

async function editPost(){
    // can assume we have token do to caneditpost.js work
    let userAuthToken = localStorage.getItem('token');
    // get new data for post in text area
    let postID = localStorage.getItem('edited-postID');
    let newContent = document.getElementById('new-post-content').value;
    if(newContent === '' || newContent.trim() === ''){
        window.alert("Posts cannot be empty or whitespace. Please Try Again");
        return;
    }
    if(newContent.length > 200){
        window.alert("Post is to large. Please make it smaller than 200 characters");
        return;
    }
    // make call to endpoint for updating post content and date edited
    const fetchOptions = {
        method: "PUT",
        headers: {
        "Content-Type": "application/json",
        "x-auth": userAuthToken
        },
        body: JSON.stringify({ newContent: newContent, postID: postID})
    };
    const response = await fetch("http://localhost:4131/posts/edit", fetchOptions);
    const resjson = await response.json();
    //post was succesful for the user
    if(response.ok){
        localStorage.removeItem('edited-postID'); //no longer need to store
        window.alert("Edit Successful!");
        window.location.href = '/';
    }
    else{
        //print out the error that was returned from the json
        window.alert(resjson.error);
    }
}

//setupEditPost is ran once the editpost template is fully rendered. 
document.addEventListener('DOMContentLoaded', setupEditPost);