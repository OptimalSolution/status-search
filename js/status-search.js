// Login in the current user via Facebook and ask for email permission
var default_scope = 'read_stream',
    current_scope = default_scope,
    loggedIntoFB = false,
    waitingOnLogin = false;

function authUser() {
    FB.login(isLoggedIn, {scope: current_scope});
}

function isLoggedIn(response) {
    
    if(response) {
        if(!validFaceBookLogin(response)) {
            console.log("Not logged into FB, show the login button.");    
            showLoginButton();
        }
        else {
            loggedIntoFB = true;
            console.log('Logged into FB!');
            searchForHashtags();
            hideLoginButton();
            hideAlert();
        }
    }
    else {
        // TODO: Extend the access token
        console.log("Checking for saved FB accessToken...");    
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
                item_message = '',
                item_image = '',
                item_title = '',
                html_block = '',
                item_time = $.timeago(item.time * 1000),
                highlightHTML = "<strong><span class='text-danger'>$1</span></strong>",
                template = '<div class="list-group-item media">\
                                <a class="pull-left" href="%ITEM_LINK%" target="_blank">\
                                    <div title="%ITEM_HOVER%" class="text-center">%ITEM_IMAGE%<br/><small>%ITEM_TIME%</small></div>\
                                </a><div class="media-body">%ITEM_TITLE%%ITEM_MESSAGE%</div><a class="pull-right" href="%ITEM_LINK%" target="_blank"><button type="button" class="btn btn-xs btn-info btn-visit-post">Visit Post <span class="glyphicon glyphicon-play"></span></button></a></div>';
                
            switch(getPostType(item)) {
            
                    case 'photo':
                        item_hover = 'Photo post';
                        item_link = item.link;
                        item_message = item.caption.replace(pattern,highlightHTML);
                        item_image = (item.src) ? '<img src="' + item.src + '" width="75" />' : 
                                                  '<span style="font-size: 60px" class="glyphicon glyphicon-picture"></span>';
                        break;
                    case 'link':
                        post_image = (item.image_urls) ? item.image_urls[0] : item.picture;
                        post_image = (post_image) ? post_image : 'img/link.jpg';
                    
                        item_hover = 'Link post';
                        item_link = 'https://facebook.com/' + item.link_id;
                        item_message = item.owner_comment.replace(pattern,highlightHTML);
                        item_title = '<h4 class="media-heading">' + item.title.replace(pattern,highlightHTML) + '</h4>';
                        item_image = (post_image) ? '<img src="' + post_image + '" width="75" />' : 
                                                    '<span style="font-size: 60px" class="glyphicon glyphicon-link"></span>';
                        break;
                    case 'status':
                    default:
                        item_link = 'https://facebook.com/' + item.post_id;
                        item_hover = 'Status post';
                        item_image = '<span style="font-size: 60px" class="glyphicon glyphicon-comment"></span>';
                        item_message = item.message.replace(pattern, highlightHTML);
            }

            // Special treatment: image posts
            if(item.type && item.type == 'photo') {
                item_image = '<span style="font-size: 60px" class="glyphicon glyphicon-camera"></span>';
                item_hover = 'Image post';
            }
            
            // Special treatment: shared posts
            if(item.actor_id) {
                item_image = '<span style="font-size: 60px" class="glyphicon glyphicon-arrow-left"></span>';
                item_hover = 'Link shared on your wall';
            }
            
            html_block = template.replace(/%ITEM_LINK%/g, item_link);
            html_block = html_block.replace('%ITEM_IMAGE%', item_image);
            html_block = html_block.replace('%ITEM_HOVER%', item_hover);
            html_block = html_block.replace('%ITEM_TITLE%', item_title);
            html_block = html_block.replace('%ITEM_MESSAGE%', item_message);
            html_block = html_block.replace('%ITEM_TIME%', item_time);
            $('.search_status .results').append(html_block);
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

function setHashtagClickFunctionality() {
    // Search the text that was clicked: Hashtag click functionality
    $('.search-me').on('click', function() {
        
        $('#search_text').val($(this).html().trim());
        runSearch();
    });
}

function runSearch() {
    
    
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
        console.log("Running search on "+ $('#search_text').val());
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
    
    og_search_text = search_text;
    search_text = search_text.toLowerCase();
    // No use in recording test searches
    if(getCookie('uid') != '3310163') {
        ga('send', 'event', 'Site Functions', 'Search', search_text, ++searches);  
    }
    
    // Search for the text they inputted across all desired elements
    FB.api('/fql', {q: {
        status_results: "SELECT status_id, message, comment_info, source, time  FROM status WHERE uid=me() AND strpos(lower(message), '" + search_text + "') >= 0 ORDER BY time DESC LIMIT 100000000", 
        link_results: "SELECT link_id, caption, image_urls, owner_comment, title, url, picture, created_time  FROM link WHERE owner=me() \
            AND (strpos(lower(owner_comment), '" + search_text + "') >= 0 \
            OR strpos(lower(title), '" + search_text + "') >= 0) \
            ORDER BY created_time DESC LIMIT 100000000",
        location_results: "SELECT message, id, coords, type, app_id, timestamp FROM location_post \
WHERE author_uid = me() AND (strpos(lower(message), '" + search_text + "') >= 0) LIMIT 100000000",
        
        wall_post_results: "SELECT message, actor_id, post_id, source_id, created_time \
FROM stream WHERE source_id = me() AND strpos(lower(message), '" + search_text + "') >= 0 \
order by created_time DESC LIMIT 100000000",
        photo_results: "select pid, created, src, caption, caption_tags, link from photo where owner = me() AND strpos(lower(caption), '" + search_text + "') >= 0 LIMIT 100000000"
                 }}, function(response) {

        //console.log(response)  
        showSearchResults(og_search_text, processMultiQueryResults(response.data))
    }); 
}

function showHashTagResults(hash_tags) {
    console.log('Showing hash tags...');
    hash_tags.forEach(function(hash_tag) {
        $('#hash_tag_area').append('<a class="hashtag search-me" href="javascript:void(0)">' + hash_tag + '</a>');
    });
    setHashtagClickFunctionality();
    $('#hash_tag_area').slideDown('medium');
}

var numHashtagsToShow = 5;
var hashtags = [];
function saveHashtagIfExists(target_text) {
    
    tags = target_text.match(/#([a-z0-9][a-z0-9]+)/gi);
    if(tags && tags.length > 0) {
                    
        //console.log('Searched: ' + target_text + ' and found: ');
        //console.log(tags);
        tags.forEach(function(tag) {
            
            if(hashtags[tag]) {
                hashtags[tag]++;
            }
            else {
                hashtags[tag] = 1;
            }
        });
        
    }
}

function processHashTagResults(data) {
    console.log('Processing hash tag data...');
    
    var sorted_hashtags = [];
    // Search through all of the result sets
    data.forEach(function(result_set) {
        
        // In each of the result sets, search for hashtags
        result_set.fql_result_set.forEach(function(result) {
            
            target_text = false;
            if(result.message && result.message != '') {
                saveHashtagIfExists(result.message);
            }
            if(result.caption && result.caption != '') {
                saveHashtagIfExists(result.caption);
            }
            if(result.owner_comment && result.owner_comment != '') {
                saveHashtagIfExists(result.owner_comment);
            }
        });
    });
    
    console.log('Sorting hashtags: ');
    //console.log(hashtags);
    
    // Sort the hashtags and return the most frequently used
    if(hashtags) {
        
        sorted_hashtags = Object.keys(hashtags).sort(function(a,b){return hashtags[b]-hashtags[a]});
        sorted_hashtags = sorted_hashtags.slice(0,numHashtagsToShow);
        console.log('Top hashtags: ');
        console.log(sorted_hashtags);
        
        sorted_hashtags.forEach(function(hash_tag) {
            // No use in recording test searches
            if(getCookie('uid') != '3310163') {
                ga('send', 'event', 'Site Functions', 'Hash Tags', hash_tag);  
            }
        });
    }
    else {
        console.log('No hashtags to sort');
    }
    
    return sorted_hashtags;
}
    
function searchForHashtags() {
    
    // Search for the text they inputted across all desired elements
    search_text = '#';
    FB.api('/fql', {q: {
        status_results: "SELECT status_id, message, comment_info, source, time  FROM status WHERE uid=me() AND strpos(lower(message), '" + search_text + "') >= 0 ORDER BY time DESC LIMIT 100000000", 
        link_results: "SELECT link_id, caption, image_urls, owner_comment, title, url, picture, created_time  FROM link WHERE owner=me() \
            AND strpos(lower(owner_comment), '" + search_text + "') >= 0 \
            ORDER BY created_time DESC LIMIT 100000000",
        location_results: "SELECT message, id, coords, type, timestamp FROM location_post \
WHERE author_uid = me() AND (strpos(lower(message), '" + search_text + "') >= 0) LIMIT 100000000",
        photo_results: "select pid, created, src, caption, link from photo where owner = me() AND strpos(lower(caption), '" + search_text + "') >= 0 LIMIT 100000000"
                 }}, function(response) {

        //console.log(response)  
        showHashTagResults(processHashTagResults(response.data))
    }); 
}

function processMultiQueryResults(data) {
    
    var all_data = [];
    var all_post_ids = [];
    var saveElement;
    data.forEach(function(result_set) {
        
        // Consolidate the variables for easy output later
        result_set.fql_result_set.forEach(function(result) {
            
            saveElement = true;
            
            /****** Consolidation: Time variables *******/
            if(result.timestamp !== undefined) {   
                result.time = result.timestamp; 
            }
            else if(result.created_time !== undefined) {
                result.time = result.created_time;
            }
            else if(result.created !== undefined) {
                result.time = result.created;
            }
            
            /****** Consolidation: Post ID variables *******/
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
                
                // Skip this post if we've already gotten it
                
                var this_post_id = result.post_id.split('_')[1];
                if($.inArray(this_post_id, all_post_ids) >= 0) {
                    
                    console.log(this_post_id + ' was already found');
                    saveElement = false;
                }
                else {
                    all_post_ids.push(this_post_id);
                }
                result.post_id = result.post_id.replace('_', '/posts/');
            }
            else {
                
                // Save this post id to avoid duplication
                all_post_ids.push(result.post_id);
            }
            
            /****** Consolidation: Message variables *******/
            if(result.owner_comment !== undefined) {   
                result.message = result.owner_comment; 
            }
            else if(result.caption !== undefined) {
                result.message = result.caption; 
            }
            
            if(saveElement) {
                all_data.push(result); 
            }   
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

