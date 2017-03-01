angular.module('foyer')
    .controller('Login_Ctrl', function($scope, $rootScope, $state, $http, $mdToast, $animate, Permissions) {
        'ngInject';

        $scope.login = function(username, password) {
            $http
                .post(apiPrefix + 'login', {
                    username: username,
                    password: password
                })
                .then(function(response) {
                    Permissions.set(response.data);
                },
                function(response) {
                    // Supprime tout token en cas de mauvaise identification
                    Permissions.remove();
                    $mdToast.show(
                      $mdToast
                        .simple()
                        .content(response.data.message)
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                })
            ;
        };
    })
    .config(function($stateProvider) {
        'ngInject';

        $stateProvider
            .state('login', {
                url: '',
                templateUrl: 'views/login.html',
                controller: 'Login_Ctrl'
            })
        ;
    })
;
