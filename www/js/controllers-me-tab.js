//validate the phone number
function strIsPhone(strPhone) {
	var phoneRegWithArea = /^[0][1-9]{2,3}-[0-9]{5,10}$/;
	var phoneRegNoArea = /^[1-9]{1}[0-9]{5,8}$/;
	if (strPhone.length > 9) {
		if (phoneRegWithArea.test(strPhone)) {
			return true;
		} else {
            //alert( prompt );
            return false;
        }
    } else {
    	if (phoneRegNoArea.test(strPhone)) {
    		return true;
    	} else {
            //alert( prompt );
            return false;
        }
    }
}
//validate email address
function strIsEmail(strEmail) {
    //var emailReg = /^[_a-z0-9]+@([_a-z0-9]+\.)+[a-z0-9]{2,3}$/;
    var emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
    if (emailReg.test(strEmail)) {
    	return true;
    } else {
    	return false;
    }
}

angular.module('yiave.controllers-me-tab', [])
.controller('loginCtrl', ['$scope', '$http', '$state', '$rootScope', '$cookies', 'userService', '$ionicLoading', '$timeout', 'ionicToast',
	function($scope, $http, $state, $rootScope, $cookies, userService, $ionicLoading, $timeout, ionicToast) {
    //注释行$setPristine不管用，只能采用暴力解法
    $scope.reset = function(str) {
        //if (ele) {           
        //ele.$setPristine();
        //ele.$setUntouched();
        //}
        if (str == "account") {
        	$scope.user.account = null ;
        } else if (str == "password") {
        	$scope.user.password = null ;
        } else {}
    }
    $scope.userLogin = function(user) {

    	var account = user.account;
    	var password = hex_md5(user.password);
    	var params = new Object();
    	if (strIsEmail(account)) {
            //email
            params = {
            	"email": account,
            	"password": password
            };
        } else if (strIsPhone(account)) {
            //telephone          
            params = {
            	"telephone": account,
            	"password": password
            };
        } else {
            //username                   
            params = {
            	"username": account,
            	"password": password
            };
        }
        //判断浏览器是否联网，但经过验证没有效果
        //console.log(navigator.onLine);
        //通过Cordova Network Information Plugin来判断网络状态
        // if(navigator.connection.type == Connection.NONE){
        //    ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
        //    return;
        //     
        // }
        //弹出框显示“加载中”，或是登录按钮为disable，显示“登录中”
        $ionicLoading.show();
        $http.post("http://api.yiave.com/v1/customers/authenticate", params = params).then(function(response) {
        	$cookies.put("userid", response.data.id);
        	$rootScope.hasLogin = true;
        	$rootScope.userid = response.data.id;

                /*
                    {
                        "avater_url": null, 
                        "email": "xuhuan@live.cn", 
                        "id": 1, 
                        "is_confirmed": false, 
                        "is_locked": false, 
                        "last_signin_date": "2016-06-03 20:07:52", 
                        "nickname": null, 
                        "realname": null, 
                        "signup_date": "2016-05-26 23:51:58", 
                        "telephone": "13808450755", 
                        "username": "xuhuan"
                    }
                    */
                    $http.get("http://api.yiave.com/v1/customers/" + response.data.id)
                    .then(function (response) {       
                    	userService.updateUser(response.data);
                    	$state.go("tab.me");
                    }, function (response){
                    	console.log(response.status);
                    })

                }, function(response) {
            //403 密码错误
            //404 账户错误
            if (response.status == 403) {
            	ionicToast.show('密码输入错误', 'top', false, 2000);
            } else if (response.status == 404) {
            	ionicToast.show('账户输入错误', 'top', false, 2000);
            }
        }).catch(function(response) {}).finally(function() {
        	$ionicLoading.hide();
        });
    }
}
])

.controller('registerCtrl', ['$scope', '$http', '$state', '$timeout', 'ionicToast', function($scope, $http, $state, $timeout, ionicToast) {
    //$scope.pwdNotSame = false;
    $scope.reset = function(str) {
        // if (ele) {
        //   ele.$setPristine();
        //   ele.$setUntouched();
        // }
        if (str == "username") {
        	$scope.user.username = null ;
        } else if (str == "email") {
        	$scope.user.email = null ;
        } else if (str == "password") {
        	$scope.user.password = null ;
        } else if (str == "passwordAgain") {
        	$scope.user.passwordAgain = null ;
        } else {}
    }
    //     $scope.checkPassword = function (user) {
    //     if(user.password == user.passwordAgain){
    //         $scope.pwdNotSame = false;
    //     }else {
    //         $scope.pwdNotSame = true;
    //     }
    // }
    $scope.pwdNotSame = function() {}
    ;
    $scope.mailRegister = function(user) {
        //判断网络状态
        // if(navigator.connection.type == Connection.NONE){
        //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
        //     return;
        // }
        //检测username是否重复
        $http.get("http://api.yiave.com/v1/customers/" + user.username).then(function(response) {
            //username已存在
            ionicToast.show('用户名已存在', 'top', false, 2000);
            return;
        }, function(response) {}).catch(function(response) {}).finally(function() {});
        //检测email是否重复
        $http.get("http://api.yiave.com/v1/customers/" + user.email).then(function(response) {
            //邮箱已存在
            ionicToast.show('邮箱已被注册', 'top', false, 2000);
            return;
        }, function(response) {/* body... */
        }).catch(function(response) {}).finally(function() {});
        //验证密码输入是否一致
        if (user.password != user.passwordAgain) {
            //$scope.pwdNotSame = true;
            ionicToast.show('两次密码输入不一致', 'top', false, 2000);
            return;
        }
        //开始http请求
        $http.post("http://api.yiave.com/v1/customers", params = {
        	username: user.username,
        	password: hex_md5(user.password),
        	email: user.email
        }).success(function(data, status, headers, config) {
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
            }).error(function(data, status, headers, config) {
            	console.log(status);
            if (status == 409) {//邮箱已注册
            } else if (status == 403) {}
        });
        }
    }
    ])

.controller('meCtrl', ['$scope', '$rootScope', 'userService', function($scope, $rootScope, userService) {
	$scope.$on("$ionicView.beforeEnter", function() {
		if ($rootScope.hasLogin == false) {
			$scope.user = {
				"imagesrc": 'images/user.png',
				"nickname": '游客'
			}
		} else {
			$scope.user = userService.getUser();
			if ($scope.user.nickname != null ) {} else if ($scope.user.username != null ) {
				$scope.user.nickname = $scope.user.username;
			} else {
				$scope.user.nickname = $scope.user.telephone;
			}
		}
	});
}
])

.controller('userCtrl', ['$scope', '$http', '$state', '$rootScope', 'userService', '$ionicModal', '$ionicLoading', '$cookies', '$timeout', 'ionicToast', //'$cordovaImagePicker',' $cordovaCamera',
	function($scope, $http, $state, $rootScope, userService, $ionicModal, $ionicLoading, $cookies, $timeout, ionicToast) {
		$scope.$on("$ionicView.beforeEnter", function() {
			$scope.user = userService.getUser();
		});
		$scope.userLogout = function() {
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
    $scope.saveUsername = function(username) {/* body... */
    }
    $scope.saveNickname = function(nickname) {
    	if (nickname == $scope.user.nickname) {
    		ionicToast.show('新昵称与原昵称相同', 'top', false, 2000);
    		return;
    	}
        //判断网络连接状态
        // if(navigator.connection.type == Connection.NONE){
        //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
        //     return;
        // }
        $ionicLoading.show()
        $http.put("http://api.yiave.com/v1/customers/" + $rootScope.userid, params = {
        	'nickname': nickname
        }).then(function(response) {
        	userService.updateUser(response.data);
        	ionicToast.show('修改成功', 'top', false, 2000);
        	$scope.nicknameModal.hide();
        	$scope.user.nickname = nickname;
        }, function(response) {}).catch(function(response) {}).finally(function() {
        	$ionicLoading.hide();
        });
    }
    $scope.savePassword = function(currentPwd, pwd, pwdConfirm) {
    	if (pwd != pwdConfirm) {
            //两次密码输入不一致
            ionicToast.show('两次密码输入不一致', 'top', false, 2000);
            return;
        }
        if (pwd == currentPwd) {
            //新旧密码相同
            ionicToast.show('新密码与原密码相同', 'top', false, 2000);
            return;
        }
        //判断网络连接状态
        // if(navigator.connection.type == Connection.NONE){
        //      ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
        //      return;
        // }
        $ionicLoading.show();
        $http.put("http://api.yiave.com/v1/customers/" + $rootScope.userid + "/password", params = {
        	'old_password': hex_md5(currentPwd),
        	'password': hex_md5(pwd)
        }).then(function(response) {
        	ionicToast.show('修改成功', 'top', false, 2000);
        	$scope.passwordModal.hide();
        }, function(response) {
            //当前密码错误
            if (response.status == 500) {
            	ionicToast.show('当前密码错误', 'top', false, 2000);
            }
        }).catch(function(response) {}).finally(function() {
        	$ionicLoading.hide();
        });
    }
    $scope.saveRealname = function(realname) {
    	if (realname == $scope.user.realname) {
    		ionicToast.show('输入姓名与原姓名相同', 'top', false, 2000);
    		return;
    	}
        //判断网络连接状态
        // if(navigator.connection.type == Connection.NONE){
        //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
        //     return;
        // }
        $ionicLoading.show();
        $http.put("http://api.yiave.com/v1/customers/" + $rootScope.userid, params = {
        	'realname': realname
        }).then(function(response) {
        	userService.updateUser(response.data);
        	ionicToast.show('修改成功', 'top', false, 2000);
        	$scope.realnameModal.hide();
        	$scope.user.realname = realname;
        }, function(response) {/* body... */
        }).catch(function(response) {}).finally(function() {
        	$ionicLoading.hide();
        });
    }
    $scope.saveSex = function(sex) {/* body... */
    }
    $scope.saveBirthday = function(bitthday) {/* body... */
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
}
])