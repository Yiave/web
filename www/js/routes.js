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
            templateUrl: "templates/tabs.html"
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
                    controllerAs: 'controller'
                }
            }
        })

        .state('tab.chat', {
            url: '/chat',
            views: {
                'tab-chat': {
                    templateUrl: 'templates/tab-chat.html',
                    controller: "chatCtrl as controller"
                
                }
            }
        })

        .state('tab.me', {
            url: '/me',
            views: {
                'tab-me': {
                    templateUrl: 'templates/tab-me.html',
                    controller: 'meCtrl as controller'
                }
            },
            
        })
        
        //----------------------------Promotion-------------------------------
        .state('tab.promoDetails',{
            url: '/home/promotion/:promoID',
            views:{
                'tab-home':{
                    templateUrl: 'templates/home-promo-details.html',  
                    prefetchTemplate: false,                 
                    controller: 'promoDetailsCtrl as controller'

                }
            }
            
        })

        .state('tab.map', {
            url: '/home/promotion/map',
            views:{
                'tab-home':{
                    templateUrl: 'templates/home-map.html',  
                    prefetchTemplate: false,                 
                    controller: 'mapCtrl as controller'

                }
            }
        })

        .state('tab.submitWish', {
            url: '/home/promotion/:promoID/submitWish',
            views:{
                'tab-home':{
                    templateUrl: 'templates/home-submit-wish.html',
                    prefetchTemplate: false,
                    controller: 'wishSubmitCtrl as controller'
                }
            }
            
        })

        .state('tab.sysMatchRecom', {
            url: '/home/promotion/sysMatch',
            views:{
                'tab-home':{
                    templateUrl: 'templates/home-sysmatch-recommend.html',
                    abstract: true,
                    prefetchTemplate: false
                }
            }
            
        })

        .state('tab.sysMatchRecom.sysMatchWish', {
            url: '/wishRecom',
            views:{
                'sysMatch-wish':{
                    templateUrl: 'templates/home-sysmatch-wish.html',
                    prefetchTemplate: false,
                    controller: 'wishRecomCtrl as controller'
                }
            }
            
        })
        .state('tab.sysMatchRecom.sysMatchCobuy', {
            url: '/cobuyRecom',
            views:{
                'sysMatch-cobuy':{
                    templateUrl: 'templates/home-sysmatch-cobuy.html',
                    prefetchTemplate: false,
                    controller: 'cobuyRecomCtrl as controller'
                }
            }
            
        })

        //------------------------------Chat--------------------------------------
        .state('tab.chatMessage',{
            url: '/chat/message/:messageId',
            views:{
                'tab-chat':{
                    templateUrl: 'templates/chat-message.html',
                    prefetchTemplate: false,
                    controller: "messageCtrl"
                }
            }
            
                          
        })

        //-------------------------------Notice---------------------------------------
        .state('tab.notice', {
            url: '/me/notice',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-notice.html'
                }
            }  
            
        })

        .state('tab.noticeList1', {
            url: '/me/notice/noticeList1',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-notice-list1.html' 
                }
            } 
              
            
        })

        .state('tab.noticeList2', {
            url: '/me/notice/noticeList2',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-notice-list2.html' 
                }
            }  
               
        })

        .state('tab.noticeList3', {
            url: '/me/notice/noticeList3',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-notice-list3.html' 
                }
            } 
               
        })

        .state('tab.noticeDetails', {
            url: '/me/notice/noticeList/noticeDetails',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-notice-details.html'
                }
            } 
           
        })

        //--------------------------------User--------------------------------------
        .state('tab.userInfo', {
            url: '/me/info',
            views:{
                'tab-me':{
                    templateUrl: 'templates/me-info.html',
                    prefetchTemplate: false,
                    controller: 'userCtrl'
                }
            }   
        })
        
        .state('tab.userFocus', {
            url: '/me/focus',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-focus.html'
                }
            }    
        })

        .state('tab.userComments', {
            url: '/me/comments',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-comments.html'
                }
            }           
        })

        .state('tab.userRecommend', {
            url: '/me/recommend',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-recommend.html'
                }
            } 
            
               
        })

        .state('tab.businessInfo', {
            url: '/me/businessInfo',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-business-info.html'
                }
            }       
        })

        .state('tab.aboutUs', {

            url: '/me/aboutUs',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-about-us.html'
                }
            }   
        })

        //--------------------------------Login and register---------------------------------
        .state('tab.login',{
            url: '/me/login',
            views:{
                'tab-me':{
                    prefetchTemplate: false,
                    templateUrl: 'templates/me-login.html'
                }
            } 
            
                          
        })

        .state('tab.register',{
            url: '/me/register',
            views:{
                'tab-me':{
                    templateUrl: 'templates/me-register.html',
                    prefetchTemplate: false,
                    controller: "registerCtrl"
                }
            } 
            
                          
        })

        .state('registerStep2',{
            url: '/register',
            templateUrl: 'templates/phone-register-step2.html',
            prefetchTemplate: false,
            controller: "registerCtrl"                
        })

        .state('registerStep3',{
            url: '/register',
            templateUrl: 'templates/phone-register-step3.html',
            prefetchTemplate: false,
            controller: "registerCtrl"              
        })

        .state('tab.mailRegister',{
            url: '/register',
            views:{
                'tab-me':{
                    templateUrl: 'templates/mail-register.html',
                    prefetchTemplate: false
                }
            } 
            
            //controller: "registerCtrl"              
        })

        .state('waitToConfirm',{
            url: '/waitToConfirm',
            templateUrl: 'templates/wait-to-confirm.html',
            prefetchTemplate: false,
            controller: "registerCtrl"              
        })


});