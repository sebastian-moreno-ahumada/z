// clear out key holding local storage and go to login page
function userLogout(){
    //clear out local storage so that the user no longer has their jws auth token
    localStorage.removeItem('token');
    //redirect to login page
    window.location.href = '/login';
}

// run nav bar adjustments once everything for the html is rendered.
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); //get token
    console.log(token);
    const loginAccessor = document.getElementById('login-link');
    const logoutAccessor = document.getElementById('logout-container');
    const logoutLink = document.getElementById('logout-link');

    //logged in, dont need a login link, need a logout button
    if (token !== null) { //odd solution, but allows websute to swap logout and login links based on being logged in
        console.log('showing logout');
        loginAccessor.style.display = 'none'; 
        logoutAccessor.style.display = 'block';
    }
    //vice-versa
    else {
        loginAccessor.style.display = 'block';
        logoutAccessor.style.display = 'none';
    }
    //listen for a logout button to be clicked
    logoutLink.addEventListener('click', userLogout);
});
