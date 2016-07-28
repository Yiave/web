//miliseconds to date
//时间格式：2016/7/17 -> 2016-07-17
// function DateValueToString(val) {
// 	var LDStr = new Date(val).toLocaleDateString();
//     //.replaceAll('/', '-');
//     var yearStr = LDStr.split('/')[0];
//     var monStr = LDStr.split('/')[1];
//     var dayStr = LDStr.split('/')[2];

//     var str = yearStr + '-' + (Number(monStr) < 10 ? ('0' + monStr) : monStr) + '-' + +(Number(dayStr) < 10 ? ('0' + dayStr) : dayStr);
//     return str;
// }

function DateToStr (date) {
    var yearStr = date.getFullYear();
    var monStr = date.getMonth() + 1;
    var dayStr = date.getDay();

    var str = yearStr + '-' + (Number(monStr) < 10 ? ('0' + monStr) : monStr) + '-' +(Number(dayStr) < 10 ? ('0' + dayStr) : dayStr);
    return str;
}
//string to date  
//2016-07-18 22:00:00
function StringToDate(str) {
	var date = str.split(" ")[0];
	var time = str.split(" ")[1];
	var year = Number(date.split('-')[0]);
	var month = Number(date.split('-')[1]) - 1;
	var day = Number(date.split('-')[2]);
	var hours = time.split(":")[0];
	var min = time.split(":")[1];
	var sec = time.split(":")[2];
	return new Date(year,month,day,hours,min,sec);
}

angular.module('yiave.controllers-home-tab', [])

.controller('homeCtrl', ['$scope', '$http', '$state', 'promotionService', 'ionicToast', '$ionicHistory',
	function($scope, $http, $state, promotionService, localStorageService, ionicToast, $ionicHistory) {
		$(".flexslider").flexslider({
			slideshowSpeed: 2000,
        //展示时间间隔ms
        animationSpeed: 700,
        //滚动时间ms
        directionNav: true,
        touch: true//是否支持触屏滑动
    });

		$scope.$on("$ionicView.beforeEnter", function() {

            $scope.appLogo = '<img class="title-image" src="images/logo.png" />';

			var promotions = promotionService.getAllPromotions();
			if(promotions == null){
				return;
			}
			for (var i = 0; i < promotions.length; i++) {
				promotions[i].start_time = DateToStr(new Date(promotions[i].start_time));
				promotions[i].end_time = DateToStr(new Date(promotions[i].end_time));

            //promotions[i].publish_date = DateToStr(new Date(promotions[i].publish_date));
            promotions[i].publish_date = DateToStr(new Date(2016, 7, 1));

            var type = promotions[i].type;
            if(type == 0){
            	promotions[i].label = "满件折";
            }else if (type == 1) {
            	promotions[i].label = "满件赠";
            }else if(type == 2){
            	promotions[i].label = "满件减";
            }else{}
            
        }
        $scope.promotions = promotions;
        
    });


		$scope.pageToPromoDetails = function(promoID) {
        //promotionService.getPromotionById(promoID)  //暂时注释掉
        //判断网络状态
        // if(navigator.connection.type == Connection.NONE){
        //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);           
        //     return;   
        // }
        
        //http获取promotion详细数据
        $http.get("http://api.yiave.com/v1/promotions/" + promoID).then(function(response) {
        	promotionService.updatePromoDetails(response.data);
        	$state.go("tab.promoDetails", {
        		"promoID": promoID
        	});
        }, function(response) {})
        .catch(function(response) {

        })
        .finally(function(){

        });
    }

    //上拉刷新
    $scope.doRefresh = function() {
        //判断网络状态
        // if(navigator.connection.type == Connection.NONE){
        //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);           
        //     return;   
        // }
        $http.get('http://api.yiave.com/v1/promotions').then(function(response) {
        	promotionService.updatePromoList(response.data);
            //$scope.promotions = response.data;
            //$state.go("tab.home");
            location.reload();
        }, function(response) {
        	ionicToast.show('获取数据失败', 'top', false, 2000);   
        }).catch(function(response) {
        	
        }).finally(function() {
        	$scope.$broadcast('scroll.refreshComplete');
        });
    }
    
    //滚动加载
    $scope.loadMorePromotion = function() {//   $http.get('/more-items').success(function(items) {
    //     useItems(items);
    //   $scope.$broadcast('scroll.infiniteScrollComplete');
    // });
}
;
$scope.morePromoCanBeLoaded = function() {
	/* body... */
	return true;
}
}
])

.controller('promoDetailsCtrl', ['$scope', '$http', '$stateParams', 'promotionService', '$state',
 function($scope, $http, $stateParams, promotionService, $state){

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        event.preventDefault();

        //if (data.fromCache == false) {
            $scope.promotion = promotionService.getPromotionById("promo_" + $stateParams.promoID);
                
            //设定倒计时
            $scope.intervalID = window.setInterval(function(){ShowCountDown(new Date($scope.promotion.end_time),'countdown');}, 1000);

            $scope.promotion.start_time = DateToStr(new Date($scope.promotion.start_time));
            $scope.promotion.end_time = DateToStr(new Date($scope.promotion.end_time));
        //}

    });

    $scope.$on("$ionicView.beforeLeave", function(event, data) {
        //取消当前倒计时
        window.clearInterval($scope.intervalID);
    });

    $scope.pageToSubmitWish = function() {
            $state.go('tab.submitWish', {
                "promoID": $scope.promotion.id
            });   
    }
}])

.controller('wishSubmitCtrl', ['$scope', '$http', 'promotionService', '$state', 'ionicDatePicker', 'ionicTimePicker','$timeout', 
    'ionicToast', '$rootScope','$ionicLoading', '$ionicModal', '$ionicPopup','$stateParams', 'sysMatchRecomService',
    function($scope, $http, promotionService, $state,ionicDatePicker, ionicTimePicker, $timeout, 
        ionicToast, $rootScope, $ionicLoading, $ionicModal, $ionicPopup, $stateParams, sysMatchRecomService){

    $scope.wish = new Object();
    $scope.wish.startDatetime = "";
    $scope.wish.endDatetime = "";
    $scope.wish.clothCount = 1;
    $scope.wish.matchType = 0;

    $scope.matchTypeOption = [{
        label: "系统匹配",
        id: 0
    }, {
        label: "加入约买",
        id: 1
    }, {
        label: "发起约买",
        id: 2
    }]

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        event.preventDefault();
        //if(data.stateName == "tab.promoDetails" && data.fromCache == false){
        if (data.fromCache == false) {
            $scope.promotion = promotionService.getPromotionById("promo_" + $stateParams.promoID);      

            //暂时均设置为closing，防止api报错
            var type = $scope.promotion.type;
            if(type == 0){
                $scope.promotion.type = "clothing";
            }else if (type == 1) {
                $scope.promotion.type = "clothing";
            }else if(type == 2){
                $scope.promotion.type = "clothing";
            }else{}

            var clothCount = $scope.promotion.promotion_count;
            $scope.clothCountOption = new Array(); 
            for (var i = 1; i < clothCount; i++) {
                $scope.clothCountOption.push(i);
            }
        }

    });

    $scope.openStartDP = function() {
            var startDP = {
                callback: function(val) {
                    var startDate = DateToStr(new Date(val));
                    var startTP = {
                        callback: function(val) {
                        //8h 时差
                        var startTime = new Date((val + 3600 * 16) * 1000).toTimeString().substr(0, 8);
                        $scope.wish.startDatetime = startDate.concat(" ", startTime);
                    },
                    //有输入时显示当前选择的时刻，初始为当前时刻
                    inputTime: ($scope.wish.startDatetime == "") ? ((new Date()).getHours() * 60 * 60) : (StringToDate($scope.wish.startDatetime).getHours() * 60 * 60)
                };
                ionicTimePicker.openTimePicker(startTP);
            },
            //可以选择的日期段,暂时注释
            from: new Date(),
            to: new Date($scope.promotion.end_time),
            //有输入时显示当前选择的日期，初始为当前日期
            inputDate: ($scope.wish.startDatetime == "") ? new Date() : StringToDate($scope.wish.startDatetime)
        }
        ionicDatePicker.openDatePicker(startDP);
    }

    $scope.openEndDP = function() {
        var endDP = {
            callback: function(val) {
                var endDate = DateToStr(new Date(val));
                var endTP = {
                    callback: function(val) {
                        var endTime = new Date((val + 3600 * 16) * 1000).toTimeString().substr(0, 8);
                        $scope.wish.endDatetime = endDate.concat(" ", endTime);
                    },
                    inputTime: ($scope.wish.endDatetime == "") ? ((new Date()).getHours() * 60 * 60) : (StringToDate($scope.wish.endDatetime).getHours() * 60 * 60)
                }
                ionicTimePicker.openTimePicker(endTP);
            },
            //可以选择的日期段,暂时注释
            from: new Date(),
            to: new Date($scope.promotion.end_time),
            inputDate: ($scope.wish.endDatetime == "") ? new Date() : StringToDate($scope.wish.endDatetime)
        }
        ionicDatePicker.openDatePicker(endDP);
    }

    $scope.submitWish = function(wish) {
        //判断网络连接状态
        // if(navigator.connection.type == Connection.NONE){
        //      ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
        //      return;
        //}

        // var recomList = {
        //     "cobuys": [
        //     {
        //         "customer_id": 1, 
        //         "id": 14, 
        //         "is_matched": false, 
        //         "is_open": true, 
        //         "match_type": 0, 
        //         "promotion_id": 1, 
        //         "wish_count": 1, 
        //         "wish_time_end": "2016-07-26 17:00:00", 
        //         "wish_time_start": "2016-07-26 16:00:00"
        //     }, 
        //     {
        //         "customer_id": 1, 
        //         "id": 15, 
        //         "is_matched": false, 
        //         "is_open": true, 
        //         "match_type": 0, 
        //         "promotion_id": 1, 
        //         "wish_count": 1, 
        //         "wish_time_end": "2016-07-26 17:00:00", 
        //         "wish_time_start": "2016-07-26 16:00:00"
        //     }, 
        //     {
        //         "customer_id": 1, 
        //         "id": 17, 
        //         "is_matched": false, 
        //         "is_open": true, 
        //         "match_type": 0, 
        //         "promotion_id": 1, 
        //         "wish_count": 1, 
        //         "wish_time_end": "2016-07-26 17:00:00", 
        //         "wish_time_start": "2016-07-26 16:00:00"
        //     }
        //     ], 
        //     "wishs": [
        //     {
        //         "customer_id": 1, 
        //         "id": 14, 
        //         "is_matched": false, 
        //         "is_open": true, 
        //         "match_type": 0, 
        //         "promotion_id": 1, 
        //         "wish_count": 1, 
        //         "wish_time_end": "2016-07-26 17:00:00", 
        //         "wish_time_start": "2016-07-26 16:00:00"
        //     }, 
        //     {
        //         "customer_id": 1, 
        //         "id": 15, 
        //         "is_matched": false, 
        //         "is_open": true, 
        //         "match_type": 0, 
        //         "promotion_id": 1, 
        //         "wish_count": 1, 
        //         "wish_time_end": "2016-07-26 17:00:00", 
        //         "wish_time_start": "2016-07-26 16:00:00"
        //     }, 
        //     {
        //         "customer_id": 1, 
        //         "id": 17, 
        //         "is_matched": false, 
        //         "is_open": true, 
        //         "match_type": 0, 
        //         "promotion_id": 1, 
        //         "wish_count": 1, 
        //         "wish_time_end": "2016-07-26 17:00:00", 
        //         "wish_time_start": "2016-07-26 16:00:00"
        //     }
        //     ]
        // };
        // sysMatchRecomService.saveRecom(recomList);
        // $state.go("tab.sysMatchRecom",{"promoID":$scope.promotion.id});

        // $scope.cobuy = {
        //          "customer_id": 1, 
        //          "id": 15, 
        //          "is_matched": false, 
        //          "is_open": true, 
        //          "match_type": 0, 
        //          "promotion_id": 1, 
        //          "wish_count": 1, 
        //          "wish_time_end": "2016-07-26 17:00:00", 
        //          "wish_time_start": "2016-07-26 16:00:00"
        //      };
        // $scope.cobuyModalTitle = "您创建的约买信息为：";

        // //您创建的cobuy: cobuy信息
        // $ionicModal.fromTemplateUrl('templates/usermatch-cobuyinfo-modal.html', {
        //     scope: $scope,
        //     animation: 'slide-in-up'
        // }).then(function(modal) {
        //     $scope.cobuyinfoModal = modal;
        //     modal.show();
        // });

        
        //判断登录状态
        if($rootScope.hasLogin == false){
            ionicToast.show('您还未登录，请先登录', 'middle', false, 2000);
            $timeout(function () {
                $state.go("tab.me");
            }, 1000);
            return;
            
            // var confirmPopup = $ionicPopup.confirm({
            //     title: '提示',
            //     template: '您还未登录，请先登录'
            // });

            // confirmPopup.then(function(res) {
            //     if(res) {
            //         $state.go("tab.me");
            //     } else {}
            // });

            
        }

        //判断时间
        if (StringToDate(wish.startDatetime) > StringToDate(wish.endDatetime)) {
            //ionic toast
            ionicToast.show('开始时间晚于结束时间', 'top', false, 2000);
            return;
        }
        //加载动作显示“正在提交”
        $ionicLoading.show();
        // $timeout(function () {
        //     $ionicLoading.hide();
        //     $state.go("tab.sysmatchRecommemd",{"promoID": $scope.promotion.id});
        // }, 2000);
        //暂时注释
        var matchType = ""
        //-----------开始http请求
        if (wish.matchType == 0) {
            matchType = "system_match";
        } else if (wish.matchType == 2) {
            matchType = "user_create";
        } else if (wish.matchType == 1) {
            matchType = "user_join";
        } else {}
        //首先创建wish
        var params = new Object();
        if (wish.matchType == 1) {
            params = {
                "customer_id": $rootScope.userid,
                "wish_count": wish.clothCount,
                "cobuy_id": wish.cobuyID
            };
        } else {
            params = {
                "customer_id": $rootScope.userid,
                "wish_count": wish.clothCount,
                "wish_time_start": wish.startDatetime,
                "wish_time_end": wish.endDatetime
            };
        }
        var api = "http://api.yiave.com/v1/promotions/" + $scope.promotion.id + "/" + $scope.promotion.type + "/wishs/" + matchType;
        $http.post(api, params = params).then(function(response) {
            
            if (wish.matchType == 0) {
                //wish, cobuy 推荐列表
                
                sysMatchRecomService.saveRecom(response.data);
                $state.go("tab.sysMatchRecom",{"promoID":$scope.promotion.id});

            } else if (wish.matchType == 2) {
                /*cobuy数据
                    {
                      "customer_id": 1, 
                      "end_time": "2016-07-31 20:00:00", 
                      "id": 1, 
                      "is_match_completed": false, 
                      "match_type": 1, 
                      "max_time": "2016-07-29 17:00:00", 
                      "min_time": "2016-07-29 15:00:00", 
                      "promotion_count": 3, 
                      "promotion_id": 1, 
                      "wish_id": 19
                    }
                */
                ionicToast.show('创建成功', 'top', false, 2000);
                $scope.cobuy = response.data;
                $scope.cobuyModalTitle = "您创建的约买信息为：";
                //您创建的cobuy: cobuy信息
                $ionicModal.fromTemplateUrl('templates/usermatch-cobuyinfo-modal.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $scope.cobuyinfoModal = modal;
                    modal.show();
                });

            } else if (wish.matchType == 1) {
                ionicToast.show('加入成功', 'top', false, 2000);
                $scope.cobuy = response.data;
                //您加入的cobuy: cobuy信息 
                $scope.cobuyModalTitle = "您加入的约买信息为：";
                //您创建的cobuy: cobuy信息
                $ionicModal.fromTemplateUrl('templates/usermatch-cobuyinfo-modal.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $scope.cobuyinfoModal = modal;
                    modal.show();
                });
            } else {}
        }, function(response) {
            
            ionicToast.show('提交失败', 'top', false, 2000);
        }).catch(function(response) {
            
        }).finally(function() {
            $ionicLoading.hide();
        });
        
        
    }

    $scope.pageToHome = function() {
        $scope.cobuyinfoModal.hide();
        $state.go("tab.home");
    }

    

}])

.controller('wishRecomCtrl', ['$scope','sysMatchRecomService','$state', 
    function($scope, sysMatchRecomService,$state){

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        event.preventDefault();
        $scope.recomList = sysMatchRecomService.getRecom().wishs;
        
    })
    $scope.choseMatch = function(id) {
        
    }

}])

.controller('cobuyRecomCtrl', ['$scope','sysMatchRecomService', function($scope, sysMatchRecomService){
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        event.preventDefault();  
        $scope.recomList = sysMatchRecomService.getRecom().cobuys;
        
    })
    $scope.choseMatch = function(id) {
        
    }
}])
