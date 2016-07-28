// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('yiave', ['ionic', 'yiave.controllers-home-tab','yiave.controllers-chat-tab','yiave.controllers-me-tab', 'yiave.routes', 'yiave.directives',
 'yiave.services', 'ngCookies','ngCordova', 'ionic-datepicker', 'ionic-timepicker', 'ionic-toast'
 //'monospaced.elastic'
 ])


.config(['$ionicConfigProvider', '$httpProvider', 'ionicDatePickerProvider', 'ionicTimePickerProvider',
    function($ionicConfigProvider, $httpProvider, ionicDatePickerProvider, ionicTimePickerProvider) {

    //设置默认tabs位置
    $ionicConfigProvider.tabs.position('bottom'); // other values: top

    //设置返回键icon及删除text
    $ionicConfigProvider.backButton.text('').icon('ion-android-arrow-back').previousTitleText(false);

    //$httpProvider.defaults.headers.get = {"X-Authorization": "api_key"};

    $httpProvider.defaults.headers.common = {"Authorization": "api_key"};

    var datePickerObj = {
      //inputDate: new Date(),
      setLabel: '设置',
      todayLabel: '今天',
      closeLabel: '关闭',
      mondayFirst: true,
      weeksList: [ "日", "一", "二", "三", "四", "五", "六"],
      monthsList: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      templateType: 'popup',
      showTodayButton: true,
      dateFormat: 'dd MMMM yyyy',
      closeOnSelect: false,
      //disableWeekdays: [6]
    };
    ionicDatePickerProvider.configDatePicker(datePickerObj);

    var timePickerObj = {
      //inputTime: ((new Date()).getHours() * 60 * 60),
      format: 24,
      step: 15,
      setLabel: '设置',
      closeLabel: '关闭'
    };
    ionicTimePickerProvider.configTimePicker(timePickerObj);

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
    if (ionic.Platform.isAndroid()) {
        url = "/android_asset/www/";
    }

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


    $http.get(url + "data/json/messages.json").then(function(response) {
            // localStorageService.update("messages", response.data.messages);
            messageService.init(response.data.messages);

        });
});