angular.module('foyer')
    .controller('Beers_Ctrl', function($scope, $http, $mdDialog, Alert, beers, deliveries) {
        'ngInject';

        $scope.beers = beers;
        $scope.deliveries = deliveries;

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
                            Alert.toast('Le changement, c\'est maintenant.');
                        })
                    ;
                    reloadDeliveries();
                    reloadBeers();
                }, function() {
                    Alert.toast('Tant pis...');
                })
            ;
        };

        
        /**
         * Change le statut d'une bière
         */
        $scope.patchBeerActive = function(beer) {
            if ($scope.isLoading) {
                return;
            }
            $scope.isLoading = true;
            $http
                .patch(apiPrefix + 'beers/' + beer.slug + '/active')
                .then(function(){
                    Alert.toast('Bière mise à jour')
                    $scope.isLoading = false;
                    reloadBeers();
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

        /**
         * Recherche d'une bière
         */
        $scope.searchBeer = function(query) {
            return query ? $scope.beers.filter(createFilterFor(query)) : $scope.beers;
        };

        function createFilterFor(query) {
            var lowercaseQuery = query.toLowerCase();
            return function filterFn(state) {
                return state.name.toLowerCase().indexOf(lowercaseQuery) === 0;
            };
        };

        /**
         * Réceptionne une livraison
         */
        $scope.addDelivery = function($event) {
            $scope.selectedDelivery = null;
            $mdDialog
                .show({
                    templateUrl: 'views/templates/delivery.tmpl.html',
                    parent: angular.element(document.body),
                    scope: $scope,
                    preserveScope: true,
                    targetEvent: $event,
                })
            ;
        };

        /**
         * Choisis une bière pour la livraison
         */
        $scope.selectedDeliveryChange = function(beer) {
            $scope.selectedDelivery = beer;
        };

        /**
         * Délivre une bière (action réelle)
         */
        $scope.deliverStock = function(amount, number) {
            if ($scope.selectedDelivery === null) {
                return Alert.toast('Il faut séléctionner une bière !');
            }
            $scope.isLoading = true;

            delivery = {beer: $scope.selectedDelivery, credit: amount, number: number};
            $http
                .post(apiPrefix + 'transactions', delivery)
                .then(function(){
                    $scope.isLoading = false;
                    Alert.toast('Bières réceptionnées !');
                    reloadDeliveries();
                    reloadBeers();
                })
            ;
        };

        /**
         * Supprime une livraison
         */
        $scope.deleteDelivery = function(delivery) {
            if ($scope.isLoading) {
                return;
            }
            $scope.isLoading = true;
            $http
                .delete(apiPrefix + 'transactions/' + delivery.id)
                .then(function(){
                    $scope.deliveries.splice($scope.deliveries.indexOf(delivery), 1);
                    Alert.toast('Livraison supprimée !');
                    $scope.isLoading = false;
                    reloadDeliveries();
                    reloadBeers();
                })
            ;
        };

        /**
         * Recharge l'historique des livraisons
         */
        var reloadDeliveries = function() {
            $http
                .get(apiPrefix + 'transactions?limit=50&sort=-date')
                .then(function(response){
                    $scope.deliveries = response.data.data;
                })
            ;
        };

        /**
         * Recharge les bières
         */
        var reloadBeers = function() {
            $http
                .get(apiPrefix + 'beers')
                .then(function(response){
                    $scope.beers = response.data;
                })
            ;
        }
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
                    },
                    deliveries: function($http) {
                        'ngInject';

                        return $http.get(apiPrefix + 'transactions?limit=50&sort=-date').then(
                            function(response) {
                                return response.data.data;
                            },
                            function() {
                                console.error('Failed to retrieve deliveries');
                            }
                        );
                    },
                },
                data: {
                    title: 'Bières'
                }
            })
        ;
    })
;
