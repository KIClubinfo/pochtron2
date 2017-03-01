angular.module('foyer')
    .controller('Debts_Ctrl', function($scope, $http, $mdDialog, Alert, Paginate, users) {
        'ngInject';

        $scope.sortBalance = 'balance';

        $scope.users = {
          numLoaded: users.data.length,
          numToLoad: users.data.length,
          items: users,

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

          reload: function() {
              Paginate.get('users?sort=' + $scope.sortBalance + ',firstName,lastName', 30).then(angular.bind(this, function(result){
                  this.items = result;
                  this.numLoaded = result.data.length;
                  this.numToLoad =  result.data.length;
              }));
          }
        };

        $scope.exportDebts = function () {
            $http.get(apiPrefix + 'foyer/debts')
                .then(function(result){
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
        'ngInject';

        $stateProvider
            .state('root.debts', {
                url: '/dettes',
                templateUrl: 'views/debts.html',
                controller: 'Debts_Ctrl',
                data: {
                    title: 'Dettes'
                },
                resolve:{
                    users: function (Paginate) {
                        'ngInject';

                        return Paginate.get('users?sort=balance,firstName,lastName', 30)
                    }
                }
            })
        ;
    })
;

;
