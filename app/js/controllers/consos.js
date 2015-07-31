angular.module('foyer')
    .controller('Consos_Ctrl', function($scope, beers) {
        $scope.beers = beers;
        $scope.beer = {
            image_url: '',
            name: 'Choisis une bière',
            price: ''
        };
        $scope.beerNames = [];

        $scope.searchBeer = function(query) {
            return query ? $scope.beers.filter(createFilterFor(query)) : $scope.beers;
        };

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(state) {
                return angular.lowercase(state.name).indexOf(lowercaseQuery) === 0;
            };
        }

        $scope.selectedItemChange = function(item) {

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
