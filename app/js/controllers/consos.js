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

var consoSent = 0;
var consoOk = 0;
var sentBasketEntry = null;

angular.module('foyer')
    .controller('Consos_Ctrl', function($scope, $http, $timeout, $interval, $q, $mdDialog, Alert, beers, users, consos) {
        $scope.users = users;
        $scope.beers = beers;
        $scope.consos = consos;
        $scope.basket = [];
        $scope.searchText1 = '';
        $scope.searchText2 = '';





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
            var results = query ? $scope.users : $scope.users,
            deferred;
            $http
                .post(apiPrefix + 'search', {search: 'User/' + query})
                .success(function(data) {
                    deferred.resolve(data.users);
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
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(state) {
                return angular.lowercase(state.name).indexOf(lowercaseQuery) === 0;
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

            if ((user.slug !== undefined && user.slug == 'externe-foyer') || (user.username !== undefined && user.username == 'externe-foyer')) {
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
                if ($scope.basket[key].user == user) {
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

        var consoAdded = function() {
            consoOk++;
            if (consoOk >= consoSent) {
                consoSent = consoOk = 0;
                $scope.isLoading = false;
                Alert.toast('Consos encaissées !');

                $scope.emptyUser(sentBasketEntry);
                sentBasketEntry = null;
                reloadConsos();
            }
        };

        /**
         * Confirme le panier
         */
        $scope.confirmBasket = function() {
            if ($scope.isLoading) {
                return;
            }
            $scope.isLoading = true;

            // Count consos
            consoSent = 0;
            for (var key in $scope.basket) {
                consoSent += $scope.basket[key].beers.length;
            }

            for (key in $scope.basket) {
                $scope.confirmBasketEntry($scope.basket[key], true);
            }
        };

        $scope.confirmBasketEntry = function(basketEntry, ignoreLoadingCheck) {
            consoSent = consoOk = 0;
            if (basketEntry.beers.length === 0) {
                return Alert.toast('Le panier est vide');
            }
            if ($scope.isLoading && ignoreLoadingCheck === undefined) {
                return;
            }
            $scope.isLoading = true;

            var slug;
            if (basketEntry.user.username) {
                slug = basketEntry.user.username;
            } else {
                slug = basketEntry.user.slug;
            }

            if (ignoreLoadingCheck === undefined) {
                consoSent = basketEntry.beers.length;
            }
            for (var key in basketEntry.beers) {
                $http.post(apiPrefix + 'transactions', {user: slug, beer: basketEntry.beers[key].slug}).success(consoAdded);
            }
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
                .success(function(){
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
                return Alert.toast('Il faut séléctionner quelqu\'un !');
            }

            $http
                .post(apiPrefix + 'transactions/', {user: $scope.selectedCredit.slug, credit: balance})
                .success(function(){
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
                .success(function(data){
                    $scope.consos = data;
                })
            ;
        };

        /**
         * Toutes les 5 minutes, on recharge tout pour bien trier/afficher
         */
        $interval(function() {
            $http
                .get(apiPrefix + 'beers')
                .success(function(data){
                    $scope.beers = data;
                })
            ;
            $http
                .get(apiPrefix + 'userbeers')
                .success(function(data){
                    $scope.users = data;
                })
            ;
            reloadConsos();
        }, 300000);

        $scope.selectedCredit = null;
    })
    .config(function($stateProvider) {
        $stateProvider
            .state('root.consos', {
                url: '/consos',
                templateUrl: 'views/consos.html',
                controller: 'Consos_Ctrl',
                resolve: {
                    beers: function($resource) {
                        return $resource(apiPrefix + 'beers').query().$promise;
                    },
                    users: function($resource) {
                        return $resource(apiPrefix + 'userbeers').query().$promise;
                    },
                    consos: function($resource) {
                        return $resource(apiPrefix + 'transactions?limit=50&sort=-date').query().$promise;
                    }
                },
                data: {
                    title: 'Consos'
                }
            })
        ;
    })
;
