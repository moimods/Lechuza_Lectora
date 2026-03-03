window.Auth = {

    getUser(){
        return JSON.parse(localStorage.getItem("usuario"));
    },

    isLogged(){
        return !!this.getUser();
    },

    requireLogin(){
        if(!this.isLogged()){
            window.location.href =
            "/html/Inicio_de_sesion/Inicio_sesion.html";
        }
    },

    logout(){
        localStorage.clear();
        window.location.href="/index.html";
    }
};