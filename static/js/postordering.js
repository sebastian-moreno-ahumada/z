async function postOrdering(){
    let orderingMenu = document.getElementById('post-ordering');
    console.log(orderingMenu.value);
    if (orderingMenu.value === "likes") {
        window.location.href = '/?order=likes';
    }
    else{ // default or selectedValue === "time"
        window.location.href = '/?order=time';
    }
}
let orderingMenu = document.getElementById('post-ordering');
orderingMenu.addEventListener('change', postOrdering);