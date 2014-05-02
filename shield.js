// Global Variables
var scriptElement = document.getElementById( 'shieldScript' ),
	baseUrl = scriptElement !== null ?
		scriptElement.getAttribute('src').replace(/\/schieldScript\.js$/, '') :
		'https://raw.github.com/Bryanarby/S.H.I.E.L.D./master',
	SHIELD = {
		'baseUrl': baseUrl,
		'branch' : 'M',
		'version': 0.11
	};

// Load external libraries
var script_list = [
    '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js',
    '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css',
    '//cdn.jsdelivr.net/underscorejs/1.6.0/underscore-min.js',
    SHIELD.baseUrl + '/shield_main.js',
  ]
  
SHIELD.loadInterval = setInterval(function() {
  if (game) {
    clearInterval(SHIELD.loadInterval);
    SHIELD.loadInterval = 0;
    shieldInit();
  }
}, 1000);

function loadScript(id) {
  if (id >= script_list.length) {
    setOverrides();
    SHIELDStart();
  } else { 
    var url = script_list[id];
    if (/\.js$/.exec(url)) {
      $.getScript(url, function() {loadScript(id + 1);});
    } else if (/\.css$/.exec(url)) {
      $('<link>').attr({rel: 'stylesheet', type: 'text/css', href: url}).appendTo($('head'));
      loadScript(id + 1);
    } else {
      console.log('Error loading script: ' + url);
      loadScript(id + 1);
    }
  }
}

function shieldInit() {
  var jquery = document.createElement('script');
  jquery.setAttribute('type', 'text/javascript');
  jquery.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
  jquery.onload = function() {loadScript(0);};
  document.head.appendChild(jquery);
}
