<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Status Search</title>

    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css">
  </head>
  <body>
    <div id="fb-root"></div>
    <div class="container">
      
        <h1>Status Search <span class="badge" style="position: relative; bottom: 15px">Beta</span></h1>
        <p class="lead">Having trouble remembering if you've posted something or not? Search and see!</p>
          <p class="lead login-message" style="display:none">First thing's first:        
            <button id="login-button" type="button" onclick="authUser();" class="btn btn-primary btn-med" style="position: relative; bottom: 3px"><span class="glyphicon glyphicon-hand-right"></span>&nbsp; Connect to Facebook</button>
          </p>
          <!-- Statuses -->
          <div class="row search_status">
            <div class="col-sm-8">          
              <div class="panel panel-info">
                <div class="panel-heading">
                  <h3 class="panel-title">Search for something you've said:</h3>
                </div>
                <div class="panel-body">
                  <div class="row">
                      <div class="col-lg-12">
                        <div class="input-group">
                          <input id="search_text" type="text" class="form-control" placeholder="Type in something you said in a post...">
                          <span class="input-group-btn">
                            <button id="search_status_btn" class="btn btn-primary" type="submit"><span class="glyphicon glyphicon-search"></span> Search</button>
                          </span>
                        </div><!-- /input-group -->
                      </div>
                          
                          <!-- Sorting button 
                    <div class="col-lg-3">
                        <div class="btn-group">
                          <button type="button" class="btn btn-info">Sorting</button>
                          <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown">
                            <span class="caret"></span>
                            <span class="sr-only">Toggle Dropdown</span>
                          </button>
                          <ul class="dropdown-menu" role="menu">
                            <li><a href="#">Time</a></li>
                            <li><a href="#">Likes</a></li>
                            <li><a href="#">Comments</a></li>
                          </ul>
                        </div>
                      </div><!-- /.col-lg-8 -->
                  </div>
                </div>
                <div class="results list-group"></div>
              </div>
              <div class="alert alert-danger" style="display: none"><span class="text"></span></div>
            </div><!-- /.col-sm-4 -->
              
              <div class="col-sm-4">          
              <div class="panel panel-info">
                <div class="panel-heading">
                  <h3 class="panel-title">Here's what you can search:</h3>
                </div>
                <div class="list-group">
                    <div class="list-group-item">
                        <h4 class="list-group-item-heading"><span class="glyphicon glyphicon-ok text-success"></span> Status Messages</h4>
                        <p class="list-group-item-text">These are the status messages you post yourself.</p>
                    </div>
                    <div class="list-group-item">
                        <h4 class="list-group-item-heading"><span class="glyphicon glyphicon-ok text-success"></span> Link Messages</h4>
                        <p class="list-group-item-text">These are the posts where you put a link in the status message.</p>
                    </div>
                    <div class="list-group-item">
                        <h4 class="list-group-item-heading"><span class="glyphicon glyphicon-ok text-success"></span> Link Titles</h4>
                        <p class="list-group-item-text">These is so you can search for the title of the link you posted (e.g., The name of a YouTube video).</p>
                    </div>
                    <div class="list-group-item text-muted">
                        <h4 class="list-group-item-heading">App Posts</h4>
                        <p class="list-group-item-text">These are the status messages posted for you by apps like <strong>Instagram</strong>.</p>
                    </div>
                    <div class="list-group-item text-muted">
                        <h4 class="list-group-item-heading">Check-ins</h4>
                        <p class="list-group-item-text">These are the places you check into or were checked into by friends.</p>
                    </div>
                    <div class="list-group-item text-muted">
                        <h4 class="list-group-item-heading">Post Comments</h4>
                        <p class="list-group-item-text">This is to help you remember what someone said in reference to your post.</p>
                    </div>
                    <div class="list-group-item text-muted">
                        <h4 class="list-group-item-heading">A Friend's Post</h4>
                        <p class="list-group-item-text">These are the things people post onto your wall.</p>
                    </div>
                </div>
              </div>
            </div><!-- /.col-sm-4 -->
          </div>
    </div><!-- /.container -->
      <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery-timeago/1.3.1/jquery.timeago.min.js"></script>      
    <script src="js/status-search.js"></script>
    <script>
       // Load the SDK asynchronously
        (function(d){
         var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement('script'); js.id = id; js.async = true;
         js.src = "//connect.facebook.net/en_US/all.js";
         ref.parentNode.insertBefore(js, ref);
        }(document));

        // Check if the current user is logged in and has authorized the app
        window.fbAsyncInit = function() {

            console.log('FB: Loaded');
            FB.init({
                appId      : '338414012939778',
                status     : true, // check login status
                cookie     : true, // enable cookies to allow the server to access the session
                xfbml      : true  // parse XFBML
            });

            FB.getLoginStatus(isLoggedIn);
        };
        //$('.alert').hide();
    </script>
      
      <script>
          // GA Tracking
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        
          ga('create', 'UA-12789796-5', 'sterlingonlinesolutions.com');
          ga('send', 'pageview');
      </script>
      
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <!-- Latest compiled and minified JavaScript -->
      
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
      
  </body>
</html>