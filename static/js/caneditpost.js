async function canEditPost(postID, posterID){
    //check to see if the postID matches current token
    let userAuthToken = localStorage.getItem('token');
    //check to see if user has a token (aka logged in)
    // if not redirect them to login page 
    if(!userAuthToken){
        window.alert("You must log in for this functionality");
        return;
    }
    // prep for making a get request for a boolean representing if the user token matches the posterID
    // give a body with json and header with authorization token
    const fetchOptions = {
        method: "GET",
        headers: {
        "x-auth": userAuthToken
        }
    };
    // add the posterID into the url for get query, encode in case of issues that may arise: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
    const response = await fetch(`http://localhost:4131/user-match?posterID=${encodeURIComponent(posterID)}`, fetchOptions);
    const resjson = await response.json();
    if(response.ok){
        //the user is valid
        if(resjson.isMatch){
            // store old content and postID so that dom mod can take place when page changes
            currentContent = document.getElementById('content-' + postID).textContent;
            localStorage.setItem('old-content', currentContent);
            localStorage.setItem('edited-postID', postID);
            window.location.href = '/editpost';
            return;
        }
        // user is not valid
        else{
            window.alert("Only the user that made this post may edit it");
            return;
        }
    }
    else{ // unexpected error occured
        console.log(resjson.error);
        return;
    }
}