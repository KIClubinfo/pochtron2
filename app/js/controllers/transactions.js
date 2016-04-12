angular.module('foyer')
    .controller('Transactions_Ctrl', function($scope, $http, $q, $mdDialog, Alert, transactions, Paginate) {
        $scope.transactions = transactions;

        $scope.next = function() {
            Paginate.next($scope.transactions).then(function(data){
                $scope.transactions = data;
            });
        };

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
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         *                        TRANSACTIONS EDITION
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         */

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
            if ((pin+'').hashCode() != '3039') {
                return Alert.toast('Mauvais code PIN !');
            }
            if ($scope.selectedCredit === null) {
                return Alert.toast('Il faut séléctionner quelqu\'un !');
            }

            $http
                .post(apiPrefix + 'transactions', {user: $scope.selectedCredit.slug, credit: balance})
                .success(function(){
                    reloadConsos();
                    Alert.toast('Compte mis à jour.');
                    $mdDialog.hide();
                    $scope.selectedCredit = null;
                    $scope.balance = 0;
                    $scope.pin = '';
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
         * Recharge l'historique des transactions
         */
        var reloadConsos = function() {
            $http
                .get(apiPrefix + 'transactions?limit=50&sort=-date')
                .success(function(data){
                    $scope.transactions = data;
                })
            ;
        };

        $scope.selectedCredit = null;
    })
    .config(function($stateProvider) {
        $stateProvider
            .state('root.transactions', {
                url: '/transactions',
                templateUrl: 'views/transactions.html',
                controller: 'Transactions_Ctrl',
                resolve: {
                    transactions: ['Paginate', function(Paginate) {
                        return Paginate.get('transactions?sort=-date', 30);
                    }]
                },
                data: {
                    title: 'Transactions'
                }
            })
        ;
    })
;
