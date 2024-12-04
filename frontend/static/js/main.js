require.config({
    baseUrl: '/static/js',
    paths: {
        // the left side is the module ID,
        // the right side is the path to
        // the jQuery file, relative to baseUrl.
        // Also, the path should NOT include
        // the '.js' file extension. This example
        // is using jQuery 1.9.0 located at
        // js/lib/jquery-1.9.0.js, relative to
        // the HTML page.
        jquery: 'lib/jquery.min'
    }
});

type = document.getElementById("type").textContent || document.getElementById("#type").innerText;
console.log(type);

if(type === "show"){

require(["jquery", "/static/js/app/show.js"], function($, simon) {
    $(document).ready(function() {
		simon.init();
    });
});

}else if (type === "touch"){
require(["jquery", "/static/js/app/touch.js"], function($, simon) {
    $(document).ready(function() {
		simon.init();
    });
});
}

