angular.module('foyer')
    .controller('Users_Ctrl', function($scope, $http, $mdDialog, Alert, Paginate) {
        $scope.sortBalance = 'balance';

        $scope.next = function() {
            Paginate.next($scope.users).then(function(data){
                $scope.users = data;
            });
        };

        $scope.reload = function() {
            Paginate.get('users?sort=' + $scope.sortBalance + ',firstName,lastName', 30).then(function(data){
                $scope.users = data;
            });
        };

        $scope.reload();
    })
    .config(function($stateProvider) {
        $stateProvider
            .state('root.users', {
                url: '/utilisateurs',
                templateUrl: 'views/users.html',
                controller: 'Users_Ctrl',
                data: {
                    title: 'Utilisateurs'
                }
            })
        ;
    })
;
