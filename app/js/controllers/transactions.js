angular.module('foyer')
    .controller('Transactions_Ctrl', function($scope, $http, $q, $mdDialog, Alert, transactions, Paginate) {
        'ngInject';

        $scope.transactions = {
          numLoaded: transactions.data.length,
          numToLoad: transactions.data.length,
          items: transactions,

          getItemAtIndex: function(index) {
            if (index > this.numLoaded) {
              this.fetchMoreItems_(index);
              return null;
            }

            return this.items.data[index];
          },

          // For infinite scroll behavior, we always return a slightly higher
          // number than the previously loaded items.
          getLength: function() {
            return Math.min(this.numLoaded + 5, this.items.pagination_infos.count);
          },

          fetchMoreItems_: function(index) {
            if (this.numToLoad < index) {
              this.numToLoad += 30;

              Paginate.next(this.items).then(angular.bind(this, function(result){
                  this.items = result;
                  this.numLoaded = this.numToLoad;
              }));
            }
          },
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
                .then(function(){
                    $scope.transactions.data.splice($scope.transactions.data.indexOf(transaction), 1);
                    Alert.toast('Conso supprimée !');
                    $scope.isLoading = false;
                },
                function(){
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

                        return Paginate.get('transactions', {
                            sort: '-date',
                            limit: 30,
                        });
                    }
                },
                data: {
                    title: 'Transactions'
                }
            })
        ;
    })
;
