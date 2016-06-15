// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('yiave', ['ionic', 'yiave.controllers', 'yiave.routes', 'yiave.directives',
 'yiave.services', 'ngCookies','ngCordova'
 //'monospaced.elastic'
 ])


.config(['$ionicConfigProvider', '$httpProvider', function($ionicConfigProvider, $httpProvider) {

    $ionicConfigProvider.tabs.position('bottom'); // other values: top

    //$httpProvider.defaults.headers.get = {"X-Authorization": "api_key"};

    $httpProvider.defaults.headers.common = {"Authorization": "api_key"};

}])


.run(function($ionicPlatform, $http, messageService, dateService, $rootScope, $cookies, userService, promotionService){

    $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });



    var url = "";
    /*if (ionic.Platform.isAndroid()) {
        url = "/android_asset/www/";
    }*/

    //get the userid from cookie
    /*var userid = $cookies.get('userid');

    if(userid == undefined){
        $rootScope.hasLogin = false;
        $rootScope.loginUser = {
            "id": -1,
            "nickname": '游客'
        };
    }else{
        $rootScope.hasLogin = true;
        $http.get("http://api.yiave.com/v1/customers/"+userid)
        .success(function (data, status, headers, config) {
            $rootScope.loginUser = data;
            console.log('');
        })
        .error(function (data, status, headers, config){
            console.log(status);

        })


    }*/

    //userService.init();
    var userid = $cookies.get('userid');

    if(userid == undefined){
        $rootScope.hasLogin = false;
        /*$rootScope.loginUser = {
            "id": -1,
            "nickname": '游客'
        };*/

    }else{
        $rootScope.hasLogin = true;
        $rootScope.userid = userid;
    }



    /*
    

    */


    /*
        {
  "business_id": 1, 
  "description": "\u4ec5\u5269\u4e09\u5929", 
  "end_time": "Tue, 07 Jun 2016 12:00:00 GMT", 
  "id": 1, 
  "image": "www.image.com", 
  "start_time": "Fri, 03 Jun 2016 12:00:00 GMT", 
  "title": "\u590f\u88c5\u5168\u573a\u4e00\u6298"
}
    */

    /*$http.get("http://api.yiave.com/v1/promotions/1")
    .then(function (response) {
        
        
        console.log('');
    },function (response) {
         
        console.log('');
    })*/


    $http.get(url + "data/json/messages.json").then(function(response) {
            // localStorageService.update("messages", response.data.messages);
            messageService.init(response.data.messages);

        });


});
