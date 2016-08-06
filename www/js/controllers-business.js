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

angular.module('yiave.controllers-business', [])

.controller('businessPromotionsCtrl', ['$scope', '$http','$ionicLoading','$rootScope', '$state',
 function($scope,$http,$ionicLoading,$rootScope,$state){
	
	$scope.$on("$ionicView.beforeEnter", function(event, data) {
		//if (data.fromCache == false) {
			$ionicLoading.show();
			//判断网络连接状态
	        // if(navigator.connection.type == Connection.NONE){
	        //      ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
	        //$ionicLoading.hide();
	        //      return;
	        //}
	        $http.get(apiHeader+"promotions/business/"+$rootScope.userid)
	            .then(function (response) {
	                $scope.promotions = processPromos(response.data);
	            }, function (response) {
	                ionicToast.show('获取数据失败，请稍后重试', 'top', false, 2000);
	            })
	            .catch(function(response) {
	                ionicToast.show('获取数据失败，请稍后重试', 'top', false, 2000);
	            })
	            .finally(function(){
	                  $ionicLoading.hide();
	            });
		//}
	})

	$scope.newPromotion = function () {
		$state.go("tab.businessPromoEdit", {"promo_operation":0});
	}

	$scope.editPromotion = function (promoID) {
		$state.go("tab.businessPromoEdit", {"promo_operation":1, "promoID": promoID});
	}


}])

.controller('businessPromoEditCtrl', ['$scope','$http', '$state', 'ionicDatePicker', 'ionicTimePicker','ionicToast', '$rootScope','$ionicLoading','$stateParams','$timeout',
	function($scope, $http, $state, ionicDatePicker, ionicTimePicker,ionicToast, $rootScope,$ionicLoading,$stateParams,$timeout){
	
	$scope.promoTypeOption = [{
        label: "满件折",
        id: 0
    }, {
        label: "满件赠",
        id: 1
    }, {
        label: "满件减",
        id: 2
    }]

   	$scope.promoCountOption =[2,3,4,5];
	$scope.promo = new Object();

    $scope.$on("$ionicView.beforeEnter", function(event, data) {

        if (data.fromCache == false) {

	    	if($stateParams.promo_operation == 0){
	    		$scope.viewTitle = "发布促销";
	    		$scope.isEdit = false;
	    		
	   			$scope.promo.type = 0;
	   			$scope.promo.promotion_count = 2;


	    	}else{
	    		$scope.viewTitle = "编辑促销信息";
	    		$scope.isEdit = true;
	    		//获取单个poromotion
	    		//$scope.promo = promotionService.getPromotionById("promo_" + $stateParams.promoID);

	    		$ionicLoading.show();

	    		//判断网络状态
		        // if(navigator.connection.type == Connection.NONE){
		        //     ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);           
		        //     return;   
		        // }
		        
		        //http获取promotion详细数据
		        $http.get(apiHeader + "promotions/" + $stateParams.promoID).then(function(response) {
		        	$scope.promo = response.data;
		        }, function(response) {
		        	ionicToast.show('获取数据失败，请稍后重试', 'top', false, 2000);
		        })
		        .catch(function(response) {
		        	ionicToast.show('获取数据失败，请稍后重试', 'top', false, 2000);
		        })
		        .finally(function(){
		        	$ionicLoading.hide();
		        });
			}
		}

    })

   	$scope.openStartDP = function() {
            var startDP = {
                callback: function(val) {
                    var start_date = DateToStr(new Date(val)); 
                    $scope.promo.start_time = start_date + " 00:00:00";
                },
            
	            //可以选择的日期段
	            from: new Date(),
	            to: ($scope.promo.end_time == ""||$scope.promo.end_time == undefined) ? new Date().setFullYear(new Date().getFullYear() + 1) : StringToDate($scope.promo.end_time),
	            //有输入时显示当前选择的日期，初始为当前日期
	            inputDate: ($scope.promo.start_time == ""||$scope.promo.start_time == undefined) ? new Date() : StringToDate($scope.promo.start_time)
        }
        ionicDatePicker.openDatePicker(startDP);
    }

    $scope.openEndDP = function() {
        var endDP = {
            callback: function(val) {
                var end_date = DateToStr(new Date(val));
                $scope.promo.end_time = end_date + " 23:59:59";
            },
            //可以选择的日期段
            from: ($scope.promo.start_time == ""||$scope.promo.start_time == undefined) ? new Date() : StringToDate($scope.promo.start_time),
           	
            inputDate: ($scope.promo.end_time == ""||$scope.promo.end_time == undefined) ? new Date() : StringToDate($scope.promo.end_time)
        }
        ionicDatePicker.openDatePicker(endDP);
    }

    $scope.publishPromo = function (promo) {
    	//判断网络连接状态
        // if(navigator.connection.type == Connection.NONE){
        //      ionicToast.show('网络连接不可用，请稍候重试', 'top', false, 2000);
        //      return;
        //}
  
        //判断时间
        if (StringToDate(promo.start_time) > StringToDate(promo.end_time)) {
            //ionic toast
            ionicToast.show('起始时间晚于结束时间', 'top', false, 2000);
            return;
        }
        //加载动作显示“正在提交”
        $ionicLoading.show();

        

        if($stateParams.promo_operation == 0){
        	promo.publish_date = new Date();
        	promo.start_time = promo.start_time;
        	promo.end_time = promo.end_time;
        	promo.business_id = $rootScope.userid;
        	promo.image = "images/5795866c151ad1377b8b45f0_680x280.jpg";

        	$http.post(apiHeader + "promotions", params = promo)
            .then(function (response) {
                ionicToast.show('发布成功', 'top', false, 2000);
                $timeout(function () {
                	$state.go("tab.business");
            	}, 2000);
                
            }, function (response) {
                ionicToast.show('操作失败，请稍候再试', 'top', false, 2000);
            })
            .catch(function(response) {
                
            })
            .finally(function(){
                  $ionicLoading.hide();
            });
        }else{
        	$http.put(apiHeader+"promotions/"+ promo.id, params = {"description": promo.description})
            .then(function (response) {
                ionicToast.show('修改成功', 'top', false, 2000);
                $timeout(function () {
                	$state.go("tab.business");
            	}, 2000);
            }, function (response) {
                ionicToast.show('操作失败，请稍候再试', 'top', false, 2000);
            })
            .catch(function(response) {
                
            })
            .finally(function(){
                  $ionicLoading.hide();
            });
        }
        	
    }


}])