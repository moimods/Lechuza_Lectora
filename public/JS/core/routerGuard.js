document.addEventListener("DOMContentLoaded", ()=>{

    if(document.body.dataset.auth === "required"){
        Auth.requireLogin();
    }

});