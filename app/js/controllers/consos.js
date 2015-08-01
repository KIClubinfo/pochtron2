angular.module('foyer')
    .controller('Consos_Ctrl', function($scope, $http, $timeout, $interval, $q, Alert, beers, users, consos) {
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
                1000);
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
