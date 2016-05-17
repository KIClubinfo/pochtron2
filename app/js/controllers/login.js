angular.module('foyer')
    .controller('Login_Ctrl', function($scope, $rootScope, $state, $http, $mdToast, $animate, Permissions) {
        $scope.login = function(username, password) {
            $http
                .post(apiPrefix + 'login', {
                    username: username,
                    password: password
                })
                .success(function(data, status, headers, config) {
                    Permissions.set(data);
                })
                .error(function(data, status, headers, config) {
                    // Supprime tout token en cas de mauvaise identification
                    Permissions.remove();
                    $mdToast.show(
                      $mdToast
                        .simple()
                        .content(data.reason)
                        .position('bottom right')
                        .hideDelay(3000)
                    );
                })
            ;
        };
    })
    .config(function($stateProvider) {
        $stateProvider
            .state('login', {
                url: '',
                templateUrl: 'views/login.html',
                controller: 'Login_Ctrl'
            })
        ;
    })
;
