angular.module('foyer')
    .controller('Users_Simple_Ctrl', function($scope, user, statistics, transactions, Paginate) {
        $scope.user = user;
        $scope.transactions = transactions;

        $scope.next = function() {
            Paginate.next($scope.transactions).then(function(data){
                $scope.transactions = data;
            });
        };


    })
;
