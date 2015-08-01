angular.module('foyer')
    .run(function($rootScope, $state, $location, Permissions) {
        Permissions.load();

        $rootScope.go = function(route) {
            $state.go(route);
        };

        $rootScope.logout = function() {
            Permissions.remove();
            $state.go('login');
        };

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if(toState.data) {
                if (toState.data.title) {
                    $rootScope.pageTitle = toState.data.title;
                }
            }
        });
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
