angular.module('yiave', ['ionic', 'yiave.controllers', 'yiave.routes', 'yiave.directives'])


.config(['$ionicConfigProvider', function($ionicConfigProvider) {

    $ionicConfigProvider.tabs.position('bottom'); // other values: top

}])
