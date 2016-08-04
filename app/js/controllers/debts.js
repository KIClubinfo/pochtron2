angular.module('foyer')
    .controller('Debts_Ctrl', function($scope, $http, $mdDialog, Alert, Paginate, users) {
        $scope.users = users;
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
    .config(function ($stateProvider) {
        $stateProvider
            .state('root.debts', {
                url: '/dettes',
                templateUrl: 'views/debts.html',
                controller: 'Debts_Ctrl',
                data: {
                    title: 'Dettes'
                },
                resolve:{
                    users: ['Paginate', function (Paginate) {
                        return Paginate.get('users?sort=balance,firstName,lastName', 30)
                    }]
                }
            })
        ;
    })
;

;
