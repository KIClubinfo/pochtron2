angular.module('foyer')
    .controller('Consos_Ctrl', function($scope, $http, $q, Alert, beers, users, consos) {
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

            for (var key in $scope.clients) {
                $http.post(apiPrefix + 'beers/' + $scope.beer.slug + '/users/' + $scope.clients[key].username);
                $http
                    .get(apiPrefix + 'users/' + $scope.clients[key].username)
                    .success(function(data){
                        $scope.consos.unshift({beer: chosenBeer, user: data, date: new Date().getTime()});
                    })
                ;
            }
            Alert.toast('Consos encaissées !');
            $scope.beer = beer;
            $scope.clients = [];
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
                        return $resource(apiPrefix + 'users?limit=48').query().$promise;
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
