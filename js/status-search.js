// Login in the current user via Facebook and ask for email permission
var default_scope = 'read_stream',
    current_scope = default_scope

function authUser() {
    FB.login(isLoggedIn, {scope: current_scope});
}

function isLoggedIn(response) {
    
    if(response) {
        if(!validFaceBookLogin(response)) {
            console.log("isLoggedIn: Not logged in");    
            showLoginButton();
        }
        else {
            hideLoginButton();
            hideAlert();
        }
    }
    else {
        console.log("isLoggedIn: Not logged in from before");    
        return (getCookie('accessToken') && getCookie('uid'))
    }
}

function getPostType(item) {
    
    if(item.status_id) {
        return 'status';
    }
    else if(item.link_id) {
        return 'link';
    }
    else {
        return 'unknown';
    }    
}

function showSearchResults(search_text, results) {
    
    console.log('showSearchResults:');
    console.log(results);
    
    // Clear previous results and error messages
    $('.search_status .results').html('');
    
    if(results.length > 0) {
        
        // Tell them how many times their search text occurred
        $('.search_status .results').append("<div class='text-center'><span class='glyphicon glyphicon-info-sign'></span> <strong><span class='text-danger'>\"" + search_text + '"</span></strong> was found ' + results.length + ' times.</div>');
        
        // Highlight the search text in each results and append them to the results section
        results.forEach(function(item) {
            
            
            
                
            var pattern = new RegExp("(" + search_text + ")","gi"),
                timestamp = (item.time) ? item.time : item.created_time,
                owner_comment = '',
                highlightHTML = "<strong><span class='text-danger'>$1</span></strong>";

            owner_comment = owner_comment.replace(pattern,highlightHTML);
                
            switch(getPostType(item)) {
            
                    case 'status':
                        $('.search_status .results').append('<a href="https://facebook.com/' + item.status_id + '" class="list-group-item" target="_blank" ><b>' + $.timeago(item.time * 1000) + ':</b> ' + item.message.replace(pattern,highlightHTML) + '</a>');
                        break;
                    
                    case 'link':
                        post_image = (item.image_urls) ? item.image_urls[0] : item.picture;
                        post_image = (post_image) ? post_image : 'img/link.jpg';
                        $('.search_status .results').append('<div class="list-group-item media">\
            <a class="pull-left" href="https://facebook.com/' + item.link_id + '" target="_blank">\
            <img class="media-object" src="'+ post_image +'" alt="Post image" width="75"></a>\
            <div class="media-body"><h4 class="media-heading">'+ item.title.replace(pattern,highlightHTML) +'</h4>'+ item.owner_comment.replace(pattern,highlightHTML) +'</div></div>')
                        break;
                    default:
            }
        });
    }
    else {
        // Tell them we couldn't find anything
        $('.alert .text').html("Couldn't find any status messages with '" + search_text + "' in them.")
                   .parent().slideDown('fast');
    }
    
}

function showAlert(message) {
    $('.alert .text').html(message).parent().slideDown('fast');
}

function hideAlert() {
    $('.alert .text').parent().slideUp('fast');
}

function runSearch() {
    
    console.log("Running search on "+ $('#search_text').val());
    hideAlert();
    if(!isLoggedIn()) {
        // Tell them we couldn't find anything
        showAlert('Please connect to Facebook first!');
    }
    // Only run non-blank searches
    else if($('#search_text').val().trim() == '') {
        showAlert('Please type something in the search box first.');
    }
    // Only run non-blank searches
    else if($('#search_text').val().trim() != '') {
        
        // Let them know we're searching
        $('.search_status .results').html('<div class="progress progress-striped active">\
  <div class="progress-bar progress-bar-info col-lg-12" role="progressbar" aria-valuenow="100" aria-valuemin="100" aria-valuemax="100" style="width: 100%">Searching...\
    <span class="sr-only">Searching...</span></div></div>');
        searchStatusMessages($('#search_text').val())
    }
    
}

// Set what happens when the search button is clicked or ENTER is hit
$('#search_status_btn').on('click', runSearch);
$('#search_text').keyup(function(event){ 
    var keycode = (event.keyCode ? event.keyCode : event.which);   
    if(keycode==13){
       $('#search_status_btn').trigger('click');
    }
    return false;
});

var searches = 0;
function searchStatusMessages(search_text) {
    
    search_text = search_text.toLowerCase();
    ga('send', 'event', 'Site Functions', 'Search', search_text, ++searches);

    FB.api('/fql', {q: {
        status_results: "SELECT status_id, message, comment_info, source, time  FROM status WHERE uid=me() AND strpos(lower(message), '" + search_text + "') >= 0 ORDER BY time DESC LIMIT 0, 50", 
        link_results: "SELECT link_id, caption, image_urls, owner_comment, title, url, picture, created_time  FROM link WHERE owner=me() \
            AND (strpos(lower(owner_comment), '" + search_text + "') >= 0 \
            OR strpos(lower(title), '" + search_text + "') >= 0 \
            OR strpos(lower(summary), '" + search_text + "') >= 0) \
        ORDER BY created_time DESC LIMIT 0, 50"
        
                 }}, function(response) {

        console.log(response)  
        showSearchResults(search_text, processMultiQueryResults(response.data))
    }); 
}

function processMultiQueryResults(data) {
    
    var all_data = [];
    data.forEach(function(result_set) {
        
        // Process results for individual searches
        if(result_set.name == 'status_results') {
            result_set.fql_result_set.forEach(function(result) {
                all_data.push(result);        
            });
        }
        else if(result_set.name == 'link_results') {
            result_set.fql_result_set.forEach(function(result) {
                result.time = result.created_time; // Rename the timestamp for easy sorting
                all_data.push(result);        
            });
        }        
    })
    
    all_data.sort(function(a,b){return b.time-a.time});
    return all_data;
}

function showLoginButton() {
    $('.login-message').slideDown('medium')
}

function hideLoginButton() {
    $('.login-message').slideUp('medium')
}

function validFaceBookLogin(response) {
    
    if(response && response.status == 'connected') {
        setCookie('accessToken', response.authResponse.accessToken, 3);
        setCookie('uid', response.authResponse.userID, 3);
        return true;
    }
    return false;
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i in haystack) {
        if(haystack[i] == needle) { return true; }
    }
    return false;
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

