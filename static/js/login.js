async function userLoginFetch(){
    // retrieve username password fields 
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    //check username or password for being present or too short or too long?.
    if(username === '' || username.trim() === ''){
        window.alert("Please enter a username");
        return;
    }
    if(password === '' || password.trim() === ''){
        window.alert("Please enter a password");
        return;
    }

    //prep for making a post request in order to validate the user trying to login 
    const fetchOptions = {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
    };
    // make the request to the endpoint
    const response = await fetch("http://localhost:4131/auth", fetchOptions);
    
    const resjson = await response.json();
    //return 200, user has an account with the given credentials
    if (response.ok) {
        // Store the JWT token in user storage
        console.log(resjson);
        localStorage.setItem('token', resjson.token);
        window.alert("Login successful!");
        window.location.href = '/make';
    //returned 401
    } else {
        window.alert("Incorrect username/password. Try Again");
    }
}
let registerButton = document.getElementById("login-button");
registerButton.addEventListener("click", userLoginFetch);
