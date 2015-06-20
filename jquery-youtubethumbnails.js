(function() {
	$.fn.YTthumbnail = function (options) {
		//Merge the options with the defaults
		options = $.extend({
			apiKey: false,//The API key
			videoURL: null,//The video URL
			videoID: null,//The video ID
			minWidth: 320,//The minimum width for the thumbnail
			minHeight: 180,//The minimum height for the thumbnail
			fallbackImage: 'images/default.jpg',//The fallback image
			callback: null,//The callback
		}, options);

		//If there is no API key
		if (options.apiKey == false) {
			//Write error to console
			console.error('No API key set. Go to https://developers.google.com/youtube/registering_an_application for help creating an API key');
			return false;//Exit the plugin
		}

		//If there is no video ID
		if (options.videoID == "" || options.videoID == null) {
			//If there is no video URL
			if (options.videoURL == "" || options.videoURL == null) {
				//Write error to console
				console.error('No video URL or ID set.');
				return false;//Exit the plugin
			}
		}
		
		//Function to get video ID from URL
		_getIDFromURL = function(url) {
			try	{
				var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;//RegEx to get ID
				var match = url.match(regExp);//Run RegEx
				if (match && match[7].length == 11) {//Check if result is 11 characters long (All YouTube video IDs are 11 chars)
					return match[7];//Return the ID
				}
			} catch(ex) {
				//Write error to console
				console.error('Unable to get video ID from URL');
				return false;//Return false
			}
		};

		//If the video ID is not set
		if (options.videoID == null || options.videoID == "") {
			options.videoID = _getIDFromURL(options.videoURL);//Get and set the vido ID
			if (options.videoID == false) return false;//Exit if there was an error
		}

		//URL has to have &callback=? to force it to be handled as JSONP, otherwise it won't work in IE9
		$.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + options.videoID + '&key=' + options.apiKey + '&part=snippet&callback=?', function(data) {
			var thumbnails = data.items[0].snippet.thumbnails,//Get the thumbnails from the JSON
				bestQuality = {
					width: options.minWidth,
					height: options.minHeight,
					url: options.fallbackImage
				};//Set the default image
			
			//Loop through each thumbnail
			for (thumbnail in thumbnails) {

				//If this thumbnail is bigger than the current bestQuality
				if (thumbnails[thumbnail].width > bestQuality.width && thumbnails[thumbnail].height > bestQuality.height) {
					bestQuality.width = thumbnails[thumbnail].width;//Set the bestQuality width to this image
					bestQuality.height = thumbnails[thumbnail].height;//Set the bestQuality height to this image
					bestQuality.url = thumbnails[thumbnail].url;//Set the bestQuality URL to this image
				}

			}
			
			//If the callback is a function
			if ($.isFunction(options.callback)) {
				//Call the callback
				options.callback(bestQuality, thumbnails);
			}
		});

	}
})(jQuery);
