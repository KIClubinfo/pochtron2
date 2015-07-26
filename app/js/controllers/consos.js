angular.module('foyer')
    .controller('Consos_Ctrl', function($scope) {

    })
    .config(function($stateProvider) {
        $stateProvider
            .state('root.consos', {
                url: 'consos',
                templateUrl: 'views/consos.html',
                controller: 'Consos_Ctrl'
            })
        ;
    })
;
