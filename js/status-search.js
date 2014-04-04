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
    else if(item.pid) {
        return 'photo';
    }
    else {
        return 'generic';
    }    
}

function showSearchResults(search_text, results) {
    
    console.log('showSearchResults:');
    console.log(results);
    
    // Clear previous results and error messages
    $('.search_status .results').html('');
    
    if(results.length > 0) {
        
        // Tell them how many times their search text occurred
        $('.search_status .results').append("<div class='text-center'><span class='glyphicon glyphicon-info-sign'></span> <strong><span class='text-danger'>\"" + search_text + '"</span></strong> was found ' + ((results.length > 100) ? 'at <em><strong>LEAST</strong></em> ' : '') + results.length + ' times.</div>');
        
        // Highlight the search text in each results and append them to the results section
        
        /**** INSERT after the 10th entry *****
        
        <a href="http://secure.hostgator.com/~affiliat/cgi-bin/affiliates/clickthru.cgi?id=themightyafro-"><img src="http://tracking.hostgator.com/img/Shared/728x90.gif" border="0"></a>
        
        <a href="http://secure.hostgator.com/~affiliat/cgi-bin/affiliates/clickthru.cgi?id=themightyafro-"><img src="http://tracking.hostgator.com/img/Shared/468x60.gif" border="0"></a>
        
        ****************/
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
                    case 'photo':
                        post_image = (item.src) ? item.src : 'img/link.jpg';
                        $('.search_status .results').append('<div class="list-group-item media">\
            <a class="pull-left" href="' + item.link + '" target="_blank">\
            <img class="media-object" src="'+ post_image +'" alt="Post image" width="75"><small>' + $.timeago(item.created * 1000) + '</small></a>\
            <div class="media-body">'+ item.caption.replace(pattern,highlightHTML) +'</div></div>')
                        break;
                    case 'link':
                        post_image = (item.image_urls) ? item.image_urls[0] : item.picture;
                        post_image = (post_image) ? post_image : 'img/link.jpg';
                        $('.search_status .results').append('<div class="list-group-item media">\
            <a class="pull-left" href="https://facebook.com/' + item.link_id + '" target="_blank">\
            <img class="media-object" src="'+ post_image +'" alt="Post image" width="75"><small>' + $.timeago(item.time * 1000) + '</small></a>\
            <div class="media-body"><h4 class="media-heading">'+ item.title.replace(pattern,highlightHTML) +'</h4>'+ item.owner_comment.replace(pattern,highlightHTML) +'</div></div>')
                        break;
                    default:
                        $('.search_status .results').append('<a href="https://facebook.com/' + item.post_id + '" class="list-group-item" target="_blank" ><b>' + $.timeago(item.time * 1000) + ':</b> ' + item.message.replace(pattern,highlightHTML) + '</a>');
                        break;
            }
        });
    }
    else {
        // Tell them we couldn't find anything
        $('.alert .text').html("<span class='glyphicon glyphicon-exclamation-sign'></span> Couldn't find any status messages with '" + search_text + "' in them.")
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

    /** News Feed search
    SELECT call_to_action, message, actor_id, post_id, source_id, type, app_id, created_time, description FROM stream WHERE filter_key = 'nf' AND strpos(lower(message), 'bridal') >= 0
    
    ***/
    
    FB.api('/fql', {q: {
        status_results: "SELECT status_id, message, comment_info, source, time  FROM status WHERE uid=me() AND strpos(lower(message), '" + search_text + "') >= 0 ORDER BY time DESC LIMIT 100", 
        link_results: "SELECT link_id, caption, image_urls, owner_comment, title, url, picture, created_time  FROM link WHERE owner=me() \
            AND (strpos(lower(owner_comment), '" + search_text + "') >= 0 \
            OR strpos(lower(title), '" + search_text + "') >= 0 \
            OR strpos(lower(summary), '" + search_text + "') >= 0) \
        ORDER BY created_time DESC LIMIT 100",
        location_results: "SELECT message, id, coords, type, app_id, timestamp FROM location_post \
WHERE author_uid = me() AND (strpos(lower(message), '" + search_text + "') >= 0)",
        wall_post_results: "SELECT message, actor_id, post_id, source_id, created_time \
FROM stream WHERE source_id = me() AND strpos(lower(message), '" + search_text + "') >= 0 \
order by created_time DESC LIMIT 10000",
        photo_results: "select pid, created, src, caption, caption_tags, link from photo where owner = me() AND strpos(lower(caption), '" + search_text + "') >= 0 LIMIT 100"
        
                 }}, function(response) {

        console.log(response)  
        showSearchResults(search_text, processMultiQueryResults(response.data))
    }); 
}

function processMultiQueryResults(data) {
    
    var all_data = [];
    data.forEach(function(result_set) {
        
        result_set.fql_result_set.forEach(function(result) {
            
            // Consolidate all of the time variables into one for easy sorting
            if(result.timestamp !== undefined) {   
                result.time = result.timestamp; 
            }
            else if(result.created_time !== undefined) {
                result.time = result.created_time;
            }
            
            // Consolidate all of the post_id variables into one for easy linking
            if(result.id !== undefined) {   
                result.post_id = result.id.toString(); 
            }
            else if(result.status_id !== undefined) {
                result.post_id = result.status_id.toString();
            }
            else if(result.link_id !== undefined) {
                result.post_id = result.link_id.toString();
            }
            else if(result.pid !== undefined) {
                result.post_id = result.pid.toString();
            }
            else if(result.post_id !== undefined) {
                result.post_id = result.post_id.toString();
            }
            
            // This is a post from a friend to a wall, so extract the facebook ID from it
            if(result.post_id && result.post_id.indexOf('_') > 0) {
               result.post_id = result.post_id.replace('_', '/posts/');
            }
            
            all_data.push(result);        
        });
        
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

