angular.module('foyer')
    .run(function($rootScope, Permissions, $state) {
        $rootScope.go = function(route) {
            $state.go(route);
        };

        $rootScope.logout = function() {
            Permissions.remove();
            $state.go('login');
        };
    })
    .config(function($stateProvider) {
        $stateProvider
            .state('root', {
                url: '/',
                abstract: true,
                templateUrl: 'views/home.html',
            })
        ;
    })
;
