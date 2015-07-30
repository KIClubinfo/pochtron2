angular.module('foyer')
    .controller('Consos_Ctrl', function($scope, beers) {
        $scope.beers = beers;
        $scope.selectedItemChange = function(item) {
            alert(item.name);
        };
        $scope.searchBeer = function(item) {
            $http
                .post(apiPrefix + 'search', {search: '/' + string})
                .success(function(data){
                    $scope.beers = data;
                })
            ;
        };
    })
    .config(function($stateProvider) {
        $stateProvider
            .state('root.consos', {
                url: 'consos',
                templateUrl: 'views/consos.html',
                controller: 'Consos_Ctrl',
                resolve: {
                    beers: function($resource) {
                        return $resource(apiPrefix + 'beers').query().$promise;
                    }
                },
            })
        ;
    })
;
