/*jslint browser: true*/

var LocalStorageStore = function () {

    "use strict";
    
    this.getFavorites = function () {
        var currentFavs = JSON.parse(window.localStorage.getItem("favorites"));
        return currentFavs;
    };

    this.setFavorites = function (newFavs) {
        window.localStorage.setItem("favorites", JSON.stringify(newFavs));
        return;
    };

    
    if (!this.getFavorites()) {
        this.setFavorites([]);
    }

};