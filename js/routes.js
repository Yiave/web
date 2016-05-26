angular.module('yiave.routes', [])
.config(function($stateProvider, $urlRouterProvider) {
   

    //默认状态是tab.home
    $urlRouterProvider.otherwise("/tab/home"); 
    
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
                    controller: "homeCtrl"
                }
            }
        })

        .state('tab.chat', {
            url: '/chat',
            views: {
                'tab-chat': {
                    templateUrl: 'templates/tab-chat.html'
                
                }
            }
        })

        .state('tab.me', {
            url: '/me',
            views: {
                'tab-me': {
                    templateUrl: 'templates/tab-me.html'
                    
                }
            } 
        })
        

        .state('tab.promoDetails',{
            url: '/promoDetails',
            views: {
                'tab-home': {
                    templateUrl: 'templates/promo-details.html'
                    
                }
            } 

        })


        .state('tab.chatMessage',{
            url: '/chatMessage',
            views: {
                'tab-chat': {
                    templateUrl: 'templates/chat-message.html'
                    
                }
            } 
        })

        .state('tab.notice', {
            url: '/notice',
            views: {
                'tab-me': {
                    templateUrl: 'templates/notice.html'
                    
                }
            }
            
        })

        .state('tab.noticeList1', {
            url: '/noticeList1',
            views: {
                'tab-me': {
                    templateUrl: 'templates/notice-list1.html'                   
                }
            }    
        })

        .state('tab.noticeList2', {
            url: '/noticeList2',
            views: {
                'tab-me': {
                    templateUrl: 'templates/notice-list2.html'                   
                }
            }   
        })

        .state('tab.noticeList3', {
            url: '/noticeList3',
            views: {
                'tab-me': {
                    templateUrl: 'templates/notice-list3.html'                   
                }
            }   
        })

        .state('tab.noticeDetails', {
            url: '/noticeDetails',
            views: {
                'tab-me': {
                    templateUrl: 'templates/notice-details.html'                   
                }
            }   
        })

        .state('tab.userInfo', {
            url: '/userInfo',
            views: {
                'tab-me': {
                    templateUrl: 'templates/user-info.html'                   
                }
            }   
        })

        .state('tab.userInfoName', {
            url: '/userInfoName',
            views: {
                'tab-me': {
                    templateUrl: 'templates/user-info-name.html'                   
                }
            }   
        })

        .state('tab.userInfoPwd', {
            url: '/userInfoPwd',
            views: {
                'tab-me': {
                    templateUrl: 'templates/user-info-password.html'                   
                }
            }   
        })

        .state('tab.userInfoPhone', {
            url: '/userInfoPhone',
            views: {
                'tab-me': {
                    templateUrl: 'templates/user-info-phone.html'                   
                }
            }   
        })

        .state('tab.userInfoSex', {
            url: '/userInfoSex',
            views: {
                'tab-me': {
                    templateUrl: 'templates/user-info-sex.html'                   
                }
            }   
        })

        .state('tab.userInfoBirth', {
            url: '/userInfoBirth',
            views: {
                'tab-me': {
                    templateUrl: 'templates/user-info-birthday.html'                   
                }
            }   
        })

        .state('tab.userFocus', {
            url: '/userFocus',
            views: {
                'tab-me': {
                    templateUrl: 'templates/user-focus.html'                   
                }
            }   
        })

        .state('tab.userComments', {
            url: '/userComments',
            views: {
                'tab-me': {
                    templateUrl: 'templates/user-comments.html'                   
                }
            }   
        })

        .state('tab.userRecommend', {
            url: '/userRecommend',
            views: {
                'tab-me': {
                    templateUrl: 'templates/user-recommend.html'                   
                }
            }   
        })

        .state('tab.businessInfo', {
            url: '/businessInfo',
            views: {
                'tab-me': {
                    templateUrl: 'templates/business-info.html'                   
                }
            }   
        })

        .state('tab.aboutUs', {
            url: '/aboutUs',
            views: {
                'tab-me': {
                    templateUrl: 'templates/about-us.html'                   
                }
            }   
        })




});