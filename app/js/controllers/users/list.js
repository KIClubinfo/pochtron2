angular.module('foyer')
    .controller('Users_List_Ctrl', function($scope, $http, $q, $state) {
        'ngInject';

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
                .then(function(response) {
                    deferred.resolve(response.data.users);
                })
            ;
            return deferred.promise;
        };

        $scope.selectedUserChange = function(user) {
            $state.go('root.users.simple', {username: user.slug});
        };
    })
;
