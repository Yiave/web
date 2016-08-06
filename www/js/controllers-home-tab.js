function DateToStr (date) {
    var yearStr = date.getFullYear();
    var monStr = date.getMonth() + 1;
    var dayStr = date.getDate();

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

//处理promotions
function processPromos (promotions) {
    for (var i = 0; i < promotions.length; i++) {
        promotions[i].start_time = DateToStr(new Date(promotions[i].start_time));
        promotions[i].end_time = DateToStr(new Date(promotions[i].end_time));

        promotions[i].publish_date = DateToStr(new Date(promotions[i].publish_date));
        

        var type = promotions[i].type;
        if(type == 0){
            promotions[i].label = "满件折";
        }else if (type == 1) {
            promotions[i].label = "满件赠";
        }else if(type == 2){
            promotions[i].label = "满件减";
        }else{}
    }
    return promotions;

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

            $scope.doRefresh();

            var promotions = promotionService.getAllPromotions();
            if(promotions == null){
                return;
            }

            $scope.promotions = processPromos(promotions);
        
    });


	$scope.pageToPromoDetails = function(promoID) {
        //promotionService.getPromotionById(promoID)  //暂时注释掉
        //判断网络状态
        // if(navigator.connection.type == Connection.NONE){
        //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);           
        //     return;   
        // }
        
        //http获取promotion详细数据
        $http.get(apiHeader + "promotions/" + promoID).then(function(response) {
        	promotionService.updatePromoDetails(response.data);
        	$state.go("tab.promoDetails", {"promoID": promoID});
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
        $http.get( apiHeader + 'promotions').then(function(response) {
        	promotionService.updatePromoList(response.data);
            $scope.promotions = processPromos(response.data);
            $state.go("tab.home");
            //location.reload();
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
    'ionicToast', '$rootScope','$ionicLoading', '$ionicModal', '$ionicPopup','$stateParams', 'wishService','cobuyService',
    function($scope, $http, promotionService, $state,ionicDatePicker, ionicTimePicker, $timeout, 
        ionicToast, $rootScope, $ionicLoading, $ionicModal, $ionicPopup, $stateParams, wishService,cobuyService){

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
            //to: new Date($scope.promotion.end_time),
            to: ($scope.wish.endDatetime == ""||$scope.wish.endDatetime == undefined) ? new Date($scope.promotion.end_time): StringToDate($scope.wish.endDatetime),
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
            from: ($scope.wish.startDatetime == ""||$scope.wish.startDatetime == undefined) ? new Date() : StringToDate($scope.wish.startDatetime),
            to: new Date($scope.promotion.end_time),

            inputDate: ($scope.wish.endDatetime == "") ? (($scope.wish.startDatetime == ""||$scope.wish.startDatetime == undefined )? new Date() :StringToDate($scope.wish.startDatetime)) : StringToDate($scope.wish.endDatetime)
        }
        ionicDatePicker.openDatePicker(endDP);
    }

    $scope.submitWish = function(wish) {
    
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
        var api = apiHeader + "promotions/" + $scope.promotion.id + "/" + $scope.promotion.type + "/wishs/" + matchType;
        $http.post(api, params = params).then(function(response) {
            
            if (wish.matchType == 0) {
                //wish, cobuy 推荐列表
                
                wishService.saveRecom(response.data.wishs);
                wishService.saveMyWish(response.data.w);
                cobuyService.saveRecom(response.data.cobuys);

                $state.go("tab.sysMatchRecom",{"promoID":$scope.promotion.id, "wishID":response.data.w.id});

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
                cobuyService.saveMyCobuy(response.data);

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
                cobuyService.saveMyCobuy(response.data);

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

.controller('wishRecomCtrl', ['$scope','wishService','$state', '$stateParams', '$ionicLoading','ionicToast','$timeout','$http','$ionicModal',
    function($scope, wishService,$state, $stateParams,$ionicLoading,ionicToast,$timeout,$http,$ionicModal){

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        event.preventDefault();
        $scope.recomList = wishService.getRecom();
        
    })
    $scope.choseMatch = function(id) {
        //判断网络连接状态
        // if(navigator.connection.type == Connection.NONE){
        //      ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
        //      return;
        //}
        var recomWishs = $scope.recomList;
        var chosedWish = new Object();
        for (var i = 0; i < recomWishs.length; i++) {
            if(recomWishs[i].id === id){
                chosedWish = recomWishs[i];
                break;
            }
        }
        $ionicLoading.show();
        $http.post(apiHeader+"promotions/"+$stateParams.promoID+"/clothing/cobuys/system_match/recom_wish", params = {
            wish1: chosedWish,
            wish2: wishService.getMyWish(),
        })
            .then(function (response) {
                ionicToast.show('参与成功', 'top', false, 2000);

                // $scope.cobuy = response.data;
                // $scope.cobuyModalTitle = "您加入的约买信息为：";
                // $ionicModal.fromTemplateUrl('templates/usermatch-cobuyinfo-modal.html', {
                //     scope: $scope,
                //     animation: 'slide-in-up'
                // }).then(function(modal) {
                //     $scope.cobuyinfoModal = modal;
                //     modal.show();
                // });


                $timeout(function () {
                    //跳转到约买信息页面
                    $state.go("tab.myCobuys");
                }, 2000);

            }, function (response) {
                ionicToast.show('操作失败，请稍候重试', 'top', false, 2000);
            })
            .catch(function(response) {
                ionicToast.show('操作失败，请稍候重试', 'top', false, 2000);
            })
            .finally(function(){
                  $ionicLoading.hide();
            });

    }

}])

.controller('cobuyRecomCtrl', ['$scope','wishService','cobuyService','$ionicLoading','ionicToast','$timeout','$state','$http','$stateParams',
 function($scope, wishService,cobuyService,$ionicLoading,ionicToast,$timeout,$state,$http,$stateParams){

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        event.preventDefault();  
        $scope.recomList = cobuyService.getRecom();
        
    })
    $scope.choseMatch = function(id) {
        //判断网络连接状态
        // if(navigator.connection.type == Connection.NONE){
        //      ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
        //      return;
        //}
        var recomCobuys = $scope.recomList;
        var chosedCobuy = new Object();
        for (var i = 0; i < recomCobuys.length; i++) {
            if(recomCobuys[i].id === id){
                chosedCobuy = recomCobuys[i];
                break;
            }
        }
        var myWish = wishService.getMyWish();
        $ionicLoading.show();
        $http.post(apiHeader+"/promotions/"+$stateParams.promoID+"/clothing/cobuys/system_match/recom_cobuy", params = {
            "cobuy_id": chosedCobuy.id,
            "min_time": chosedCobuy.min_time,
            "max_time": chosedCobuy.max_time,
            "wish_id": myWish.id,
            "customer_id": myWish.customer_id,
            "match_type": myWish.match_type

        })
            .then(function (response) {
                ionicToast.show('参与成功', 'top', false, 2000);

                // $scope.cobuy = response.data;
                // $scope.cobuyModalTitle = "您加入的约买信息为：";
                // //您创建的cobuy: cobuy信息
                // $ionicModal.fromTemplateUrl('templates/usermatch-cobuyinfo-modal.html', {
                //     scope: $scope,
                //     animation: 'slide-in-up'
                // }).then(function(modal) {
                //     $scope.cobuyinfoModal = modal;
                //     modal.show();
                // });


                $timeout(function () {
                    //跳转到约买信息页面
                    $state.go("tab.myCobuys");
                }, 2000);
            }, function (response) {
                ionicToast.show('操作失败，请稍候重试', 'top', false, 2000);
            })
            .catch(function(response) {
                ionicToast.show('操作失败，请稍候重试', 'top', false, 2000);
            })
            .finally(function(){
                  $ionicLoading.hide();
            });

    }
}])

.controller('mapCtrl', ['$scope', function($scope){
    
     $scope.$on("$ionicView.enter", function(event, data) {
        event.preventDefault();
        
        var shopPosi = [112.98552275,28.18591734];
        var shopAddr = "黄兴南路步行商业街1F优衣库";

        var map = new AMap.Map('container',{
            resizeEnable: true,
            zoom: 15,
            center: shopPosi
        });
        var infowindow;
        var marker = new AMap.Marker({
            position: shopPosi,
            map:map
        });
        marker.on('click',function(e){
          infowindow.open(map,e.target.getPosition());
        })

        AMap.plugin('AMap.AdvancedInfoWindow',function(){
            infowindow = new AMap.AdvancedInfoWindow({
            content: '<h3 class="info-title">门店地址</h1>'+
            '<div class="info-content">'+shopAddr+'</div>',
            offset: new AMap.Pixel(0, -30),
            asOrigin:false
        });
          infowindow.open(map,new AMap.LngLat(shopPosi[0], shopPosi[1]));
        });

        // AMap.plugin(['AMap.ToolBar','AMap.Scale'],function(){
        //     var toolBar = new AMap.ToolBar();
        //     var scale = new AMap.Scale();
        //     map.addControl(toolBar);
        //     map.addControl(scale);
        // })

    })
}])

