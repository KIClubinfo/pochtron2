angular.module('foyer')
    .controller('Transactions_Ctrl', function($scope, $http, $q, $mdDialog, Alert, transactions, Paginate) {
        'ngInject';

        $scope.transactions = transactions;

        $scope.next = function() {
            Paginate.next($scope.transactions).then(function(data){
                $scope.transactions = data;
            });
        };

         /**
         * Supprime une transaction
         */
        $scope.deleteConso = function(transaction) {
            if ($scope.isLoading) {
                return;
            }
            $scope.isLoading = true;
            $http
                .delete(apiPrefix + 'transactions/' + transaction.id)
                .success(function(){
                    $scope.transactions.data.splice($scope.transactions.data.indexOf(transaction), 1);
                    Alert.toast('Conso supprimée !');
                    $scope.isLoading = false;
                })
                .error(function(){
                    Alert.toast('Erreur !');
                    $scope.isLoading = false;
                })
            ;
        };
    })
    .config(function($stateProvider) {
        'ngInject';

        $stateProvider
            .state('root.transactions', {
                url: '/transactions',
                templateUrl: 'views/transactions.html',
                controller: 'Transactions_Ctrl',
                resolve: {
                    transactions: function(Paginate) {
                        'ngInject';

                        return Paginate.get('transactions?sort=-date', 30);
                    }
                },
                data: {
                    title: 'Transactions'
                }
            })
        ;
    })
;
