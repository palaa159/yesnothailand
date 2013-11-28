var phonegap = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        // get location
        alert('device ready');
        navigator.geolocation.getCurrentPosition(this.onSuccess, this.onError);
    },
    onSuccess: function(position) {
        user.geo = [position.coords.latitude, position.coords.longitude];
    alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');
    },

// onError Callback receives a PositionError object
//
    onError: function(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

};

phonegap.initialize();

var app = {
    sW: window.innerWidth,
    sH: window.innerHeight,
    log: function(x) {
        console.log(x);
    },
    fastClick: function() {
        window.addEventListener('load', function() {
            FastClick.attach(document.body);
        }, false);
    },
    storage: window.localStorage,
    ajaxLoad: function() {
        $('#ajaxLoader').show();
    },
    ajaxUnload: function() {
        $('#ajaxLoader').fadeOut('fast');
    },
    scrollToPage: function(x) {
        // fade all pages
        $('.page').css({
            opacity: 0
        });
        // app.hideAllLogged();
        $('html, body').animate({
            scrollTop:0,
            scrollLeft: $('#' + x).offset().left
        }, 300);
        // enable, mute menu
        $('.menu_icon').removeClass('menu_active');
        $('#menu_' + x).addClass('menu_active');
        // activepage
        if (x == 'page_news') {
            app.activateNews();
        }
        if (x == 'page_vote') {
            // show page_vote
            app.activateVote();
        }
        if (x == 'page_about') {
            // show page_vote
            app.activateAbout();
        }
    },
    activateNews: function() {
        console.log('activate news');
        $('#page_news').animate({
            opacity: 1
        });
    },
    activateVote: function() {
        console.log('activate vote');
        $('#page_vote').animate({
            opacity: 1
        });
        this.ajaxLoad();
        parse.checkForNewEvents();
    },
    activateAbout: function() {
        $('#page_about').animate({
            opacity: 1
        });
    },
    activateMenu: function() {
        $('.menu_icon').click(function() {
            app.scrollToPage($(this).attr('id').substring(5, $(this).attr('id').length));
        });
    },
    hideAllLogged: function() {
        $('.logged').hide();
    },
    showAllLogged: function() {
        $('.logged').show();
    },
    checkInternet: function() {

    },
    storeUser: function(name, mac, geo) {
        user.name = name;
        user.mac = mac;
        user.geo = geo;
    },
    init: function() {
        // app.hideAllPages();
        console.table('init');
        this.checkInternet();
        // jquery layout pages
        $('.page').each(function(i, elem) {
            console.log(i, elem);
            $(elem).css({
                left: i * 100 + '%'
            });
        });
        // hide everything
        // check if app has collected name (and location)
        if (this.storage.getItem('user') !== null) {
            // retrieve data from parse
            parse.queryReturnUserAndIncrement('Users', 'fa:ke:ma:c0');
            // store in user object
            // increment appCounter
            // parse.query();
            // proceed to news page
            app.scrollToPage('page_news');
            app.showAllLogged();
            app.activateMenu();
        } else {
            // init intro page
            $('#btn_input_name_continue').click(function() {
                // check if name is correct
                // WE GOT NEW USER
                if ($('#iptName').val().length >= 3) {
                    user.name = $('#iptUser').val();
                    console.log(user.name);
                    // add to localstorage
                    app.storage.setItem('user', user.name);
                    // get MAC address
                    var mac = 'fa:ke:ma:c0';
                    var geo = user.geo;
                    // store user
                    app.storeUser(mac, name, geo);
                    // submit name and geolocation to parse
                    parse.submitNewUser(mac, name, geo, 1);
                    // proceed to homepage
                    app.scrollToPage('page_news');
                    // destroy intro page
                    app.activateMenu();
                } else {
                    // navigator.notification.alert('กรุณาพิมพ์ชื่อด้วยครับ', function() {
                    // }, 'YESNOThailand');
                }
            });
        }
    }
};

var user = {
    name: null,
    mac: null,
    geo: [],
    eventAnswered: null
};

var loadedEvent = [];

var parse = {
    conn_users: null,
    conn_events: null,
    q_users: null,
    q_events: null,
    init: function() {
        Parse.initialize("qrx8bPXy1nwdiGYJxDdcnXRSgPtniLJSUDNURv6t", "1SbFR9B3qDvkweyOOYj75aznHm9CDuEaMJ6vPCCj");
        conn_users = Parse.Object.extend("Users");
        conn_events = Parse.Object.extend("Events");
        this.conn_users = new conn_users();
        this.conn_events = new conn_events();
        // query instance
        this.q_users = new Parse.Query(conn_users);
        this.q_events = new Parse.Query(conn_events);
    },
    queryReturnUserAndIncrement: function(table, object) {
        if (table == 'Users') {
            this.q_users.equalTo("mac", object);
            this.q_users.first({
                success: function(result) {
                    user.name = result.attributes.name;
                    user.mac = result.attributes.mac;
                    user.eventAnswered = result.attributes.event_answered;
                    // increment app counter

                }
            });
        }
    },
    submitNewUser: function(mac, name, geo, counter) {
        this.conn_users.save({
            mac: mac,
            name: name,
            geo: geo,
            counter: 1
        }, {
            success: function(object) {
                console.log('parse: success');
            },
            error: function(model, error) {
                console.log('parse: failed');
            }
        });
    },
    checkForNewEvents: function() {
        this.conn_events.fetch({
            success: function(data) {
                app.ajaxUnload();
                var eventList = data.attributes.results;
                eventList.each(function(i, v) {
                    if(loadedEvent.match(v.name) !== v.name)
                        loadedEvent.push(v.name);
                });
                
            },
            error: function(data, error) {
                console.log(error);
            }
        });
    }
};
// disable scroll
window.addEventListener('touchmove', function(e) {
    e.preventDefault();
});
parse.init();
app.fastClick();
app.init();

app.log('hello hacker :)');

// debug
$('#resetStorage').click(function() {
    app.storage.clear();
});