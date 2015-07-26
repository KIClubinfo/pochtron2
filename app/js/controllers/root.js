angular.module('foyer')
    .run(function($rootScope) {

    })
    .config(function($stateProvider) {
        $stateProvider
            .state('root', {
                url: '',
                abstract: true,
                templateUrl: 'views/home.html',
            })
        ;
    })
;
