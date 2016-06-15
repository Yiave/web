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

angular.module('yiave.controllers', [])



.controller('messageCtrl', function($scope, $state, $ionicPopup, localStorageService, messageService) {

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
        $state.go("chatMessage", {
            "messageId": message.id
        });
    };

})

.controller('messageDetailCtrl', ['$scope', '$stateParams',
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

.controller('loginCtrl',['$scope', '$http', '$state' ,'$rootScope','$cookies','userService', '$ionicPopup','$timeout',
    function($scope, $http, $state,$rootScope,$cookies,userService,$ionicPopup,$timeout){

        $scope.reset = function(ele) {
            if (ele) {
                $scope.loginForm.$setPristine();
                $scope.loginForm.$setUntouched();
                //console.log(ele);
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
            //     var alertPopup = $ionicPopup.alert({
                        
            //         title: '提示',
            //         template: '数据获取失败，请检查网络状态',
            //         okType: 'button-positive',
            //         okText: '知道了'
            //     });
            //     alertPopup.then(function(res) {
                    
            //     });
            //     $timeout(function () {
            //         alertPopup.close();
            //     } ,2000);
            // }

            //弹出框显示“加载中”，或是登录按钮为disable，显示“登录中”
            var loadingPopup = $ionicPopup.alert({

                title: '',
                template: '加载中',
                okType: 'button-positive',
                okText: ' '
            });
            // loadingPopup.then(function(res) {
                
            // });
            // $timeout(function () {
            //     loadingPopup.close();
            // } ,2000);

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
                    var alertPopup = $ionicPopup.alert({
                        
                        title: '提示',
                        template: '密码输入错误，请重新输入',
                        okType: 'button-positive',
                        okText: '知道了'
                    });
                    alertPopup.then(function(res) {
                        
                    });
                    $timeout(function () {
                        alertPopup.close();
                    } ,2000);
                }else if (response.status == 404) {
                    var alertPopup = $ionicPopup.alert({
                        
                        title: '提示',
                        template: '账户输入错误，请重新输入',
                        okType: 'button-positive',
                        okText: '知道了'
                    });
                    alertPopup.then(function(res) {
                        
                    });
                    $timeout(function () {
                        alertPopup.close();
                    } ,2000);
                }
                
            })
            .catch(function(response) {
                
            })
            .finally(function(){
                loadingPopup.close();
            });
        }
    }
])

.controller('registerCtrl', function($scope, $http, $state, $ionicPopup, $timeout){

    //$scope.pwdNotSame = false;

    $scope.reset = function(ele) {
        if (ele) {
          ele.$setPristine();
          ele.$setUntouched();

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
        //网络状态检测


        //检测username是否重复
        $http.get("http://api.yiave.com/v1/customers/"+user.username)
            .then(function (response) {
                //username已存在
                var alertPopup = $ionicPopup.alert({

                    title: '提示',
                    template: '用户名已存在，请重新输入',
                    okType: 'button-positive',
                    okText: '知道了'
                });
                alertPopup.then(function(res) {

                });

                $timeout(function () {
                    alertPopup.close();
                } ,2000)
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
                var alertPopup = $ionicPopup.alert({

                    title: '提示',
                    template: '邮箱已被注册，请重新输入',
                    okType: 'button-positive',
                    okText: '知道了'
                });
                alertPopup.then(function(res) {

                });

                $timeout(function () {
                    alertPopup.close();
                } ,2000)
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
            var alertPopup = $ionicPopup.alert({
            
                title: '提示',
                template: '两次密码输入不一致',
                okType: 'button-positive',
                okText: '知道了'
            });
            alertPopup.then(function(res) {
                
            });

            $timeout(function () {
                alertPopup.close();
            } ,2000)
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
})


    
    .controller('promotionCtrl', ['$scope','$http', '$state','promotionService','localStorageService',
        function($scope, $http,$state, promotionService, localStorageService,getPromotions){
        
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


                //promotionService.getPromotionById(promoID)  暂时注释掉
                $state.go("promoDetails",{"promoID": promoID});
               

            }

            //上拉刷新
            $scope.doRefresh = function() {
      

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

    .controller('promotionDetailCtrl', ['$scope','$http','$stateParams','promotionService', 
        function($scope, $http, $stateParams, promotionService){

            $scope.$on("$ionicView.beforeEnter", function(){
                
                $scope.promotion = promotionService.getPromotionByIdLocal("promotion_"+$stateParams.promoID);
                //$scope.promotions = getPromotions.promotions;
                console.log('');

            });

    }])

    .controller('meCtrl',['$scope', '$rootScope','userService', function($scope, $rootScope, userService){
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

    .controller('userCtrl', ['$scope','$http','$state', '$rootScope','userService', '$ionicModal','$ionicPopup',
        '$cookies', '$timeout',
     //'$cordovaImagePicker',' $cordovaCamera',
        function($scope, $http, $state, $rootScope, userService, $ionicModal,$ionicPopup,$cookies,$timeout){

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
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '新昵称不能与原昵称相同',
                        okType: 'button-positive',
                        okText: '知道了'
                    });
                    alertPopup.then(function(res) {

                    });

                    $timeout(function () {
                        alertPopup.close();
                    } ,2000)
                    return;
                }

                //判断网络连接状态

                var loadingPopup = $ionicPopup.alert({

                    title: '提交中',
                    //template: '提交中',
                    okType: 'button-positive',
                    okText: ' '
                });

                $http.put("http://api.yiave.com/v1/customers/"+$rootScope.userid, {
                    params: {'nickname': nickname}})
                .then(function(response){
                    userService.update('nickname',nickname);

                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '修改成功',
                        okType: 'button-positive',
                        okText: '知道了'
                    });
                    alertPopup.then(function(res) {

                    });

                    $timeout(function () {
                        alertPopup.close();
                        //$state.go('userInfo');
                        $scope.nicknameModal.hide();

                    } ,2000)     
                    $scope.user.nickname = nickname;
                    
                },function (response) {
                   
               })
                .catch(function(response) {

                })
                .finally(function(){
                    loadingPopup.close();
                });

            }

             $scope.savePassword = function (currentPwd,pwd,pwdConfirm) {

                if(pwd != pwdConfirm){
                    //两次密码输入不一致
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '两次密码输入不一致',
                        okType: 'button-positive',
                        okText: '知道了'
                    });
                    alertPopup.then(function(res) {

                    });

                    $timeout(function () {
                        alertPopup.close();
                        
                    } ,2000)
                    return;
                }

                if(pwd == currentPwd){
                    //两次密码输入不一致
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '新密码不能与原密码相同',
                        okType: 'button-positive',
                        okText: '知道了'
                    });
                    alertPopup.then(function(res) {

                    });

                    $timeout(function () {
                        alertPopup.close();
                        
                    } ,2000)
                    return;
                }

                //判断网络连接状态


                var loadingPopup = $ionicPopup.alert({

                    title: '提交中',
                    //template: '提交中',
                    okType: 'button-positive',
                    okText: ' '
                });
                $http.put("http://api.yiave.com/v1/customers/"+$rootScope.userid+"/password",{params:{
                    'old_password': hex_md5(currentPwd),
                    'password': hex_md5(pwd)
                }}).then(function (response) {
                    //修改成功
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '密码修改成功',
                        okType: 'button-positive',
                        okText: '知道了'
                    });
                    alertPopup.then(function(res) {

                    });

                    $timeout(function () {
                        alertPopup.close();
                        $scope.passwordModal.hide();
                    } ,2000)
                    

                    //$state.go("userInfo");
                },function (response) {

                    //当前密码错误
                    if(response.status == 500){
                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: '当前密码错误',
                            okType: 'button-positive',
                            okText: '知道了'
                        });
                        alertPopup.then(function(res) {

                        });

                        $timeout(function () {
                            alertPopup.close();
                        } ,2000)
                    }
                               
                })
                .catch(function(response) {

                })
                .finally(function(){
                    loadingPopup.close();
                });

            }

            $scope.saveRealname = function (realname) {

                if(realname == $scope.user.realname){
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '输入姓名不能与原姓名相同',
                        okType: 'button-positive',
                        okText: '知道了'
                    });
                    alertPopup.then(function(res) {

                    });

                    $timeout(function () {
                        alertPopup.close();
                    } ,2000)
                    return;
                }

                //判断网络连接状态

                var loadingPopup = $ionicPopup.alert({

                    title: '提交中',
                    //template: '提交中',
                    okType: 'button-positive',
                    okText: ' '
                });

                $http.put("http://api.yiave.com/v1/customers/"+$rootScope.userid, {
                    params: {'realname': realname}
                }).then(
                    function(response){
                        userService.update('realname',realname);

                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: '修改成功',
                            okType: 'button-positive',
                            okText: '知道了'
                        });
                        alertPopup.then(function(res) {

                        });

                        $timeout(function () {
                            alertPopup.close();
                        //$state.go('userInfo');
                        $scope.realnameModal.hide();

                    } ,2000)     
                        $scope.user.realname = realname;
                    },function (response) {
                       /* body... */ 
                       
                   })
                .catch(function(response) {

                })
                .finally(function(){
                    loadingPopup.close();
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