/*jslint browser: true*/
/*global $, jQuery*/

var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var backgroundImage = ["img/sports.jpg", "img/sports.jpg", "img/football.jpg", "img/tennis.jpg", "img/rugby.jpg", "img/rugby.jpg", "img/boxing.jpg", "img/cricket.jpg", "img/golf.jpg", "img/f1.jpg", "img/cycling.jpg", "img/racing.jpg"];

function datastorage(searchurl) {
    var storedData = JSON.parse(localStorage.getItem(searchurl)),
        currentTime,
        storedTime,
        difference,
        numminutes;
    if (storedData) { // if storedData is not null or undefined, it exists, so we can check time difference without causing an error
        currentTime = new Date();
        storedTime = new Date(storedData.storedTime); // this line was breaking it because storedData.storedTime didn't exist on first visit or after clearing localStorage
        difference = currentTime - storedTime;
        numminutes = Math.round(((difference % 86400000) % 3600000) / 60000);
    }
    // If storedData exists AND the time difference is less than 15 minutes, render it
    if (storedData && numminutes < 10) {
        $('.tab-content.current div').delay(200).fadeIn(200);
        goDataGo(storedData);
    }
    // else do an ajax call
    else {
            ajaxcall(searchurl);
    }
}

function ajaxcall(searchurl) {
    $.ajax({
        type: "POST",
        url: 'http://content.guardianapis.com/search?' + searchurl + '&show-fields=all&api-key=n76dazxksq8ucapnrz6fmc7n',
        dataType: 'JSONP',
        // type of response to expect. Usually JSON or JSONP
        success: function(data) { // If call successful, pass data in the variable 'data'
            data.storedTime = new Date();
            data.month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            //storage shit//
            localStorage.setItem(searchurl, JSON.stringify(data));
            if ($('ul.tabs li').hasClass('current')) {
                $('.tab-content.current div').delay(500).fadeIn(200);
                goDataGo(data);
            }
        },
        beforeSend: function() {
            loadingFav();
        },
        complete: function() {
            $('.loading').remove();
            $('.tab-content > div .story .image-container img[src=""]').parent().addClass('noImage');
            $('.tab-content > div .story .image-container img[src=""]').remove();
        }
    }).fail(function() {
        console.log('ajax call failed');
    });
}

// Here we'll process the data for the template method to use
function goDataGo(data) {
    

    var results = data.response.results;
     
    // put this reference to the results array into a variable just so it's easier to manage
    // For each item in the results array, send that result to the template method to deal with
    // i is the key in the array to send, starting with 0
    // Don't use the jQuery each function - that's best used for DOM manipulation. A for loop is fine
    for (var i = 0; i < results.length; i += 1) {


        //Getting the date    
        var timeDate = results[i].webPublicationDate,
            // get the UTC Date/time record from each story
            date = new Date(timeDate),
            // convert the string into a date object that js can understand
            newDate = date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear();
        // recreate it into the format we want : dd/mm/yyyy  newDate = date.getDate() + "/" + ( '0' + (date.getMonth()+1) ).slice( -2 ) + "/" + date.getFullYear(); 
        results[i].newDate = newDate; // add it as a new record in the JSON response object
        //Getting the time
        var Datetime = results[i].webPublicationDate,
            time = new Date(Datetime),
            newTime = ('0' + (time.getHours())).slice(-2) + "." + ('0' + (time.getMinutes())).slice(-2);
        results[i].newTime = newTime;


        //check to see if each article has full story content and assign the correct template based on the result
        if(undefined === results[i].fields.body || results[i].fields.body.length < 100){
            headlineFail(results[i]);
        }else
        {
          headlineSuccess(results[i]);
        }

        //add results to template below
       
        
    }

    //right menu open/close stuff
    $('.story').on('tap click', function() {

        var TriggerClicking = 0;
        var index = $(this).index();
        var currentStory = results[index].fields.body;
        var currentTrailText = results[index].fields.trailText;
        var currentHeadline = results[index].webTitle;
        var timeDate = results[index].webPublicationDate,
            // get the UTC Date/time record from each story
            date = new Date(timeDate),
            // convert the string into a date object that js can understand
            newDate = date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear();
        // recreate it into the format we want : dd/mm/yyyy  newDate = date.getDate() + "/" + ( '0' + (date.getMonth()+1) ).slice( -2 ) + "/" + date.getFullYear(); 
        results[index].newDate = newDate; // add it as a new record in the JSON response object
        //Getting the time
        var Datetime = results[index].webPublicationDate,
            time = new Date(Datetime),
            newTime = ('0' + (time.getHours())).slice(-2) + "." + ('0' + (time.getMinutes())).slice(-2);
            results[index].newTime = newTime;
        var storyContainer = $(this).closest('.tab-content').attr('id');
        var sectionBg = backgroundImage[storyContainer];
        if (undefined !== currentStory && currentStory.length > 100) {
            if (!$('html').hasClass('open-menu')) {
                if (TriggerClicking === 0) {
                    TriggerClicking = 1;
                    $('.content-news-full .fullcontent').append("<div class='generalpic'></div><h1 class='currentHeadline'>" + currentHeadline + "</h1><p class='currentTime'>" + newDate + "<span> Updated " + newTime + "</span></p><div class='currentTrailText'>" + currentTrailText + "</div><div class='currentStory'>" + currentStory + "</div>");
                    $('.generalpic').css('background', 'url(' + sectionBg + ')');
                    $('.currentStory .block.is-key-event:contains("Wicket!"), .currentStory .block:contains("WICKET!"), .currentStory .block:contains("wicket!")').addClass('wicket');
                    $('.currentStory .block.is-key-event:contains("REVIEW"), .currentStory .block.is-key-event:contains("review"), .currentStory .block.is-key-event:contains("Review")').addClass('review');
                    $('.currentStory br').remove();
                    $('.element-tweet').closest('.block').addClass('twitter');
                             
                        $('html').addClass('open-menu-right');
                    $('.content-news-full').css('visibility', 'visible');
                }
            }
        } else {
           var storyLink = $(this).find("a");
           storyLink.attr("target", "_blank");
           window.open(storyLink.attr("href"));
        }
        return false;
    });
}


//close the right menu by click the .close button
// Here we can break out each result, and put the info into a template
// At this point we only need to get 'result.webTitle' instead of 'data.response.results[i].webTitle'
// Every time this method is called it'll put the right information into our 'template' and add it to the DOM

function headlineFail(data) {
    var source = $("#headlines-fail").html();
    console.log(source);
    var template = Handlebars.compile(source);
    var html = template(data);
    $('.tab-content.current .newsStory').append(html);
}

function headlineSuccess(data) {
    var source = $("#headlines-success").html();
    console.log(source);
    var template = Handlebars.compile(source);
    var html = template(data);
    $('.tab-content.current .newsStory').append(html);
}

//loading icon on ajax call

function loadingFav() {
    $('.content-wrapper').append($("<div class='loading'/>"));
    var cake = $('.loading');
    cake.css("position", "absolute");
    cake.css("top", (($(window).height() - 40) - cake.height()) / 2 + $(window).scrollTop() + "px");
    cake.css("left", ($(window).width() - cake.width()) / 2 + $(window).scrollLeft() + "px");
}

$('.close').on('tap click', function() {
    if ($('html').hasClass('open-menu-right')) {
        $('html').removeClass('open-menu-right');
        $('.content-wrapper').delay(400).queue(function() {
            $('.content-news-full .fullcontent').empty();
            $('.content-news-full').css('visibility', 'hidden');
            $(this).dequeue();
        });
    }
    return false;
});

//adding content to content-wrapper onclick and also closing menu
$('ul.tabs li').on('tap click', function() {
    //working the tabs with current class
    var tab_id = $(this).attr('data-tab');
    $('ul.tabs li').removeClass('current');
    $('.tab-content').removeClass('current');
    $(this).addClass('current');
    $("#" + tab_id).addClass('current');
    //making the ajax call
    var searchRes = $(this).attr('data-role');
    if ($("#" + tab_id).find('.story').length < 1 && $(this).hasClass('current')) {
        datastorage(searchRes);
    }
    //remove title and replace with title from list element
    $('.header p.sportstitle, .header p.sportsarticle').empty();
    $('.header p.sportstitle').append($(this).find('p').html() + ' News');
    $('.header p.sportsarticle').append($(this).find('p').html() + ' Article');
});

//this is the stuff for the left nav menu
var TriggerClick = 0;
$('.menu, ul.tabs li').on('tap click', function(e) {
    e.preventDefault();
    if (TriggerClick === 0) {
        TriggerClick = 1;
        $('html').addClass('open-menu');
        $('.left-menu').show();
    } else {
        TriggerClick = 0;
        $('html').removeClass('open-menu');
        $('.left-menu').delay(400).fadeOut('fast');
    }
    return false;
});

//making the content-wrapper close on click when menu is open
$('.content-wrapper section').on('tap click', function() {
    if ($('html').hasClass('open-menu')) {
        TriggerClick = 0;
        $('html').removeClass('open-menu');
        $('.left-menu').delay(400).fadeOut('fast');
    }
    return false;
});

$(document).ready(function() {
    //making the ajax call on load of the first tab which is football   
    datastorage('section=sport');
    var desiredHeight = $(window).height() - 43;
    $('.content-wrapper').css("height", desiredHeight);
    var desiredHeights = $(window).height();
    $('body, html').css("height", desiredHeights);
    $('.tab-content > div .story .image-container img[src=""]').parent().addClass('noImage');
    $('.tab-content > div .story .image-container img[src=""]').remove();
});