angular.module('foyer')
    .controller('Beers_Ctrl', function($scope, $http, $mdDialog, Alert, beers) {
        'ngInject';

        $scope.beers = beers;

        $scope.postBeer = function(name, price, alcohol, volume, image) {
            var params = {
                name: name,
                price: price,
                alcohol: alcohol,
                volume: volume,
            };
            if (image) {
                params.image = image.base64;
            }

            $http
                .post(apiPrefix + 'beers', params)
                .then(function(){
                    $http
                        .get(apiPrefix + 'beers')
                        .then(function(response) {
                            $scope.beers = response.data;
                            Alert.toast('Bière correctement ajoutée !');
                        })
                    ;
                })
            ;
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.patch = function(beer, image) {
            $mdDialog.hide(beer, image);
        };

        $scope.patchBeer = function(ev, beer) {
            $scope.beer = beer;
            $mdDialog
                .show({
                    templateUrl: 'views/templates/beer.tmpl.html',
                    parent: angular.element(document.body),
                    scope: $scope,
                    preserveScope: true,
                    targetEvent: ev,
                })
                .then(function(beer) {
                    var params = {
                        name: beer.name,
                        price: beer.price,
                        alcohol: beer.alcohol,
                        volume: beer.volume
                    };
                    if (beer.image) {
                        params.image = beer.image.base64;
                    }

                    $http
                        .patch(apiPrefix + 'beers/' + beer.slug, params)
                        .then(function(){
                            $http
                                .get(apiPrefix + 'beers')
                                .then(function(response) {
                                    $scope.beers = response.data;
                                    Alert.toast('Le changement, c\'est maintenant.');
                                })
                            ;
                        })
                    ;
                }, function() {
                    Alert.toast('Tant pis...');
                })
            ;
        };

        $scope.deleteBeer = function(ev, beer) {
            var confirm = $mdDialog
                .confirm()
                .parent(angular.element(document.body))
                .title('Est-tu sûr(e) ?')
                .content('Toutes les consos associées seront supprimées !')
                .ariaLabel('Supprimer ou ne pas supprimer ?')
                .ok('Ok je veux tout péter !')
                .cancel('Euuuh sort moi d\'ici...')
                .targetEvent(ev);
            $mdDialog
                .show(confirm)
                .then(function() {
                    $http
                        .delete(apiPrefix + 'beers/' + beer.slug)
                        .then(function(){
                            $scope.beers.splice($scope.beers.indexOf(beer), 1);
                            Alert.toast('BAM !');
                        })
                    ;
                }, function() {
                    Alert.toast('Ouf !');
                })
            ;
        };
    })
    .config(function($stateProvider) {
        'ngInject';

        $stateProvider
            .state('root.beers', {
                url: '/bieres',
                templateUrl: 'views/beers.html',
                controller: 'Beers_Ctrl',
                resolve: {
                    beers: function($resource) {
                        'ngInject';

                        return $resource(apiPrefix + 'beers').query().$promise;
                    }
                },
                data: {
                    title: 'Bières'
                }
            })
        ;
    })
;
