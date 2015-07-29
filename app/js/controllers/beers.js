angular.module('foyer')
    .controller('Beers_Ctrl', function($scope, $http, $mdToast, beers) {
        $scope.beers = beers;

        $scope.postBeer = function(name, price, alcohol, volume, image) {
            var params = {
                name: name,
                price: price,
                alcohol: alcohol,
                volume: volume,
                image: image.base64
            };

            $http
                .post(apiPrefix + 'beers', params)
                .success(function(){
                    $http
                        .get(apiPrefix + 'beers')
                        .success(function(data){
                            $scope.beers = data;

                            $mdToast.show(
                              $mdToast.simple()
                                .content('Bière correctement ajoutée !')
                                .position('bottom right')
                                .hideDelay(3000)
                            );
                        })
                    ;
                })
            ;
        };
    })
    .config(function($stateProvider) {
        $stateProvider
            .state('root.beers', {
                url: 'bieres',
                templateUrl: 'views/beers.html',
                controller: 'Beers_Ctrl',
                resolve: {
                    beers: function($resource) {
                        return $resource(apiPrefix + 'beers').query().$promise;
                    }
                },
            })
        ;
    })
;
