angular.module('foyer')
    .config(function ($stateProvider) {
        'ngInject';

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
                    user: function ($resource, $stateParams) {
                        'ngInject';

                        return $resource(apiPrefix + 'users/:username').get({
                            username: $stateParams.username
                        }).$promise;
                    },
                    statistics: function ($resource, $stateParams) {
                        'ngInject';

                        return $resource(apiPrefix + 'statistics/foyer/:username').get({
                            username: $stateParams.username
                        }).$promise;
                    },
                    transactions: function (Paginate, $stateParams) {
                        'ngInject';

                        return Paginate.get('users/' + $stateParams.username + '/transactions', {
                            sort: '-date',
                            limit: 30,
                        });
                    }
                },
                data: {
                    title: 'Profil'
                }
            })
        ;
    })
;
