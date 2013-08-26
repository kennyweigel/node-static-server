/*jslint browser: true*/
/*global $, app, google, alert, Handlebars, regions*/
var MapView = function () {
    "use strict";
  
    this.initialize = function () {
        this.el = $('<div/>');
        this.registerEvents();
    };

    this.registerEvents = function () {
        this.el.on("click", "#mapRefresh", this.buoyMap);
        this.el.on("click", "#mapMenu", app.hashChangeMenu);
    };

    this.render = function () {
        this.el.html(MapView.template());
        return this;
    };

    this.buoyMap = function () {
        $("#mapRefresh > i").addClass("icon-spin");
        
        //onSuccess callback receives a Position object
        function onSuccess(position) {
            var myLat = position.coords.latitude,
                myLng = position.coords.longitude,
                myLatLng = new google.maps.LatLng(myLat, myLng),
                mapOptions = {
                    center: myLatLng,
                    zoom: 7,
                    mapTypeId: google.maps.MapTypeId.TERRAIN,
                    disableDefaultUI: true
                },
                map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions),
                regionsLength = regions.length,
                i,
                j,
                specificRegion,
                specificRegionLength,
                buoy,
                buoyLatLng,
                buoyMarker;
            
            for (i = 0; i < regionsLength; i += 1) {
                specificRegion = window[regions[i].id];
                specificRegionLength = specificRegion.length;
                for (j = 0; j < specificRegionLength; j += 1) {
                    buoy = specificRegion[j];
                    buoyLatLng = new google.maps.LatLng(buoy.lat, buoy.lng);
                    buoyMarker = new google.maps.Marker({
                        position: buoyLatLng,
                        map: map,
                        title: buoy.id,
                        icon: 'img/shipwreck_75.png'
                    });
                    //google.maps.event.addListener(buoyMarker, "click", app.showSpecificBuoy(buoyMarker.title));
                    google.maps.event.addListener(buoyMarker, "click", function () {
                        app.selectedBuoy = this.title;
                        app.hashChangeBuoy();
                    });
                }
            }
            $("#mapRefresh > i").removeClass("icon-spin");
        }
        
        //onError Callback receives a PositionError object
        function onError(error) {
            $("#mapRefresh > i").removeClass("icon-spin");
            alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        }
        
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {'enableHighAccuracy': true, 'timeout': 10000});
    };

    this.initialize();
};

MapView.template = Handlebars.compile($('#map-tpl').html());