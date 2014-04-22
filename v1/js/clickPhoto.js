/*WebRTC*/
function capture(){
	var video = document.querySelector('video'),
		canvas = document.querySelector('canvas'),
		ctx = canvas.getContext('2d'),
		localMediaStream = null,
		img = $n('#capImg').currObj();
		ctx.translate(canvas.width, 0);
		ctx.scale(-1, 1);
	function snapshot() {
		if (localMediaStream) {
			ctx.drawImage(video, 0, 0);
			// "image/webp" works in Chrome.
			// Other browsers will fall back to image/png.
			
			//document.querySelector('img').src = canvas.toDataURL('image/webp');
			
			//$('#vidSec').hide();
			img.src = canvas.toDataURL('image/webp');
			$n('#imgSec').show();
		}
	}
	
	function errorCallback(error){
	  console.log("navigator.getUserMedia error: ", error);
	}
	
	video.addEventListener('click', snapshot, false);
	
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	
	// Not showing vendor prefixes or code that works cross-browser.
	
	var start = function(){
		navigator.getUserMedia({
			video: true
		}, function (stream){
			localMediaStream = stream;
			if($n('#sec2').getCss("display")=='block'){video.src = window.URL.createObjectURL(stream);$n('#vidSec').show()}
			else localMediaStream.stop();
		}, errorCallback);
	}
	var stop = function(){
		if(localMediaStream){
			localMediaStream.stop();
			localMediaStream = null;
			video.src = '';
			img.src = '';
			$n('#vidSec').hide();
			$n('#imgSec').hide();
		}
	}
	return {start:start,stop:stop}
}
