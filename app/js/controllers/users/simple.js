angular.module('foyer')
    .controller('Users_Simple_Ctrl', function($scope, user, statistics, transactions, Paginate) {
        'ngInject';

        $scope.user = user;

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
            return Math.min(this.numLoaded + 5, this.items.headers['total-count']);
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


    })
;
