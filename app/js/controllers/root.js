angular.module('foyer')
    .run(function($rootScope, Permissions, $state) {
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
