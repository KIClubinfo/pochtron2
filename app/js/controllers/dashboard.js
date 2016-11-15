angular.module('foyer')
    .controller('Dashboard_Ctrl', function($scope, statistics) {
        'ngInject';

        $scope.promoBalance = {
          labels: statistics.promoBalances.labels,
          series: ['Balance des promos'],
          data: [statistics.promoBalances.data],
          options: {
            title: {
              display: true,
              text: 'Balance par promo',
              fontSize: 16,
            }
          }
        };

    })
    .config(function($stateProvider) {
        'ngInject';

        $stateProvider
            .state('root.dashboard', {
                url: '/dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'Dashboard_Ctrl',
                resolve: {
                    statistics: function($resource) {
                        'ngInject';

                        return $resource(apiPrefix + 'statistics/foyer/dashboard').get().$promise;
                    },
                },
                data: {
                    title: 'Dashboard'
                }
            })
        ;
    })
;
