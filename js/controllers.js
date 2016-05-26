angular.module('yiave.controllers', [])

.controller('homeCtrl', function($scope, $state){

	$(".flexslider").flexslider({
		slideshowSpeed: 3000, //展示时间间隔ms
		animationSpeed: 400, //滚动时间ms
		directionNav : true,
		touch: true //是否支持触屏滑动
	});


	
})


