/*jslint browser: true*/
/*global $, app, Handlebars*/
var MenuView = function () {
    "use strict";

    this.initialize = function () {
        this.el = $("<div/>");
    };

    this.registerEvents = function () {
        this.el.on("click", ".deleteBtn", this.confirmRemoveFavorite);
        this.el.on("click", "#menuAddBuoy", app.hashChangeSearch);
        this.el.on("click", "#menuMap", app.hashChangeMap);
        this.el.on("click", "#menuHome", app.hashChangeHome);
    };

    this.render = function () {
        this.el.html(MenuView.template(app.store.getFavorites()));
        return this;
    };

    this.confirmRemoveFavorite = function () {
        app.menuPage.currentId = $(this).parent().attr("id").substring(0, 5);
        app.showConfirm(
            "Are you sure you want to remove buoy: " + app.menuPage.currentId + "?",
            app.menuPage.removeFavorite,
            "Remove Favorite",
            ["Yes", "Cancel"]
        );
    };

    this.removeFavorite = function (buttonIndex) {
        var i = 0,
            currentFavs = app.store.getFavorites();
        if (buttonIndex === 1) {
            
            for (i = 0; i < currentFavs.length; i += 1) {
                if (app.menuPage.currentId === currentFavs[i].id) {
                    currentFavs.splice(i, 1);
                    break;
                }
            }
            app.store.setFavorites(currentFavs);
            app.menuPage.render();
            app.homePage.renderFavorites();
            app.homePage.resize();
        }
    };

    this.initialize();
};

MenuView.template = Handlebars.compile($("#menu-tpl").html());