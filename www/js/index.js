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
        console.log('UUID' + device.uuid);
        user.mac = device.uuid;
        app.init();
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
    alreadyVisualized: false,
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
            scrollTop: 0,
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
        if (x == 'page_visualize') {
            // show page_vote
            app.activateVisualize();
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
    activateVisualize: function() {
        $('#page_visualize').animate({
                opacity: 1
            });
        if (app.alreadyVisualized == false) {
            this.ajaxLoad();
            // query visualize
            // connect to parse
            parse.checkForVisualize();
            app.alreadyVisualized = true;
        }
        // render chart
    },
    activateAbout: function() {
        app.ajaxUnload();
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
    checkInternet: function(err) {
        alert(err + ' มีบางอย่างผิดพลาด บางทีคุณอาจจะไม่ได้เชื่อมต่อกับอินเตอร์เน็ตก็เป็นได้');
    },
    storeUser: function(mac, name, geo) {
        user.mac = mac;
        user.username = name;
        user.geo = geo;
    },
    init: function() {
        // I'm debugging in web
        // app.hideAllPages();
        console.table('init');
        // this.checkInternet();
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
                    // alert('name: ' + user.username + '\nuuid: ' + user.mac);
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
        for (var i = 0; i < events.length; i++) {
            // console.log(events[i].name);
            if (answeredEvent == undefined || answeredEvent.toString().indexOf(events[i].name) == -1) { // if event not exist in user data
                // then push to unAnsweredEvent
                vote.unAnsweredEvent.push(events[i]);
            }
        }
        console.log('user have answered: ' + user.eventAnswered);
        console.log('user have unanswered: ' + JSON.stringify(vote.unAnsweredEvent));
        if (this.unAnsweredEvent.length > 0) {
            this.loadUnanswered(0);
        } else {
            this.loadAllAnswered();
        }
    },
    loadUnanswered: function() {
        // console.log('loading unanswered seq: ' + seq);
        // alert('starting seq ' + seq);
        // reset yes/no
        $('#vote_yes').css({
            opacity: 0.7,
            color: '#000'
        }).unbind();
        $('#vote_no').css({
            opacity: 0.7,
            color: '#000'
        }).unbind();
        // reset style
        $('#vote_description').hide();
        $('#vote_image img').hide();
        // templating
        $('#vote_description').html(this.unAnsweredEvent[0].desc).fadeIn();
        $('#vote_image img').attr('src', this.unAnsweredEvent[0].img._url).fadeIn();
        // show page
        $('#page_vote').animate({
            opacity: 1
        });
        // selecting yes/no
        $('#vote_yes').on('click', function() {
            $('#vote_yes').css({
                opacity: 1,
                color: '#32b237'
            });
            parse.submitAnswer(vote.unAnsweredEvent[0].name, 1);
        });
        $('#vote_no').on('click', function() {
            $('#vote_no').css({
                opacity: 1,
                color: '#b20e00'
            });
            parse.submitAnswer(vote.unAnsweredEvent[0].name, 0);
        });
    },
    loadAllAnswered: function() {
        $('#vote_template').hide();
        // load all answered event
        var text;
        // clear list_answered
        $('#list_answered').html('');
        $.each(user.eventAnswered, function(i, v) {
            if (v[1] == 1) {
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

var visualize = {
    list: [],
    result: [],
    init: function(visualizeList) {
        // reset
        $('.result').remove();
        this.list = [];
        this.result = [];
        // แปรผล
        // event cell
        $.each(visualizeList, function(i, v) {
            visualize.list.push({
                name: v.name,
                desc: v.desc,
                event: v.event
            });
            // query user for results, push to result[]
            parse.queryVisualizeResult(i, v.event);
            // console.log(v.event);
        });
        var listener = setInterval(function() {
            if (visualize.list.length == visualize.result.length) {
                // console.log('yessss');
                app.ajaxUnload();
                visualize.render();
                clearInterval(listener);
            }
        }, 1000);
    },
    render: function() {
        // console.log(visualize.result);
        // duplicate viz template
        $.each(visualize.list, function(i, v) {
            var all = visualize.result[i].yes + visualize.result[i].no;
            $('#chart_template')
                .clone()
                .attr('id', visualize.list[i].name)
                .removeClass('template')
                .addClass('result')
                .appendTo($('#visualize_content'))
                .children('#chart_render').attr('id', visualize.list[i].event)
                .parent()
                .children('#chart_result')
                .children('.chart_result_yes').html('<span class="glyphicon glyphicon-thumbs-up icon_viz_yes"></span>' + ' ' + (visualize.result[i].yes / all * 100).toFixed(1) + '%')
                .parent()
                .children('.chart_result_no').html('<span class="glyphicon glyphicon-thumbs-down icon_viz_no"></span>' + ' ' + (visualize.result[i].no / all * 100).toFixed(1) + '%')
                .parent()
                .children('.chart_result_desc').html(visualize.list[i].desc);

            var ctx = $('#' + visualize.list[i].event)[0].getContext("2d");
            var data = [{
                value: visualize.result[i].yes,
                color: '#3bb24a'
            }, {
                value: visualize.result[i].no,
                color: '#d7141b'
            }];
            var myChart = new Chart(ctx).Pie(data, visualize.chartOption);
        });
    },
    chartOption: {
        segmentShowStroke: true,
        segmentStrokeColor: "#fff",
        segmentStrokeWidth: 2,
        animation: true,
        animationSteps: 100,
        animationEasing: "easeOutBounce",
        animateRotate: true,
        animateScale: false,
        onAnimationComplete: null
    }
};

var parse = {
    conn_users: null,
    conn_events: null,
    conn_visualize: null,
    q_users: null,
    q_events: null,
    q_visualize: null,
    init: function() {
        Parse.initialize("qrx8bPXy1nwdiGYJxDdcnXRSgPtniLJSUDNURv6t", "1SbFR9B3qDvkweyOOYj75aznHm9CDuEaMJ6vPCCj");
        //
        conn_users = Parse.Object.extend("Users");
        conn_events = Parse.Object.extend("Events");
        conn_visualize = Parse.Object.extend("Visualize");
        //
        this.conn_users = new conn_users();
        this.conn_events = new conn_events();
        this.conn_visualize = new conn_visualize();
        // query instance
        this.q_users = new Parse.Query(conn_users);
        this.q_events = new Parse.Query(conn_events);
        this.q_visualize = new Parse.Query(conn_visualize);
    },
    submitAnswer: function(ename, ans) {
        // console.log('seq ' + seq + ' received'); // * always restart from seq = 0
        this.q_users.equalTo("mac", user.mac);
        this.q_users.first({
            success: function(result) {
                result.addUnique("event_answered", [ename, ans]);
                result.save();
                console.log('parse submitted: ' + ename + ans);
                // append to user.eventAnswered
                user.eventAnswered.push([ename, ans]);
                // append user to events class
                parse.q_events.equalTo('name', ename);
                parse.q_events.first({
                    success: function(result) {
                        // console.log(ans);
                        // console.log(result);
                        // if yes
                        if (ans == 1) {
                            result.addUnique("whoYes", user.mac);
                            result.save();
                        } else if (ans == 0) { // if no
                            result.addUnique("whoNo", user.mac);
                            result.save();
                        }
                        // pop unansweredEvent
                        vote.unAnsweredEvent.shift();
                        console.log('unanswered length: ' + vote.unAnsweredEvent.length);
                        if (vote.unAnsweredEvent.length == 0) {
                            vote.loadAllAnswered();
                        } else {
                            vote.loadUnanswered();
                        }
                    }
                });
                // alert('parse success, although unAnsweredEvent length: ' + vote.unAnsweredEvent.length);
            }
        });
    },
    queryReturnUserAndIncrement: function(table, object) {
        if (table == 'Users') {
            // console.log('sending mac ' + object);
            this.q_users.equalTo("mac", object);
            this.q_users.first({
                success: function(result) {
                    // console.log(result); 
                    user.username = result.attributes.name;
                    user.mac = result.attributes.mac;
                    user.eventAnswered = result.attributes.event_answered;
                    // alert('parse: ' + user.username + user.mac + user.eventAnswered);
                    // increment app counter
                    result.increment('counter');
                    result.save();
                },
                error: function(model, err) {
                    app.checkInternet(err);
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
                // alert('parse: success');
            },
            error: function(model, err) {
                app.checkInternet(err);
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
            error: function(model, err) {
                app.checkInternet(err);
            }
        });
    },
    checkForVisualize: function() {
        this.conn_visualize.fetch({
            success: function(data) {
                var visualizeList = data.attributes.results;
                // console.log('visualize list: ' + visualizeList);
                visualize.init(visualizeList);
            },
            error: function(model, err) {
                app.checkInternet(err);
            }
        });
    },
    queryVisualizeResult: function(i, e) {
        // console.log(e);
        this.q_events.equalTo("name", e);
        this.q_events.first({
            success: function(data) {
                // console.log(data);
                var result = data.attributes;
                // console.log(result);
                // * read yeses and nos [yes, no];
                visualize.result.push({
                    yes: result.whoYes.length,
                    no: result.whoNo.length
                });
            },
            error: function(model, err) {
                app.checkInternet(err);
            }
        });
    }
};
// disable scroll
window.addEventListener('touchmove', function(e) {
    e.preventDefault();
});

// initialize app elements
phonegap.initialize();
app.fastClick();
parse.init();

// if you are using web to debug, run app.init();
var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
if(iOS == false) {
    console.log('web debugging');
    app.init();
}

app.log('hello hacker :)');

// debug
$('#resetStorage').click(function() {
    app.storage.clear();
});