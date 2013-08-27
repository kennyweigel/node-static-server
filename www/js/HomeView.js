/*jslint browser: true*/
/*global $, app, iScroll, alert, Handlebars*/

var HomeView = function () {
    "use strict";

    this.initialize = function () {
        this.el = $("<div/>");
    };

    this.registerEvents = function () {
        this.el.on("click", "#homeRefresh", this.homeRefresh);
        this.el.on("click", "#addBuoySlide", app.hashChangeSearch);
        this.el.on("click", "#homeMenu", app.hashChangeMenu);
    };

    this.render = function () {
        this.el.html(HomeView.template());
        return this;
    };

    this.renderFavorites = function () {
        $("#scroller").html(HomeView.scrollerTemplate(app.store.getFavorites()));
        $("#indicator").html(HomeView.indicatorTemplate(app.store.getFavorites()));
        if (this.myScroll) {
            this.myScroll.scrollToPage(0);
        }
    };

    this.resize = function () {
        var testFavs;

        //sets first li bullet active
        $("#indicator>li").removeClass("active");
        $("#indicator>:first-child").addClass("active");
        
        testFavs = app.store.getFavorites();
        $("#scroller").width((testFavs.length + 1) * app.screenWidth);
        //sets width of scroller pages to appropriate width
        $("#scroller li").width(app.screenWidth);
        //sets each slide to appropriate size
        $(".slide").height(app.screenHeight - 110);
        $(".slide").width(app.screenWidth - 40);
        
        if (this.myScroll) {
            this.myScroll.destroy();
        }
        
        this.myScroll = new iScroll("wrapper", {
            snap: true,
            momentum: false,
            hScrollbar: false,
            onScrollEnd: function () {
                document.querySelector("#indicator > li.active").className = "";
                document.querySelector("#indicator > li:nth-child(" + (this.currPageX + 1) + ")").className = "active";
            }
        });
    };

    this.homeRefresh = function () {
        var currentIds,
            activeAJAX,
            currentIdsLength,
            i;
        
        function update(html, status, EXTRA) {
            var j;
            activeAJAX -= 1;
            // NEED TO FIX //
            if (status !== 'success') {
                alert('GET was unsuccessful');
                $("#homeRefresh > i").removeClass("icon-spin");
                return;
            } else {
                for (j = 0; j < currentIdsLength; j += 1) {
                    if (currentIds[j].id === EXTRA) {
                        currentIds[j].data = app.processBuoyData(html);
                        app.store.setFavorites(currentIds);
                        if (!activeAJAX) {
                            $("#homeRefresh > i").removeClass("icon-spin");
                            app.homePage.renderFavorites();
                            app.homePage.resize();
                            break;
                        }
                        break;
                    }
                }
            }
        }
        
        function updateInit(url, EXTRA) {
            $.get(url, function (html, status) {
                update(html, status, EXTRA);
            });
        }
               
        $("#homeRefresh > i").addClass("icon-spin");
        activeAJAX = 0;
        currentIds = app.store.getFavorites();
        currentIdsLength = currentIds.length;
        for (i = 0; i < currentIdsLength; i += 1) {
            activeAJAX += 1;
            updateInit("http://www.ndbc.noaa.gov/mobile/station.php?station=" + currentIds[i].id, currentIds[i].id);
        }
    };

    this.initialize();
};

HomeView.template = Handlebars.compile($('#home-tpl').html());
HomeView.scrollerTemplate = Handlebars.compile($('#home-scroller-tpl').html());
HomeView.indicatorTemplate = Handlebars.compile($('#home-indicator-tpl').html());