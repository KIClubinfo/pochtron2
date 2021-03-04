String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0) {
        return hash;
    }

    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

var consosToSend = [];

angular.module('foyer')
    .controller('Basket_Ctrl', function($scope, $http, $timeout, $interval, $q, $mdDialog, Alert, filterFilter, beers, users, consos) {
        'ngInject';

        $scope.users = users;
        $scope.beers = beers;
        $scope.consos = consos;
        $scope.basket = [];
        $scope.userSearchText = '';
        $scope.beerSearchText = '';

        /**
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *                              SEARCH
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         */

        /**
         * Recherche un utilisateur
         */
        $scope.searchUser = function(query) {
            deferred = $q.defer();
            var results = query ? $scope.users : $scope.users, deferred;
            $http
                .post(apiPrefix + 'search', {search: 'User/' + query})
                .then(function(response) {
                    deferred.resolve(filterFilter(response.data.users, function(value, index, array){
                        return value.promo === '021' || value.promo === '022' || value.promo === '023'
                    }));
                })
            ;
            return deferred.promise;
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
        }











        /**
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *                        BASKET FILLING
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         */

        /**
         * Ajout d'un user au panier avec confirmation PIN
         */
        $scope.selectedUserChange = function(item) {
            $scope.selectUser(item);
        };
        $scope.selectUser = function(user) {
            // PIN access for external account
            if (user.slug === undefined && user.username === undefined) {
                return;
            }

            if ((user.slug !== undefined && user.slug === 'externe-foyer') || (user.username !== undefined && user.username === 'externe-foyer')) {
                $scope.toValidate = user;
                $mdDialog
                    .show({
                        templateUrl: 'views/templates/pin.tmpl.html',
                        parent: angular.element(document.body),
                        scope: $scope,
                        preserveScope: true,
                    })
                    .then(function() {}, function() {
                        Alert.toast('Tant pis...');
                    })
                ;
                return;
            }

            $scope.addUser(user);
        };

        /**
         * Ajout effectif d'un user au panier
         */
        $scope.addUser = function(user) {
            // Add user only if not present
            for (var key in $scope.basket) {
                if ($scope.basket[key].user === user) {
                    return;
                }
            }

            $scope.basket.push({user: user, beers: []});
        };

        /**
         * Retire un user d'un panier
         */
        $scope.emptyUser = function(basketEntry) {
            $scope.basket.splice($scope.basket.indexOf(basketEntry), 1);
        };

        $scope.selectedBeerChange = function(item) {
            $scope.selectBeer(item);
        };

        /**
         * Ajout effectif d'une bière au panier
         */
        $scope.selectBeer = function(beer) {
            for (var key in $scope.basket) {
                $scope.basket[key].beers.push(beer);
            }
        };

        /**
         * Retrait d'une bière (dépend de la ligne dans le panier)
         */
        $scope.emptyBeer = function(basketEntry, beer) {
            var entryIndex = $scope.basket.indexOf(basketEntry);
            $scope.basket[entryIndex].beers.splice($scope.basket[entryIndex].beers.indexOf(beer), 1);
        };

        $scope.emptyBasket = function() {
            $scope.basket = [];
        };







        /**
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *                        BASKET CONFIRMATION
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         */

        /**
         * Envoie toutes les consos jusqu'à ce qu'il n'y en ait plus
         */
        var sendConsos = function() {
            if (consosToSend.length === 0) {
                $scope.isLoading = false;
                Alert.toast('Consos encaissées !');
                consosToSend = [];
                reloadConsos();
                return;
            }

            var conso = consosToSend.pop();
            $http.post(apiPrefix + 'transactions', {user: conso.user, beer: conso.beer}).then(sendConsos);
        };

        /**
         * Confirme le panier
         */
        $scope.confirmBasket = function() {
            consosToSend = [];

            if ($scope.basket.length === 0) {
                return Alert.toast('Le panier est vide');
            }
            if ($scope.isLoading) {
                return;
            }
            $scope.isLoading = true;

            for (var key in $scope.basket) {
                var basketEntry = $scope.basket[key];

                var slug;
                if (basketEntry.user.username) {
                    slug = basketEntry.user.username;
                } else {
                    slug = basketEntry.user.slug;
                }

                for (var key2 in basketEntry.beers) {
                    consosToSend.push({user: slug, beer: basketEntry.beers[key2].slug});
                }
            }
            $scope.basket = [];
            sendConsos();
        };

        $scope.confirmBasketEntry = function(basketEntry) {
            consosToSend = [];

            if (basketEntry.beers.length === 0) {
                return Alert.toast('Le panier est vide');
            }
            if ($scope.isLoading) {
                return;
            }
            $scope.isLoading = true;

            var slug;
            if (basketEntry.user.username) {
                slug = basketEntry.user.username;
            } else {
                slug = basketEntry.user.slug;
            }

            for (var key in basketEntry.beers) {
                consosToSend.push({user: slug, beer: basketEntry.beers[key].slug});
            }
            $scope.emptyUser(basketEntry);
            sendConsos();
        };











        /**
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *                        TRANSACTIONS EDITION
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         */

        /**
         * Supprime une conso
         */
        $scope.deleteConso = function(conso) {
            if ($scope.isLoading) {
                return;
            }
            $scope.isLoading = true;
            $http
                .delete(apiPrefix + 'transactions/' + conso.id)
                .then(function(){
                    $scope.consos.splice($scope.consos.indexOf(conso), 1);
                    Alert.toast('Conso supprimée !');
                    $scope.isLoading = false;
                })
            ;
        };










        /**
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *                              CREDIT
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         */

        /**
         * Crédite un compte (fait apparaitre le modal)
         */
        $scope.addBalance = function($event) {
            $scope.selectedCredit = null;
            $mdDialog
                .show({
                    templateUrl: 'views/templates/credit.tmpl.html',
                    parent: angular.element(document.body),
                    scope: $scope,
                    preserveScope: true,
                    targetEvent: $event,
                })
            ;
        };

        /**
         * Choisis un utilisateur dans la fonction de crédit
         */
        $scope.selectedCreditChange = function(user) {
            $scope.selectedCredit = user;
        };

        /**
         * Crédite un compte (action réelle)
         */
        $scope.creditBalance = function(balance, pin) {
            if ((pin+'').hashCode() != '1450485246') {
                return Alert.toast('Mauvais code PIN !');
            }
            if ($scope.selectedCredit === null) {
                return Alert.toast('Il faut sélectionner quelqu\'un !');
            }

            $http
                .post(apiPrefix + 'transactions', {user: $scope.selectedCredit.slug, credit: balance})
                .then(function(){
                    reloadConsos();
                    Alert.toast('Compte mis à jour.');
                    $mdDialog.hide();
                    $scope.selectedCredit = null;
                    $scope.balance = 0;
                    $scope.pin = '';
                    $scope.searchText3 = '';
                })
            ;
        };






        /**
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *                              UTILS
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         */

         /**
          * Annule un dialogue
          */
         $scope.cancel = function() {
             $mdDialog.cancel();
         };

        /**
         * Confirmation code pin appelée par le modal
         */
        $scope.pinConfirm = function(pin) {
            if ((pin+'').hashCode() != '1450485246') {
                return Alert.toast('Mauvais code PIN !');
            }
            $scope.addUser($scope.toValidate);
            $mdDialog.cancel();
            $scope.pin = '';
        };

        /**
         * Recharge l'historique des consos
         */
        var reloadConsos = function() {
            $http
                .get(apiPrefix + 'transactions?limit=50&sort=-date')
                .then(function(response){
                    $scope.consos = response.data.data;
                })
            ;
        };

        /**
         * Toutes les 5 minutes, on recharge tout pour bien trier/afficher
         */
        $interval(function() {
            $http
                .get(apiPrefix + 'beers')
                .then(function(response){
                    $scope.beers = response.data;
                })
            ;
            $http
                .get(apiPrefix + 'userbeers')
                .then(function(response){
                    $scope.users = response.data;
                })
            ;
            reloadConsos();
        }, 300000);

        $scope.selectedCredit = null;
    })
    .config(function($stateProvider) {
        'ngInject';

        $stateProvider
            .state('root.basket', {
                url: '/basket',
                templateUrl: 'views/basket.html',
                controller: 'Basket_Ctrl',
                resolve: {
                    beers: function($resource) {
                        'ngInject';

                        return $resource(apiPrefix + 'beers').query().$promise;
                    },
                    users: function($resource) {
                        'ngInject';

                        return $resource(apiPrefix + 'userbeers').query().$promise;
                    },
                    consos: function($http) {
                        'ngInject';

                        return $http.get(apiPrefix + 'transactions?limit=50&sort=-date').then(
                            function(response) {
                                return response.data.data;
                            },
                            function() {
                                console.error('Failed to retrieve consos');
                            }
                        );
                    },
                },
                data: {
                    title: 'Encaissement'
                }
            })
        ;
    })
;
