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

angular.module('foyer')
    .controller('Consos_Ctrl', function($scope, $http, $timeout, $interval, $q, $mdDialog, Alert, beers, users, consos) {
        var beer = {
            image_url: '',
            name: 'Choisis une bière',
            price: ''
        };
        $scope.users = users;
        $scope.beers = beers;
        $scope.clients = [];
        $scope.beer = beer;
        $scope.searchText1 = '';
        $scope.searchText2 = '';
        $scope.consos = consos;
        var chosenBeer;

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

        $scope.selectUser = function(user) {
            // Add user only if not present
            if ($scope.clients.indexOf(user) === -1)
                $scope.clients.push(user);
        };

        $scope.emptyUser = function(user) {
            $scope.clients.splice($scope.clients.indexOf(user), 1);
        };

        $scope.selectedUserChange = function(item) {
            $scope.selectUser(item);
        };

        $scope.searchBeer = function(query) {
            return query ? $scope.beers.filter(createFilterFor(query)) : $scope.beers;
        };

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(state) {
                return angular.lowercase(state.name).indexOf(lowercaseQuery) === 0;
            };
        }

        $scope.selectedBeerChange = function(item) {
            $scope.selectBeer(item);
        };

        $scope.selectBeer = function(item) {
            $scope.beer = item;
        };

        $scope.emptyBeer = function() {
            $scope.beer = beer;
        };

        $scope.emptyBasket = function() {
            $scope.beer = beer;
            $scope.clients = [];
        };

        $scope.confirmBasket = function() {
            if ($scope.clients.length === 0 || $scope.beer == beer) {
                return Alert.toast('Le panier est vide');
            }
            chosenBeer = $scope.beer;
            if ($scope.isLoading) {
                return;
            }
            $scope.isLoading = true;
            var slug;

            for (var key in $scope.clients) {
                if ($scope.clients[key].username) {
                    slug = $scope.clients[key].username;
                } else {
                    slug = $scope.clients[key].slug;
                }

                $http.post(apiPrefix + 'beers/' + $scope.beer.slug + '/users/' + slug);
                $timeout($http
                    .get(apiPrefix + 'users/' + slug)
                    .success(function(data){
                        $scope.consos.unshift({beer: chosenBeer, user: data, date: new Date().getTime()});
                    }),
                3000);
            }
            $scope.isLoading = false;
            Alert.toast('Consos encaissées !');
            $scope.beer = beer;
            $scope.clients = [];
        };

        $scope.deleteConso = function(conso) {
            if ($scope.isLoading) {
                return;
            }
            $scope.isLoading = true;
            $http
                .delete(apiPrefix + 'beers/' + conso.beer.slug + '/users/' + conso.user.username + '/' + conso.id)
                .success(function(){
                    $scope.consos.splice($scope.consos.indexOf(conso), 1);
                    Alert.toast('Conso supprimée !');
                    $scope.isLoading = false;
                })
            ;
        };

        // Toutes les 5 minutes, on recharge tout pour bien trier/afficher
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
            $http
                .get(apiPrefix + 'beerusers?limit=50&sort=-date')
                .success(function(data){
                    $scope.consos = data;
                })
            ;
        }, 300000);

        $scope.selectedCredit = null;
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
                .then(function() {}, function() {
                    Alert.toast('Tant pis...');
                })
            ;
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.selectedCreditChange = function(user) {
            $scope.selectedCredit = user;
        };

        $scope.creditBalance = function(balance, pin) {
            if (pin.hashCode() !== '1450485246') {
                return Alert.toast('Mauvais code PIN !');
            }
            if ($scope.selectedCredit === null) {
                return Alert.toast('Il faut séléctionner quelqu\'un !');
            }

            $http
                .patch(apiPrefix + 'users/' + $scope.selectedCredit.slug + '/balance', {balance: balance})
                .success(function(){
                    $http
                        .get(apiPrefix + 'beerusers?limit=50&sort=-date')
                        .success(function(data){
                            $scope.consos = data;
                            Alert.toast('Compte mis à jour.');
                            $mdDialog.hide();
                            $scope.selectedCredit = null;
                            $scope.balance = 0;
                        })
                    ;
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
                    },
                    users: function($resource) {
                        return $resource(apiPrefix + 'userbeers').query().$promise;
                    },
                    consos: function($resource) {
                        return $resource(apiPrefix + 'beerusers?limit=50&sort=-date').query().$promise;
                    }
                },
                data: {
                    title: 'Consos'
                }
            })
        ;
    })
;
