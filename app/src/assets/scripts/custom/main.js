(function (window, $, undefined) {

	"use strict";

	var methods		= {};

	methods.init = function () {

		function datastorage(searchurl) {
			var storedData = JSON.parse(localStorage.getItem(searchurl)),
				currentTime,
				storedTime,
				difference,
				numminutes;

			if (storedData) {
				currentTime = new Date();
				storedTime = new Date(storedData.storedTime);
				difference = currentTime - storedTime;
				numminutes = Math.round(((difference % 86400000) % 3600000) / 60000);
			}

			//live blogging refresh
			if(storedData){
				var results = storedData.response.results;
				for (var i = 0; i < results.length; i += 1) {
					if(results[i].fields.liveBloggingNow === "true" && numminutes > 0){
						ajaxcall(searchurl);
					}
				}
			}

			if (storedData && numminutes < 10) {
				goDataGo(storedData);
			} else {
				ajaxcall(searchurl);
			}
		}

		function ajaxcall(searchurl) {
			$.ajax({
				type: "POST",
				url: 'http://content.guardianapis.com/search?api-key=5vk4jfy7myw4rdgfhg2hx7tn&show-fields=all&order-by=newest&q='+ searchurl +'&ion=sport',
				dataType: 'JSONP',
				success: function(data) {
					data.storedTime = new Date();

					localStorage.setItem(searchurl, JSON.stringify(data));

					if ($('ul.tabs li').hasClass('current')) {
						goDataGo(data);
					}
				},
				beforeSend: function() {
					$('body').append($("<div class='loading'/>"));
					$('.loading').fadeIn();
				},
				complete: function() {
					$('.loading').remove();
				}
			}).fail(function() {
				console.log('ajax call failed');
			});
		}

		function goDataGo(data) {
			var results = data.response.results;

			for (var i = 0; i < results.length; i += 1) {
				dateTime(data, i, results);
				headlineSuccess(results[i]);
			}

			fullStory(data);
		}

		function dateTime(data, i, results){

			var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var timeDate = results[i].webPublicationDate,
					date = new Date(timeDate),
					newDate = date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear();

				results[i].newDate = newDate;

				var Datetime = results[i].webPublicationDate,
					time = new Date(Datetime),
					newTime = ('0' + (time.getHours())).slice(-2) + "." + ('0' + (time.getMinutes())).slice(-2);

				results[i].newTime = newTime;
		}

		function fullStory(data){
			$('.story').on('click', function() {
				$(window).scrollTop('0px');
				var index = $(this).index(),
					results = data.response.results[index],
					currentStory = results.fields.body,
					currentTrailText = results.fields.trailText,
					currentHeadline = results.webTitle;

				if (undefined !== currentStory && currentStory.length > 100) {
					$('.full-story').append("<div class='generalpic'></div><h1 class='currentHeadline'>" + currentHeadline + "</h1><div class='currentTrailText'>" + currentTrailText + "</div><div class='currentStory'>" + currentStory + "</div>").addClass('opened');
					$('.content-wrapper, .menu, .back').addClass('opened');

				} else {
					var storyLink = $(this).find("a");
					storyLink.attr("target", "_blank");
					window.open(storyLink.attr("href"));
				}

				//$('.element-tweet').html('<blockquote class="twitter-tweet" lang="en-gb"><p><a href="https://twitter.com/Cricketbatcat/statuses/533141807689781249">November 14, 2014</a></blockquote>');

					if($(".twitter-tweet").length > 0){
						if (typeof (twttr) != 'undefined') {
							twttr.widgets.load();
						} else {
							$.getScript('http://platform.twitter.com/widgets.js');
						}
					}


			});
		}

		function headlineSuccess(data) {
			var source = $("#headlines-success").html(),
				template = Handlebars.compile(source),
				html = template(data);
			$('.tab-content.current .news-story').append(html);
		}

		function menuClick(item){
			var tab_id = item.attr('data-tab');
			$('ul.tabs li').removeClass('current');
			$('.tab-content').removeClass('current');
			item.addClass('current');
			$("#" + tab_id).addClass('current');

			var searchRes = item.attr('data-role');

			if ($("#" + tab_id).find('.story').length < 1 && item.hasClass('current')) {
				datastorage(searchRes);
			}

			$('.header p.sportstitle').empty();
			$('.header p.sportstitle').append(item.find('p').html() + ' News');
		}

		$(document).ready(function() {
			datastorage('sport');

			$('.menu, ul li').on('click', function() {
				$('ul, .menu, .content-wrapper, .full-story').toggleClass('active');
			});

			$('.back').on('click', function() {
				$('.content-wrapper, .full-story, .menu, .back').toggleClass('opened');
				setTimeout(function(){
					$('.full-story').empty();
				}, 500);
			});

			$('ul.tabs li').on('click', function() {
				var item = $(this);
				menuClick(item);
			});
		});
	};

	methods.init();

}(window, jQuery));