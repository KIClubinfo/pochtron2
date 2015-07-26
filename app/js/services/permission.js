angular.module('foyer')
    .factory('Permissions', function($rootScope, $http, Storage, jwtHelper) {
        remove = function() {
            $rootScope.isLogged = false;
            Storage.remove('token');
            Storage.remove('roles');
        };

        // Charge les permissions à partir du token stocké dans le Storage
        load = function() {
            if (Storage.get('token') && !jwtHelper.isTokenExpired(Storage.get('token'))) {
                $rootScope.isLogged = true;

                var username = jwtHelper.decodeToken(Storage.get('token')).username;
                // On récupère les données utilisateur
                $http
                    .get(apiPrefix + 'users/' + username)
                    .success(function(data){
                        $rootScope.me = data;
                    })
                ;

                // On récupère les clubs de l'utilisateurs pour déterminer ses droits de publication
                $http
                    .get(apiPrefix + 'users/' + username + '/clubs')
                    .success(function(data){
                        $rootScope.clubs = data;
                    })
                ;
            } else {
                remove();
            }
        };

        return {
            // Vérifie si l'utilisateur a les droits sur un club
            hasClub: function(slug) {
                for (var i = 0; i < $rootScope.clubs.length; i++) {
                    if ($rootScope.clubs[i].club.slug == slug)
                        return true;
                }
                return false;
            },

            load: function() {
                load();
            },

            set: function(token, roles) {
                Storage.set('token', token);
                Storage.set('roles', roles);
                load();
            },

            remove: function() {
                remove();
            },

            username: function() {
                return jwtHelper.decodeToken(Storage.get('token')).username;
            }
        };
    })
;
