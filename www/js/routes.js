angular.module('yiave.routes', [])

.config(function($stateProvider, $urlRouterProvider) {
   
    //验证链接处理
    $urlRouterProvider.when("/account/confirm/{token}", function($state ,$match, $stateParams, $http, $rootScope, $cookies,userService){
        //var path = $location.path();
        //console.log(path);

        var id = $cookies.get("userid");
        var token = $match.token;

        //http://api.yiave.com/v1/customers/2/confirm/{token}

        var url = "http://api.yiave.com/v1/customers/"+id+"/confirm/"+token;
        $http.get(url)
        .success(function(data, status, headers, config){
            /*
            {
                    “id”: 2,
                  “username”: “test”,
                  “email”: “test@yiave.com”,
                  “signup_date”: “2016-05-24 15:21:34”
                  “is_confirmed”: true
                }

            */
            //console.log(status);
            if(data.is_confirmed == true){
                $cookies.put("userid", data.id);

                $rootScope.hasLogin = true;
                $http.get("http://api.yiave.com/v1/customers/"+data.id)
                .success(function (data, status, headers, config) {
                    
                    $rootScope.hasLogin = true;
                    $rootScope.userid = data.id;
                    userService.init();
                    $state.go("tab.me");
                })
                .error(function (data, status, headers, config){

                })
            }
        })
        .error(function(data, status, headers, config){
            console.log(status);
        })

    })

    //默认状态是tab.home
    .otherwise("/tab/home");
    
    $stateProvider
        //------------------------------tabs-----------------------------------

        .state("tab", {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html",
        })
        //tab.message状态被激活,会显示tab-message.html模板, 
        //tab.message状态是在tabs.html中的ui-sref中设置的. 
        //同时注意views中的tab-message名字, 这个需要跟tabs.html中的ion-nav-view中的name一致
        .state('tab.home', {
            url: '/home',
            views: {
                'tab-home': {
                    templateUrl: 'templates/tab-home.html',
                    controller: "homeCtrl",
                    // resolve: {
                    //     getPromotions : function ($http) {
                            
                    //         return $http({
                    //             method: 'GET',
                    //             url: 'http://api.yiave.com/v1/promotions'
                                
                    //       });
                    //     }
                    // }
                }
            }
        })

        .state('tab.chat', {
            url: '/chat',
            views: {
                'tab-chat': {
                    templateUrl: 'templates/tab-chat.html',
                    controller: "chatCtrl"
                
                }
            }
        })

        .state('tab.me', {
            url: '/me',
            views: {
                'tab-me': {
                    templateUrl: 'templates/tab-me.html',
                    controller: 'meCtrl'
                }
            },
            
        })
        
        //----------------------------Promotion-------------------------------
        .state('promoDetails',{
            url: '/promoDetails/:promoID',
            views:{
                '':{
                    templateUrl: 'templates/promo-details.html',
                    controller: 'promotionCtrl'
                }
            }
            
        })

        .state('submitWish', {
            url: '/promoDetails/:promoID/submitWish',
            views:{
                '':{
                    templateUrl: 'templates/promo-submit-wish.html',
                    controller: 'promotionCtrl'
                }
            }
            
        })


        //------------------------------Chat--------------------------------------
        .state('chatMessage',{
            url: '/chatMessage/:messageId',
            templateUrl: 'templates/chat-message.html',
            controller: "messageCtrl"
                          
        })

        //-------------------------------Notice---------------------------------------
        .state('notice', {
            url: '/notice',
            templateUrl: 'templates/notice.html'
            
        })

        .state('noticeList1', {
            url: '/noticeList1',
            templateUrl: 'templates/notice-list1.html'   
            
        })

        .state('noticeList2', {
            url: '/noticeList2',
            templateUrl: 'templates/notice-list2.html'   
               
        })

        .state('noticeList3', {
            url: '/noticeList3',
            templateUrl: 'templates/notice-list3.html'
               
        })

        .state('noticeDetails', {
            url: '/noticeDetails',
            templateUrl: 'templates/notice-details.html'
           
        })

        //--------------------------------User--------------------------------------
        .state('userInfo', {
            url: '/userInfo',
            templateUrl: 'templates/user-info.html',
            controller: 'userCtrl'
            // resolve: {
            //     getUser: function () {
            //          /* body... */ 
            //          return $http({
            //             method: 'GET',
            //             url: 'http://api.yiave.com/v1/customers/1'
                        
            //       });
            //     },
            //     person: function() {
            //       return {
            //         name: "Ari",
            //         email: "ari@fullstack.io"
            //         };
            //     }
            // },

            // controller: function($scope,getUser,person){
            //     $scope.person = person;
            //     $scope.user = getUser.user;
            //     //$scope.user = $rootScope.loginUser;

            // }
            
        })
        
        .state('userFocus', {
            url: '/userFocus',
            templateUrl: 'templates/user-focus.html'
               
        })

        .state('userComments', {
            url: '/userComments',
            templateUrl: 'templates/user-comments.html'
               
        })

        .state('userRecommend', {
            url: '/userRecommend',
            templateUrl: 'templates/user-recommend.html'
               
        })

        .state('businessInfo', {
            url: '/businessInfo',
            templateUrl: 'templates/business-info.html'
               
        })

        .state('aboutUs', {
            url: '/aboutUs',
            templateUrl: 'templates/about-us.html'
               
        })

        //--------------------------------Login and register---------------------------------
        .state('login',{
            url: '/login',
            templateUrl: 'templates/login.html'
                          
        })

        .state('register',{
            url: '/register',
            //templateUrl: 'templates/phone-register-step1.html'
            templateUrl: 'templates/register.html',
            controller: "registerCtrl"
                          
        })

        .state('registerStep2',{
            url: '/register',
            templateUrl: 'templates/phone-register-step2.html',
            controller: "registerCtrl"                
        })

        .state('registerStep3',{
            url: '/register',
            templateUrl: 'templates/phone-register-step3.html',
            controller: "registerCtrl"              
        })

        .state('mailRegister',{
            url: '/register',
            templateUrl: 'templates/mail-register.html',
            //controller: "registerCtrl"              
        })

        .state('waitToConfirm',{
            url: '/waitToConfirm',
            templateUrl: 'templates/wait-to-confirm.html',
            controller: "registerCtrl"              
        })


});