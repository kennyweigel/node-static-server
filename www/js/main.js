/*jslint browser: true*/
/*global $, alert, confirm, console,  FastClick, HomeView, MapView, MenuView, SearchView, BuoyView, PageSlider, LocalStorageStore, regions*/
var app = {
    
    registerEvents: function () {
        "use strict";
        $(window).on("hashchange", $.proxy(this.route, this));
        window.addEventListener('load', function () {
            FastClick.attach(document.body);
        }, false);
        $(window).on("orientationchange", function (event) {
            event.preventDefault();
        });
    },

    route: function () {
        "use strict";
        this.previousHash = this.hash;
        this.hash = window.location.hash;

        if (this.hash.match("home")) {
            if (this.homePage) {
                this.page = this.homePage.el;
                this.slider.slidePage($(this.page));
                this.homePage.renderFavorites();
                this.homePage.resize();
                this.homePage.registerEvents();
                console.log('refresh home');
            } else {
                this.homePage = new HomeView();
                this.homePage.render();
                $("#container").html(this.homePage.el);
                this.homePage.renderFavorites();
                this.homePage.resize();
                this.homePage.registerEvents();
                console.log('new home');
            }
        }
        
        if (this.hash.match("map")) {
            if (this.mapPage) {
                this.page = this.mapPage.el;
                this.slider.slidePage($(this.page));
                this.mapPage.registerEvents();
            } else {
                this.mapPage = new MapView();
                this.mapPage.render();
                this.page = this.mapPage.el;
                this.slider.slidePage($(this.page));
                this.mapPage.buoyMap();
            }
        }

        if (this.hash.match("menu")) {
            if (this.menuPage) {
                console.log('refresh menu');
                this.menuPage.render();
                this.page = this.menuPage.el;
                this.slider.slidePage($(this.page));
                this.menuPage.registerEvents();
            } else {
                this.menuPage = new MenuView();
                this.menuPage.render();
                this.page = this.menuPage.el;
                this.slider.slidePage($(this.page));
                this.menuPage.registerEvents();
            }
        }
    
        if (this.hash.match("search")) {
            if (this.searchPage) {
                this.page = this.searchPage.el;
                this.slider.slidePage($(this.page));
                this.searchPage.registerEvents();
                this.searchPage.getClosestBuoys();
                console.log('refresh search');
            } else {
                this.searchPage = new SearchView();
                this.searchPage.render();
                this.page = this.searchPage.el;
                this.slider.slidePage($(this.page));
                this.searchPage.registerEvents();
                this.searchPage.getClosestBuoys();
                console.log('new search');
            }
        }
        
        if (this.hash.match("buoy")) {
            if (this.buoyPage) {
                this.buoyPage.render();
                this.page = this.buoyPage.el;
                this.slider.slidePage($(this.page));
                this.buoyPage.registerEvents();
                this.buoyPage.getSpecificBuoyData();
            } else {
                this.buoyPage = new BuoyView();
                this.buoyPage.render();
                this.page = this.buoyPage.el;
                this.slider.slidePage($(this.page));
                this.buoyPage.registerEvents();
                this.buoyPage.getSpecificBuoyData();
            }
        }
    },

    hashChangeHome: function () {
        "use strict";
        window.location.hash = "home";
    },
    
    hashChangeMenu: function () {
        "use strict";
        window.location.hash = "menu";
    },
    
    hashChangeMap: function () {
        "use strict";
        window.location.hash = "map";
    },

    hashChangeSearch: function () {
        "use strict";
        if (app.store.getFavorites().length < 10) {
            window.location.hash = "search";
        } else {
            app.showAlert("Only 10 buoys may be added to your Favorites", "Favorites Limit Reached");
        }
    },
    
    hashChangeBuoy: function () {
        "use strict";
        window.location.hash = "buoy";
    },

    hashChangeBack: function () {
        "use strict";
        window.location.hash = app.previousHash;
    },

    initialize: function () {
        "use strict";
        this.slider = new PageSlider($("#container"));
        window.location.hash = "home";
        this.hash = "home";
        this.selectedBuoy = null;
        this.registerEvents();
        this.store = new LocalStorageStore();
        this.screenHeight = $(window).height();
        this.screenWidth = $(window).width();
        this.route();
    },

    showAlert: function (message, title) {
        "use strict";
        if (navigator.notification) {
            navigator.notification.alert(
                message,  //message
                null,     //callback to invoke when button pressed
                title,    //title
                "OK"      //button label
            );
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },

    showConfirm: function (message, onConfirm, title, buttonLabels) {
        "use strict";
        if (navigator.notification) {
            navigator.notification.confirm(
                message,      //message
                onConfirm,    //callback to invoke with index of button pressed
                title,        //title
                buttonLabels  //[buttonLabels]
            );
        } else {
            var clickedOk = confirm(message);
            if (clickedOk) {
                onConfirm(1);
            }
        }
    },

    validateBuoy: function () {
        "use strict";
        var inputVal = $("#searchInput").val().toUpperCase();
        if (app.store.getFavorites().length < 10) {
            app.showConfirm(
                "Are you sure you want to add buoy " + inputVal + "?",
                app.formBuoy,
                "Favorites",
                ["Yes", "Cancel"]
            );
        } else {
            app.showAlert("Only 10 buoys may be added to your Favorites.", "Favorites");
        }
    },

    formBuoy: function () {
        "use strict";
        var input = $("#searchInput"),
            inputVal = input.val().toUpperCase();
        app.addFavBuoy(input, inputVal);
    },

    addFavBuoy: function (input, inputVal) {
        "use strict";
        var currentFavorites = this.store.getFavorites();
        
        function isValidId(inputVal) {
            var regionsLength = regions.length,
                i,
                j,
                specificRegion,
                specificRegionLength;
                
            for (i = 0; i < regionsLength; i += 1) {
                specificRegion = window[regions[i].id];
                specificRegionLength = specificRegion.length;
                for (j = 0; j < specificRegionLength; j += 1) {
                    if (specificRegion[j].id === inputVal) {
                        return 1;
                    }
                }
            }
            return 0;
        }
        
        function addBuoy(inputVal) {
            currentFavorites.push({id: inputVal, data: "<p>No Updates</p>"});
            app.store.setFavorites(currentFavorites);
            if (app.menuPage) {
                app.menuPage.render();
            }
            app.homePage.renderFavorites();
            app.homePage.resize();
        }
        
        function isFavorite(inputVal) {
            var i;
            for (i = 0; i < currentFavorites.length; i += 1) {
                if (inputVal === currentFavorites[i].id) {
                    return 1;
                }
            }
            return 0;
        }

        if (!currentFavorites.length) {
            if (isValidId(inputVal)) { 
                input.val("");
                $('input').blur();
                addBuoy(inputVal);
            } else { 
                input.val("");
                $('input').blur();
                app.showAlert("Buoy " + inputVal + " can't be found.", "Search");
            }
        } else {
            //checks if buoy is already a favorite
            if (isFavorite(inputVal, currentFavorites)) {
                input.val("");
                $('input').blur();
                app.showAlert("Buoy " + inputVal + " is already a favorite.", "Favorites");
            } else {
                //checks if buoy matches any buoy ids
                if (isValidId(inputVal)) { 
                    input.val("");
                    $('input').blur();
                    addBuoy(inputVal);                    
                } else {
                    input.val("");
                    $('input').blur();                    
                    app.showAlert("Buoy " + inputVal + " can't be found.", "Search");
                }
            }
        }
    },

    processBuoyData: function (html) {
        "use strict";
        var condStart = html.indexOf("<h2>Weather Conditions</h2>"),
            indStart = html.indexOf("<p>", condStart),
            indEnd = html.indexOf("</p>", indStart) + 4,
            parsedHTML = html.substring(indStart, indEnd);
        return parsedHTML;
    }
};

app.initialize();