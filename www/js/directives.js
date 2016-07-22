angular.module('yiave.directives', [])
    .directive('rjHoldActive', ['$ionicGesture', '$timeout', '$ionicBackdrop',
        function($ionicGesture, $timeout, $ionicBackdrop) {
            return {
                scope: false,
                restrict: 'A',
                replace: false,
                link: function(scope, iElm, iAttrs, controller) {
                    $ionicGesture.on("hold", function() {
                        iElm.addClass('active');
                        $timeout(function() {
                            iElm.removeClass('active');
                        }, 300);
                    }, iElm);
                }
            };
        }
    ])
    .directive('rjCloseBackDrop', [function() {
        return {
            scope: false,
            restrict: 'A',
            replace: false,
            link: function(scope, iElm, iAttrs, controller) {
                var htmlEl = angular.element(document.querySelector('html'));
                htmlEl.on("click", function(event) {
                    if (event.target.nodeName === "HTML" &&
                        scope.popup.optionsPopup &&
                        scope.popup.isPopup) {
                        scope.popup.optionsPopup.close();
                        scope.popup.isPopup = false;
                    }
                });
            }
        };
    }])

//     .directive('hideTabs', function($rootScope) {
//     return {
//         restrict: 'A',
//         link: function(scope, element, attributes) {
            
//             scope.$on('$ionicView.beforeEnter', function() {
//                 //$rootScope.hideTabs = true;
//                 scope.$watch(attributes.hideTabs, function(value){
//                     $rootScope.hideTabs = value;
//                 });
//             });

//             scope.$on('$ionicView.beforeLeave', function() {
//                 $rootScope.hideTabs = false;
//             });
//         }
//     };
// });


	
//表单验证指令，验证是否唯一
// .directive('ensureUnique', ['$http', '$timeout', function($http, $timeout) {
//   var checking = null;
//   return {
//     require: 'ngModel',
//     link: function(scope, ele, attrs, c) {
//       scope.$watch(attrs.ngModel, function(newVal) {
//         if (!checking) {
//           checking = $timeout(function() {
//             $http({
//               method: 'POST',
//               url: '/api/check/' + attrs.ensureUnique,
//               data: {'field': attrs.ensureUnique}
//             }).success(function(data, status, headers, cfg) {
//               c.$setValidity('unique', data.isUnique);
//               checking = null;
//             }).error(function(data, status, headers, cfg) {
//               checking = null;
//             });
//           }, 500);
//         }
//       });
//     }
//   }
// }]);
