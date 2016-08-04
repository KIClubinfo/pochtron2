angular.module('foyer')
    .config(function ($stateProvider) {
        $stateProvider
            .state('root.users', {
                url: '/utilisateurs',
                template: '<div ui-view></div>',
                abstract: true
            })
            .state('root.users.list', {
                url: '',
                templateUrl: 'views/users/list.html',
                controller: 'Users_List_Ctrl',
                data: {
                    title: 'Profils - Recherche'
                }
            })
            .state('root.users.simple', {
                url: '/:username',
                templateUrl: 'views/users/simple.html',
                controller: 'Users_Simple_Ctrl',
                resolve: {
                    user: ['$resource', '$stateParams', function ($resource, $stateParams) {
                        return $resource(apiPrefix + 'users/:username').get({
                            username: $stateParams.username
                        }).$promise;
                    }],
                    statistics: ['$resource', '$stateParams', function ($resource, $stateParams) {
                        return $resource(apiPrefix + 'statistics/foyer/:username').get({
                            username: $stateParams.username
                        }).$promise;
                    }],
                    transactions: ['Paginate', '$stateParams', function (Paginate, $stateParams) {
                        return Paginate.get('users/' + $stateParams.username + '/transactions?sort=-date', 30);
                    }]
                },
                data: {
                    title: 'Profil'
                }
            })
        ;
    })
;
