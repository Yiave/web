angular.module('yiave.routes', [])

.config(function($stateProvider, $urlRouterProvider) {
   

    //默认状态是tab.home
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


    .otherwise("/tab/home");
    
    $stateProvider
        //如果是tab状态被激活, 加载tabs.html模板, 注意这里的abstract: true, 表示tab只有在子状态显示的时候, 它才显示, 它本身是无法主动被激活的
        .state("tab", {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html",
        })
        //tab.message状态被激活,会显示tab-message.html模板, tab.message状态是在tabs.html中的ui-sref中设置的. 同时注意views中的tab-message名字, 这个也需要跟tabs.html中的ion-nav-view中的name一致哦
        .state('tab.home', {
            url: '/home',
            views: {
                'tab-home': {
                    templateUrl: 'templates/tab-home.html',
                    controller: "promotionCtrl",
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
                    controller: "messageCtrl"
                
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
        

        .state('promoDetails',{
            url: '/promoDetails/:promoID',
            //url: '/promoDetails',
            views: {
                '': {
                    templateUrl: 'templates/promo-details.html',
                    controller: 'promotionDetailCtrl'
                    
                }
            } 

        })


        .state('chatMessage',{
            url: '/chatMessage/:messageId',
            templateUrl: 'templates/chat-message.html',
            controller: "messageDetailCtrl"
                          
        })

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
            controller: "registerCtrl"              
        })

        .state('waitToConfirm',{
            url: '/waitToConfirm',
            templateUrl: 'templates/wait-to-confirm.html',
            controller: "registerCtrl"              
        })


});