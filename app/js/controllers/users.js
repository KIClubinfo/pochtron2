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

        $scope.exportDebts = function () {
            $http.get(apiPrefix + 'foyer/debts')
                .success(function(result){
                    fileData = new Blob([result], { type: 'text/csv' });
                    fileUrl = URL.createObjectURL(fileData);

                    var hiddenElement = document.createElement('a');
                    hiddenElement.type = 'hidden';
                    hiddenElement.href = fileUrl;
                    hiddenElement.target = '_blank';
                    hiddenElement.download = 'dettes.csv';
                    document.body.appendChild(hiddenElement); // FF compatibility
                    hiddenElement.click();
            });
        };
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
