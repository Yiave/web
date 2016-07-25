//validate the phone number
function strIsPhone( strPhone ) {
    var phoneRegWithArea = /^[0][1-9]{2,3}-[0-9]{5,10}$/;
    var phoneRegNoArea = /^[1-9]{1}[0-9]{5,8}$/;
    if( strPhone.length > 9 ) {
        if( phoneRegWithArea.test(strPhone) ){
            return true;
        }else{
            //alert( prompt );
            return false;
        }
    }else{
        if( phoneRegNoArea.test( strPhone ) ){
            return true;
        }else{
            //alert( prompt );
            return false;
        }
    }
}

//validate email address
function strIsEmail(strEmail) {
    //var emailReg = /^[_a-z0-9]+@([_a-z0-9]+\.)+[a-z0-9]{2,3}$/;
    var emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
    if( emailReg.test(strEmail) ){
        return true;
    }else{
        return false;
    }
}

//miliseconds to date
//时间格式：2016/7/17 -> 2016-07-17
function DateValueToString(val){
    var LDStr = new Date(val).toLocaleDateString();//.replaceAll('/', '-');
    var yearStr = LDStr.split('/')[0];
    var monStr = LDStr.split('/')[1];
    var dayStr = LDStr.split('/')[2];
    var str =  yearStr + '-' + (Number(monStr) < 10 ? ('0'+monStr) : monStr) + '-' +
        + (Number(dayStr) < 10 ? ('0'+dayStr) : dayStr);
    return str;
}

//string to date
//2016-07-18 22:00:00
function StringToDate (str) {
    var date = str.split(" ")[0];
    var time = str.split(" ")[1];

    var year =  Number(date.split('-')[0]);
    var month = Number(date.split('-')[1]) - 1;
    var day = Number(date.split('-')[2]);

    var hours = time.split(":")[0];
    var min = time.split(":")[1];
    var sec = time.split(":")[2];

    return new Date(year, month, day, hours, min, sec);
}

angular.module('yiave.controllers', [])



.controller('chatCtrl', function($scope, $state, $ionicPopup, localStorageService, messageService) {

    //$scope.messages = messageService.getAllMessages();
    // console.log($scope.messages);
    /*$scope.onSwipeLeft = function() {
        $state.go("tab.friends");
    };*/
    $scope.$on("$ionicView.beforeEnter", function(){
        // console.log($scope.messages);
        $scope.messages = messageService.getAllMessages();
        $scope.popup = {
            isPopup: false,
            index: 0
        };
    });

    $scope.popupMessageOpthins = function(message) {
        $scope.popup.index = $scope.messages.indexOf(message);
        $scope.popup.optionsPopup = $ionicPopup.show({
            templateUrl: "templates/popup.html",
            scope: $scope,
        });
        $scope.popup.isPopup = true;
    };
    $scope.markMessage = function() {
        var index = $scope.popup.index;
        var message = $scope.messages[index];
        if (message.showHints) {
            message.showHints = false;
            message.noReadMessages = 0;
        } else {
            message.showHints = true;
            message.noReadMessages = 1;
        }
        $scope.popup.optionsPopup.close();
        $scope.popup.isPopup = false;
        messageService.updateMessage(message);
    };
    $scope.deleteMessage = function() {
        var index = $scope.popup.index;
        var message = $scope.messages[index];
        $scope.messages.splice(index, 1);
        $scope.popup.optionsPopup.close();
        $scope.popup.isPopup = false;
        messageService.deleteMessageId(message.id);
        messageService.clearMessage(message);
    };
    $scope.topMessage = function() {
        var index = $scope.popup.index;
        var message = $scope.messages[index];
        if (message.isTop) {
            message.isTop = 0;
        } else {
            message.isTop = new Date().getTime();
        }
        $scope.popup.optionsPopup.close();
        $scope.popup.isPopup = false;
        messageService.updateMessage(message);
    };
    $scope.messageDetils = function(message) {
        $state.go("tab.chatMessage", {
            "messageId": message.id
        });
    };

})

.controller('messageCtrl', ['$scope', '$stateParams',
    'messageService', '$ionicScrollDelegate', '$timeout',
    function($scope, $stateParams, messageService, $ionicScrollDelegate, $timeout) {
        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
        // console.log("enter");
        $scope.doRefresh = function() {
            // console.log("ok");
            $scope.messageNum += 5;
            $timeout(function() {
                $scope.messageDetils = messageService.getAmountMessageById($scope.messageNum,
                    $stateParams.messageId);
                $scope.$broadcast('scroll.refreshComplete');
            }, 200);
        };

        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.message = messageService.getMessageById($stateParams.messageId);
            $scope.message.noReadMessages = 0;
            $scope.message.showHints = false;
            messageService.updateMessage($scope.message);
            $scope.messageNum = 10;
            $scope.messageDetils = messageService.getAmountMessageById($scope.messageNum,
                $stateParams.messageId);
            $timeout(function() {
                viewScroll.scrollBottom();
            }, 0);
        });

        window.addEventListener("native.keyboardshow", function(e){
            viewScroll.scrollBottom();
        });
    }
    ])


.controller('loginCtrl',['$scope', '$http', '$state' ,'$rootScope','$cookies','userService', '$ionicLoading','$timeout','ionicToast',
    function($scope, $http, $state,$rootScope,$cookies,userService,$ionicLoading,$timeout,ionicToast){

        //注释行$setPristine不管用，只能采用暴力解法
        $scope.reset = function(str) {
            //if (ele) {           
                //ele.$setPristine();
                //ele.$setUntouched();
            //}
            if(str == "account"){
                $scope.user.account = null;
            }
            else if (str == "password") {
                $scope.user.password = null;
            }else{

            }
        }

        $scope.userLogin = function (user) {

            var account = user.account;
            var password = hex_md5(user.password);
            var params = new Object();
            
            if (strIsEmail(account)) { //email
                params = {"email": account, "password": password};
            }
            else if (strIsPhone(account)) { //telephone          
                params = {"telephone": account, "password": password};
            }else { //username                   
                params = {"username": account, "password": password};
            }
            //判断浏览器是否联网，但经过验证没有效果
            //console.log(navigator.onLine);

            //通过Cordova Network Information Plugin来判断网络状态

            // if(navigator.connection.type == Connection.NONE){
            //    ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 3000);
            //    return;
            //     
            // }

            //弹出框显示“加载中”，或是登录按钮为disable，显示“登录中”
            $ionicLoading.show();

            $http.post("http://api.yiave.com/v1/customers/authenticate", params = params)
            .then(function (response) {
                $cookies.put("userid", response.data.id);
                $rootScope.hasLogin = true;
                $rootScope.userid = response.data.id;
                userService.init();

                $state.go("tab.me");
            }, function (response) {
                //403 密码错误
                //500 账户错误

                if(response.status == 403){
                    ionicToast.show('密码输入错误', 'top', false, 3000);
                    
                }else if (response.status == 404) {
                    ionicToast.show('账户输入错误', 'top', false, 3000);
                    
                }
                
            })
            .catch(function(response) {
                
            })
            .finally(function(){
                $ionicLoading.hide();
            });
        }
    }
])

.controller('registerCtrl',[ '$scope', '$http', '$state', '$timeout','ionicToast',
    function($scope, $http, $state, $timeout,ionicToast){

    //$scope.pwdNotSame = false;

    $scope.reset = function(str) {
        // if (ele) {
        //   ele.$setPristine();
        //   ele.$setUntouched();

        // }
        if(str == "username"){
            $scope.user.username = null;
        }
        else if (str == "email") {
            $scope.user.email = null;
        }else if (str == "password") {
            $scope.user.password = null;
        }else if (str == "passwordAgain") {
            $scope.user.passwordAgain = null;
        }else{

        }
    }

//     $scope.checkPassword = function (user) {
//     if(user.password == user.passwordAgain){
//         $scope.pwdNotSame = false;
//     }else {
//         $scope.pwdNotSame = true;
//     }
// }
    $scope.pwdNotSame = function() {
        
    };

    $scope.mailRegister = function (user) {
        
        //判断网络状态
            // if(navigator.connection.type == Connection.NONE){
            //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 3000);
            //     return;
            // }


        //检测username是否重复
        $http.get("http://api.yiave.com/v1/customers/"+user.username)
            .then(function (response) {
                //username已存在
                ionicToast.show('用户名已存在', 'top', false, 3000);
                return;
            }, function (response) {
                
            })
            .catch(function(response) {
                
            })
            .finally(function(){
                  
            });


        //检测email是否重复
        $http.get("http://api.yiave.com/v1/customers/"+user.email)
            .then(function (response) {
                //邮箱已存在
                ionicToast.show('邮箱已被注册', 'top', false, 3000);
                return;
            }, function (response) {
                 /* body... */ 
            })
            .catch(function(response) {
                
            })
            .finally(function(){
                  
            });



        //验证密码输入是否一致
        if(user.password != user.passwordAgain){
            //$scope.pwdNotSame = true;
            ionicToast.show('两次密码输入不一致', 'top', false, 3000);           
            return;
        }

        //开始http请求
        $http.post("http://api.yiave.com/v1/customers", params = {
            username: user.username,
            password: hex_md5(user.password),
            email: user.email
        })
        .success(function(data, status, headers, config){
            console.log('success');
                /*
                {
                 “id”: 2,
                  “username”: “test”,
                  “email”: “test@yiave.com”,
                  “is_confirmed”: false,
                  “signup_date”: “2016-05-24 15:21:34”
                }
                注册后系统自动发送验证链接http://www.yiave.com/customers/{id}/confirm/{token}到用户邮箱，
                用户登入邮箱点击链接

                提醒用户验证
                */
                $state.go("waitToConfirm");
                

            })
        .error(function(data, status, headers, config){
            console.log(status);
            if(status == 409){  //邮箱已注册

            }else if (status == 403) {

            }
        }
        );
    }
}])


    
    .controller('homeCtrl', ['$scope','$http', '$state','promotionService','localStorageService','ionicToast',
        function($scope, $http,$state, promotionService, localStorageService, ionicToast){
        
            $(".flexslider").flexslider({
                slideshowSpeed: 2000, //展示时间间隔ms
                animationSpeed: 400, //滚动时间ms
                directionNav : true,
                touch: true //是否支持触屏滑动
            });

            $scope.$on("$ionicView.beforeEnter", function(){
                
                $scope.promotions = promotionService.getAllPromotions();
                //$scope.promotions = getPromotions.promotions;

            });

            $scope.promoDetails = function (promoID) {


                //promotionService.getPromotionById(promoID)  //暂时注释掉
                $state.go("tab.promoDetails",{"promoID": promoID});
               

            }

            //上拉刷新
            $scope.doRefresh = function() {

                //判断网络状态
            // if(navigator.connection.type == Connection.NONE){
            //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 3000);           
            //     return;   
            // }

      

                $http.get('http://api.yiave.com/v1/promotions')
                .then(function (response) {
                    localStorageService.update("promotions", response.data);
                    $scope.promotions = response.data;
                },function (response) {
                    
                })
                .catch(function(response) {
                  console.error('');
                })
                .finally(function(){
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };

            //滚动加载
            $scope.loadMorePromotion = function() {
              //   $http.get('/more-items').success(function(items) {
              //     useItems(items);

              //   $scope.$broadcast('scroll.infiniteScrollComplete');
              // });
            };

            $scope.morePromoCanBeLoaded = function () {
                 /* body... */ 
                return true;
            }



    }])


    .controller('promotionCtrl', ['$scope','$http','$stateParams','promotionService', '$state',
        'ionicDatePicker','ionicTimePicker','ionicToast', '$rootScope', '$ionicLoading','$timeout','$ionicModal',
        function($scope, $http, $stateParams, promotionService,$state,ionicDatePicker,
            ionicTimePicker,ionicToast, $rootScope, $ionicLoading, $timeout, $ionicModal){

 
            $scope.wish = new Object();
            $scope.wish.startDatetime = "";
            $scope.wish.endDatetime = "";
            $scope.wish.clothCount = 1;
            $scope.wish.matchType = 0;

            $scope.promotion = new Object();
            $scope.clothCountOption = new Array();

            $scope.matchTypeOption = [
                {label: "系统匹配", id : 0},
                {label: "加入约买", id : 1},
                {label: "发起约买", id : 2}
            ]


            $scope.$on("$ionicView.beforeEnter", function(event, data){

                event.preventDefault();

                //if(data.stateName == "tab.promoDetails" && data.fromCache == false){
                if(data.fromCache == false){
                    $scope.promotion = promotionService.getPromotionByIdLocal("promotion_"+$stateParams.promoID);
                    $scope.promotion.start_date = new Date($scope.promotion.start_time).toLocaleDateString();
                    $scope.promotion.end_date = new Date($scope.promotion.end_time).toLocaleDateString();
                    $scope.promotion.type = "clothing"; 
                    
                    var closeCount = 4 //$scope.promotion.promotion_count ;暂时注释  
                    
                    for (var i = 1; i < closeCount; i++) {
                        $scope.clothCountOption.push(i);
                    }
                }

        
            });


            $scope.pageToSubmitWish =  function () {
                
                $state.go('tab.submitWish', {"promoID": $scope.promotion.id});
            }

            

            $scope.openStartDP = function () {
                var startDP  = {
                    callback: function (val) {                
                        
                    var startDate = DateValueToString(val);

                    var startTP = {
                        callback: function (val) {  
                            //8h 时差
                            var startTime = new Date((val + 3600*16) * 1000).toTimeString().substr(0, 8);
                            $scope.wish.startDatetime = startDate.concat(" ", startTime);
                        
                        },
                        //有输入时显示当前选择的时刻，初始为当前时刻
                        inputTime: ($scope.wish.startDatetime == "") ? ((new Date()).getHours() * 60 * 60) : (StringToDate($scope.wish.startDatetime).getHours() * 60 * 60)
                    };

                        ionicTimePicker.openTimePicker(startTP);

                    },
                    //可以选择的日期段,暂时注释
                    //from: new Date(),
                    //to: new Date($scope.promotion.end_time),

                    //有输入时显示当前选择的日期，初始为当前日期
                    inputDate: ($scope.wish.startDatetime == "") ? new Date(): StringToDate($scope.wish.startDatetime)
                }

                ionicDatePicker.openDatePicker(startDP);
            }

            $scope.openEndDP = function () {
                var endDP = {
                    callback: function (val) { 
                        
                        var endDate = DateValueToString(val);

                        var endTP = {
                            callback: function (val) { 
                                
                                var endTime = new Date((val + 3600*16) * 1000).toTimeString().substr(0, 8);
                                $scope.wish.endDatetime = endDate.concat(" ", endTime);
                                
                            },

                            inputTime: ($scope.wish.endDatetime == "") ? ((new Date()).getHours() * 60 * 60) : (StringToDate($scope.wish.endDatetime).getHours() * 60 * 60)
                        }
                        ionicTimePicker.openTimePicker(endTP);
                    },
                    //可以选择的日期段,暂时注释
                    //from: new Date(),
                    //to: new Date($scope.promotion.end_time),
                    inputDate: ($scope.wish.endDatetime == "") ? new Date(): StringToDate($scope.wish.endDatetime)
                }

                ionicDatePicker.openDatePicker(endDP);
            }

            $scope.submitWish = function (wish) {
                //判断网络连接状态
                // if(navigator.connection.type == Connection.NONE){
                //      ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 3000);
                //      return;
                //}

                //判断时间

                if(StringToDate(wish.startDatetime) > StringToDate(wish.endDatetime)){

                    //ionic toast
                    ionicToast.show('开始时间晚于结束时间', 'top', false, 3000);
                    return;
                }


                //加载动作显示“正在提交”
                $ionicLoading.show();

                
                // $timeout(function () {
                //     $ionicLoading.hide();
                //     $state.go("tab.sysmatchRecommemd",{"promoID": $scope.promotion.id});
                    
                // }, 3000);

            //暂时注释
                var matchType = ""
                //-----------开始http请求
                if(wish.matchType == 0){
                    matchType = "system_match";
                }else if (wish.matchType == 1) {
                    matchType = "user_create";
                }else if (wish.matchType == 2) {
                    matchType = "user_join";
                }else{

                }
                //首先创建wish
                var params = new Object();
                if(wish.matchType == 1){
                    params = {
                    "customer_id": $rootScope.userid,
                    "wish_count": wish.clothCount,
                    "cobuy_id" : wish.cobuyID
                    };
                }else{
                    params = {
                    "customer_id": $rootScope.userid,
                    "wish_count": wish.clothCount,
                    "wish_time_start": wish.startDatetime,
                    "wish_time_end": wish.endDatetime
                    };
                }

                var api = "http://api.yiave.com/v1/pomotions/"+ $scope.promotion.id +"/"+ $scope.promotion.type +"/wishs/" + matchType;
                
                $.ajax({
                    type: "POST",
                    url: api,
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", "api_key");
                    },
                    success: function (result) {
                        console.log('');
                    }
                })

                $http.head(api, params=params)
                .then(function (response) {
                    /* success*/ 

                    if(wish.matchType == 0){
                        //wish, cobuy 推荐列表
                        $scope.recomList = response.data;
                        $ionicModal.fromTemplateUrl('templates/sysmatch-recommend-modal.html', {
                            scope: $scope,
                            animation: 'slide-in-up'
                        }).then(function(modal) {
                            $scope.recommendModal = modal;
                            modal.show();
                        });
                        

                    }else if (wish.matchType == 1) {    
                        
                        ionicToast.show('创建成功', 'top', false, 3000);  

                        $scope.cobuy = response.data;
                        $scope.cobuyModalTitle="您创建的约买信息为：";
                        //您创建的cobuy: cobuy信息
                        $ionicModal.fromTemplateUrl('templates/usermatch-cobuyinfo-modal.html', {
                            scope: $scope,
                            animation: 'slide-in-up'
                        }).then(function(modal) {
                            $scope.cobuyinfoModal = modal;
                            modal.show();
                        });


                    }else if (wish.matchType == 2) {
                                      
                        ionicToast.show('加入成功', 'top', false, 3000);
                        $scope.cobuy = response.data;
                        //您加入的cobuy: cobuy信息 
                        $scope.cobuyModalTitle="您加入的约买信息为：";
                        //您创建的cobuy: cobuy信息
                        $ionicModal.fromTemplateUrl('templates/usermatch-cobuyinfo-modal.html', {
                            scope: $scope,
                            animation: 'slide-in-up'
                        }).then(function(modal) {
                            $scope.cobuyinfoModal = modal;
                            modal.show();
                        });
                        
                    }else{

                    }
                 }, function (response) {
                     /* failure */ 
                    ionicToast.show('提交失败', 'top', false, 3000);
                    
                 }).catch(function(response) {
                    console.log('');
                    })
                    .finally(function(){
                        $ionicLoading.hide();
                });   
                    
            }
            $scope.stateToHome = function () {
                $scope.cobuyinfoModal.hide();
                $state.go("tab-home");
            }

            $scope.choseMatch = function (type, id) {
                if(type=="wish"){

                }else if (type=="cobuy") {
                    
                }else{

                }
                
                
            }


            
    }])




    .controller('meCtrl',['$scope', '$rootScope','userService', 
        function($scope, $rootScope, userService){
            $scope.$on("$ionicView.beforeEnter", function(){

                if($rootScope.hasLogin == false){
                    $scope.user = {
                        "imagesrc" : 'images/user.png',
                        "nickname": '游客'
                    }
                }else{
                    $scope.user = userService.getUser();
                    if($scope.user.nickname != null){
                        
                    }
                    else if ($scope.user.username != null) {
                        $scope.user.nickname = $scope.user.username;
                    }
                    else{
                        $scope.user.nickname = $scope.user.telephone;

                    }
                }
                    
            });
    
    }])

    .controller('userCtrl', ['$scope','$http','$state', '$rootScope','userService', '$ionicModal','$ionicLoading',
        '$cookies', '$timeout','ionicToast',
     //'$cordovaImagePicker',' $cordovaCamera',
        function($scope, $http, $state, $rootScope, userService, $ionicModal,$ionicLoading,$cookies,$timeout,ionicToast){

            $scope.$on("$ionicView.beforeEnter", function(){
                $scope.user = userService.getUser();
                
            });

            $scope.userLogout = function () {

                console.log('dawd');
                $cookies.remove("userid");
                $rootScope.hasLogin = false;
                $rootScope.userid = -1;
                userService.removeUser();
                
                //$cookies.put("username", data.username);
                
                $state.go("tab.me");
            }

            $ionicModal.fromTemplateUrl('templates/nickname-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.nicknameModal = modal;
            });

            $ionicModal.fromTemplateUrl('templates/password-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.passwordModal = modal;
            });

            $ionicModal.fromTemplateUrl('templates/realname-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.realnameModal = modal;
            });

            $scope.saveUsername = function (username) {
                 /* body... */ 
            }

            $scope.saveNickname = function(nickname){

                if(nickname == $scope.user.nickname){
                    ionicToast.show('新昵称与原昵称相同', 'top', false, 3000);                   
                    return;
                }

                //判断网络连接状态
            // if(navigator.connection.type == Connection.NONE){
            //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 3000);
            //     return;
            // }

                $ionicLoading.show()

                $http.put("http://api.yiave.com/v1/customers/"+$rootScope.userid, 
                    params = {'nickname': nickname})
                .then(function(response){
                    userService.update('nickname',nickname);
                    ionicToast.show('修改成功', 'top', false, 3000);
                    $scope.nicknameModal.hide();   
                    $scope.user.nickname = nickname;
                    
                },function (response) {
                   
               })
                .catch(function(response) {

                })
                .finally(function(){
                    $ionicLoading.hide();
                });

            }

             $scope.savePassword = function (currentPwd,pwd,pwdConfirm) {

                if(pwd != pwdConfirm){
                    //两次密码输入不一致
                    ionicToast.show('两次密码输入不一致', 'top', false, 3000);
                    return;
                }

                if(pwd == currentPwd){
                    //新旧密码相同
                    ionicToast.show('新密码与原密码相同', 'top', false, 3000);
                    return;
                }

                //判断网络连接状态
            // if(navigator.connection.type == Connection.NONE){
            //      ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 3000);
            //      return;
            // }
                $ionicLoading.show();

                $http.put("http://api.yiave.com/v1/customers/"+$rootScope.userid+"/password",params = {
                    'old_password': hex_md5(currentPwd),
                    'password': hex_md5(pwd)
                }).then(function (response) {
                    ionicToast.show('修改成功', 'top', false, 3000);
                    $scope.passwordModal.hide();

                },function (response) {
                    //当前密码错误
                    if(response.status == 500){
                        ionicToast.show('当前密码错误', 'top', false, 3000);
                        
                    }
                               
                })
                .catch(function(response) {

                })
                .finally(function(){
                    $ionicLoading.hide();
                });

            }

            $scope.saveRealname = function (realname) {

                if(realname == $scope.user.realname){
                    ionicToast.show('输入姓名与原姓名相同', 'top', false, 3000);
                    return;
                }

                //判断网络连接状态
            // if(navigator.connection.type == Connection.NONE){
            //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 3000);
            //     return;
            // }

                $ionicLoading.show();

                $http.put("http://api.yiave.com/v1/customers/"+$rootScope.userid, 
                    params = {'realname': realname}
                ).then(
                    function(response){
                        userService.update('realname',realname);
                        ionicToast.show('修改成功', 'top', false, 3000);
                        $scope.realnameModal.hide();    
                        $scope.user.realname = realname;
                    },function (response) {
                       /* body... */ 
                       
                   })
                .catch(function(response) {

                })
                .finally(function(){
                    $ionicLoading.hide();
                });
            }

             $scope.saveSex = function (sex) {
                 /* body... */ 
            }

             $scope.saveBirthday = function (bitthday) {
                 /* body... */ 
            }

            //image picker
            // $scope.pickImage = function () {

            //     //console.log("haha");

            //     var options = {
            //         maximumImagesCount: 1,
            //         width: 800,
            //         height: 800,
            //         quality: 80
            //     };

            //     $cordovaImagePicker.getPictures(options)
            //         .then(function (results) {
            //             console.log(results);
            //             //$scope.imgSrc = results[0];
            //             $scope.images_list.push(results[0]);
            //         }, function (error) {
            //             // error getting photos
            //         });

            // }

            // $scope.openCamera = function () {
            //     var options = {
            //       quality: 50,
            //       destinationType: Camera.DestinationType.DATA_URL,
            //       sourceType: Camera.PictureSourceType.CAMERA,
            //       allowEdit: true,
            //       encodingType: Camera.EncodingType.JPEG,
            //       targetWidth: 100,
            //       targetHeight: 100,
            //       popoverOptions: CameraPopoverOptions,
            //       saveToPhotoAlbum: false
            //     };
             
            //     $cordovaCamera.getPicture(options).then(function(imageData) {
            //       var image = document.getElementById('myImage');
            //       image.src = "data:image/jpeg;base64," + imageData;
            //     }, function(err) {
            //       // error
            //     });
            // }

    }])