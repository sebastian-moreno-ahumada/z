async function postLike(postID){
    //check for user token, *likes on post are NOT associated w/ users but only users can like*
    let userAuthToken = localStorage.getItem('token');
    //check to see if user has a token (aka logged in)
    if(!userAuthToken){
        window.alert("You must login for this functionality");
        return
    }
    //send request to API for liking the post
    const fetchOptions = {
        method: "PUT",
        headers: {
        "Content-Type": "application/json",
        "x-auth": userAuthToken
        },
        body: JSON.stringify({ postID: postID })
    };
    const response = await fetch("http://localhost:4131/posts/like", fetchOptions);
    const resjson = await response.json();
    //if post successful, modify the dom to increment by 1 from its currently set value
    if(response.ok){
        let counter = document.getElementById('like-counter-' + postID);
        let curValue = parseInt(counter.textContent);
        if(!isNaN(curValue)){
            curValue += 1;
            counter.textContent = curValue.toString();
        }
        else{
            console.log('something is wrong with the value of the like counter') //should never print..
        }
    }
    else{
        console.log(resjson.error);
        window.alert("Unable to like the post at this time, try again");
    }
}