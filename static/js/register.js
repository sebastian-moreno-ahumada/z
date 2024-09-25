// TODO: extract the text at (1) id="register-username", (2)id="register-password"
//set event handler on the register buttton
//
//  call the endpoint: POST - '/register'

async function userRegisterFetch(){
    //get username password values within text boxes
    const user = document.getElementById("register-username").value;
    const pass = document.getElementById("register-password").value;
    
    //check username or password for being present or too short or too long?.
    if(user === '' || user.trim() === ''){
        window.alert("Please enter a username");
        return;
    }
    if(pass === '' || pass.trim() === ''){
        window.alert("Please enter a password");
        return;
    }

    const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: user, password: pass})  
    };
    const response = await fetch("http://localhost:4131/register", fetchOptions);
    if(response.ok){
        window.location.href = '/login';
        //redirect to new page
        window.alert("Succesful Registration - Login!");
    }
    else{
        window.alert("Unsuccesful Registration; try again"); 
        document.getElementById("register-username").value = "";
        document.getElementById("register-password").value = "";
    }
}
let registerButton = document.getElementById("register-button");
registerButton.addEventListener("click", userRegisterFetch);