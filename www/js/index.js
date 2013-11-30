var user = {
    username: null,
    mac: null,
    geo: [],
    eventAnswered: []
};

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
        // alert('UUID' + device.uuid);
        user.mac = device.uuid;
        //get uuid
        var onSuccess = function(position) {
            user.geo = [position.coords.latitude, position.coords.longitude];
            // alert('Latitude: ' + position.coords.latitude + '\n' +
            //     'Longitude: ' + position.coords.longitude + '\n' +
            //     'Altitude: ' + position.coords.altitude + '\n' +
            //     'Accuracy: ' + position.coords.accuracy + '\n' +
            //     'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
            //     'Heading: ' + position.coords.heading + '\n' +
            //     'Speed: ' + position.coords.speed + '\n' +
            //     'Timestamp: ' + position.timestamp + '\n');
        };

        // onError Callback receives a PositionError object
        //

        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
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
        }, 3);
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
        // remove twitter banner
        $('.timeline-header').css('display', 'none');
        $('#page_news').animate({
            opacity: 1
        });
    },
    activateVote: function() {
        console.log('activate vote');
        // background
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
    storeUser: function(mac, name, geo) {
        user.mac = mac;
        user.username = name;
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
            parse.queryReturnUserAndIncrement('Users', user.mac);
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
                    user.username = $('#iptName').val();
                    alert('name: ' + user.username + '\nuuid: ' + user.mac);
                    // add to localstorage
                    app.storage.setItem('user', user.username);
                    // store user
                    app.storeUser(user.mac, user.username, user.geo);
                    // submit name and geolocation to parse
                    parse.submitNewUser(user.mac, user.username, user.geo, 1);
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

var vote = {
    events: [],
    unAnsweredEvent: [],
    init: function(events) {
        // clear unAnsweredEvent
        this.unAnsweredEvent = [];
        this.events = events;
        // check event ID if new
        var answeredEvent = user.eventAnswered;
        // console.log(answeredEvent);
        for(var i=0;i<events.length;i++) {
            // console.log(events[i].name);
            if(answeredEvent == undefined || answeredEvent.toString().indexOf(events[i].name) == -1) { // if event not exist in user data
                // then push to unAnsweredEvent
                vote.unAnsweredEvent.push(events[i]);
            }
        }
        console.log('user have answered: ' + user.eventAnswered);
        console.log('user have unanswered: ' + JSON.stringify(vote.unAnsweredEvent));
        if(this.unAnsweredEvent.length > 0) {
            this.loadUnanswered(0);
        } else {
            this.loadAllAnswered();
        }
    },
    loadUnanswered: function(seq) {
        // alert('starting seq ' + seq);
        // reset yes/no
        $('#vote_yes').css('opacity', 0.7);
        $('#vote_no').css('opacity', 0.7);
        // templating
        $('#vote_description').html(this.unAnsweredEvent[seq].desc);
        $('#vote_image img').attr('src', this.unAnsweredEvent[seq].img._url);
        // show page
        $('#page_vote').animate({
            opacity: 1
        });
        // selecting yes/no
        $('#vote_yes').click(function() {
            $('#vote_yes').css('opacity', 1);
            parse.submitAnswer(seq, vote.unAnsweredEvent[seq].name, 1);
        });
        $('#vote_no').click(function() {
            $('#vote_no').css('opacity', 1);
            parse.submitAnswer(seq, vote.unAnsweredEvent[seq].name, 0);
        });
    },
    loadAllAnswered: function() {
        $('#vote_template').hide();
        // load all answered event
        var text;
        // clear list_answered
        $('#list_answered').html('');
        $.each(user.eventAnswered, function(i, v) {
            if(v[1] == 1) {
                text = 'คุณ เอา ' + v[0] + '<br>';
            } else {
                text = 'คุณ ไม่เอา ' + v[0] + '<br>';
            }
            $('#list_answered').append(text);
        });
        $('#no_new_event').show();
        // show page
        $('#page_vote').animate({
            opacity: 1
        });
        console.log('you have answered all. what a jerk!');
    }
};

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
    submitAnswer: function(seq, ename, ans) {
        this.q_users.equalTo("mac", user.mac);
        this.q_users.first({
            success: function(result) {
                result.addUnique("event_answered", [ename, ans]);
                result.save();
                console.log('parse submitted: ' + ename + ans);
                // append to user.eventAnswered
                user.eventAnswered.push([ename, ans]);
                // alert('parse success, although unAnsweredEvent length: ' + vote.unAnsweredEvent.length);
                // check if there is an event left
                if(seq == vote.unAnsweredEvent.length-1) {
                    // all answered
                    vote.loadAllAnswered();
                } else {
                    vote.loadUnanswered(seq + 1);
                }
            }
        });
    },
    queryReturnUserAndIncrement: function(table, object) {
        if (table == 'Users') {
            this.q_users.equalTo("mac", object);
            this.q_users.first({
                success: function(result) {
                    user.username = result.attributes.name;
                    user.mac = result.attributes.mac;
                    user.eventAnswered = result.attributes.event_answered;
                    alert('parse: ' + user.username + user.mac + user.eventAnswered);
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
                alert('parse: success');
            },
            error: function(model, error) {
                alert('parse: failed');
            }
        });
    },
    checkForNewEvents: function() {
        this.conn_events.fetch({
            success: function(data) {
                app.ajaxUnload();
                var eventList = data.attributes.results;
                vote.init(eventList);
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

// initialize app elements
parse.init();
app.fastClick();
app.init();

app.log('hello hacker :)');

// debug
$('#resetStorage').click(function() {
    app.storage.clear();
});