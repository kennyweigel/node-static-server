/*jslint browser: true*/
/*global $, app, regions, Handlebars, console */
var SearchView = function () {
    "use strict";
    this.initialize = function () {
        this.el = $("<div/>");
    };

    this.registerEvents = function () {
        this.el.on("click", "#searchBack", app.hashChangeBack);
        this.el.on("click", "#searchGeolocation", this.getClosestBuoys);
        //browser supports touch events
        if (document.documentElement.hasOwnProperty("ontouchstart")) {
            this.el.on("touchstart", ".closestBuoys", function () {
                $(this).addClass("tappable-active");
            });
            this.el.on("touchend", ".closestBuoys", function () {
                app.searchPage.confirmClosestBuoy($(this).attr("id").substring(0, 5));
                $(this).removeClass("tappable-active");
            });
        } else { //browser only supports mouse events
            this.el.on("mousedown", ".closestBuoys", function () {
                $(this).addClass("tappable-active");
                app.searchPage.activeBuoy = $(this);
            });
            this.el.on("mouseup", ".closestBuoys", function () {
                app.searchPage.confirmClosestBuoy(app.searchPage.activeBuoy.attr("id").substring(0, 5));
                $(".closestBuoys").removeClass("tappable-active");
            });
        }
    };

    this.render = function () {
        this.el.html(SearchView.template());
        return this;
    };

    this.confirmClosestBuoy = function (currentId) {
        if (app.store.getFavorites().length < 10) {
            app.searchPage.currentId = currentId;
            app.showConfirm(
                "Are you sure you want to add buoy " + app.searchPage.currentId + "?",
                app.searchPage.addClosestBuoy,
                "Favorite",
                ["Yes", "Cancel"]
            );
            return;
        } else {
            app.showAlert("Only 10 buoys may be added to your Favorites.", "Favorites");
        }
    };

    this.addClosestBuoy = function (buttonIndex) {
        if (buttonIndex === 1) {
            app.addFavBuoy(null, app.searchPage.currentId);
            return;
        } else {
            return;
        }
    };

    this.getClosestBuoys = function () {
        $("#closestBuoysTable").html("<tbody><tr><td>Getting Current Location...</td></tr></tbody>");
        
        function deg2rad(deg) {
            return deg * (Math.PI / 180);
        }
        
        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            var R = 6371, // Radius of the earth in km
                dLat = deg2rad(lat2 - lat1),  // deg2rad below
                dLon = deg2rad(lon2 - lon1),
                a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2),
                c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
                d = R * c; // Distance in km
            return d;
        }
        
        function onGeolocationSuccess(position) {
            var myLat = position.coords.latitude,
                myLng = position.coords.longitude,
                regionSpecific,
                regionSpecificLength,
                distance,
                allBuoys = [],
                regionsLength = regions.length,
                i,
                j;
            for (i = 0; i < regionsLength; i += 1) {
                regionSpecific = window[regions[i].id];
                regionSpecificLength = regionSpecific.length;
      
                for (j = 0; j < regionSpecificLength; j += 1) {
                    distance = getDistanceFromLatLonInKm(myLat, myLng, regionSpecific[j].lat, regionSpecific[j].lng);
                    allBuoys.push({"id": regionSpecific[j].id, "name": regionSpecific[j].name, "distance": distance});
                }
            }
            allBuoys.sort(function (buoy1, buoy2) {
                return buoy1.distance - buoy2.distance;
            });
            allBuoys = allBuoys.slice(0, 10);
            $("#closestBuoysTable").html(SearchView.closestBuoysTable(allBuoys));
        }
        
        function onGeolocationError(error) {
            console.log(error);
            $("#closestBuoysTable").html("<tbody><tr><td>Geolocation failed, check your network connection and privacy settings.</td></tr></tbody>");
        }
        
        navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError, {'enableHighAccuracy': true, 'timeout': 10000});
        return;
    };

    this.initialize();
};

SearchView.template = Handlebars.compile($("#search-tpl").html());
SearchView.closestBuoysTable = Handlebars.compile($("#closestBuoysTable-tpl").html());