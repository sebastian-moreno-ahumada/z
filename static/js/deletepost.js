async function postDelete(postID, posterID){
    // check to see if person is logged, jws token
    let userAuthToken = localStorage.getItem('token');
    //check to see if user has a token (aka logged in)
    // if not redirect them to login page 
    if(!userAuthToken){
        window.alert("You must login for this functionality");
        return
    }

    // prep for making a get request for a boolean representing if the user token matches the posterID
    // give a body with json and header with authorization token
    const fetchOptions1 = {
        method: "GET",
        headers: {
        "x-auth": userAuthToken
        }
    };
    // add the posterID into the url for get query, encode in case of issues that may arise: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
    const response1 = await fetch(`http://localhost:4131/user-match?posterID=${encodeURIComponent(posterID)}`, fetchOptions1);
    const resjson1 = await response1.json();
    if(response1.ok){
        //the if the user is not valid, do not let them delete
        if(!resjson1.isMatch){
            window.alert("Only the user that made this post may delete it");
            return;
        }
    }
    else{ // unexpected error occured
        console.log(resjson1.error);
        return;
    }

    // neccessary authentication is available for post delete, make a fetch to the endpoint
    const fetchOptions2 = {
        method: "DELETE",
        headers: {
        "Content-Type": "application/json",
        "x-auth": userAuthToken
        },
        body: JSON.stringify({ postID: postID, posterID: posterID })
    };
    // make the request to the endpoint
    const response2 = await fetch("http://localhost:4131/posts/delete", fetchOptions2);
    const resjson2 = await response2.json();
    //post was succesful for the user
    if(response2.ok){ //have dom editing to remove/hide the correct div that is being deleted. currently need to reload the page
        window.alert("Delete Successful!");
        //do dom modification to remove the post dynamically
        let postDiv = document.getElementById(`post-${postID}`);
        postDiv.style.display = 'none';
    }
    else{
        //print out the error that was returned from the json, server error?
        console.log(resjson2.error);
    }
}
// no need for event handler, dynamically rendered page calls this function onClick(postID, posterID)