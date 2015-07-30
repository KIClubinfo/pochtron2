angular.module('foyer')
    .factory('Permissions', function($rootScope, $http, Storage, jwtHelper, $state, Alert) {
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

                // Checking if user is member of Foyer at this point is not a security breach because all used API routes are protected
                $http
                    .get(apiPrefix + 'users/' + username + '/clubs')
                    .success(function(data){
                        test = false;
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].club.slug == 'foyer')
                                test = true;
                        }
                        /*if (!test) {
                            alert('Tu n\'es pas un membre du Foyer ! Accès interdit !!!');
                            remove();
                        } else {*/
                            Alert.toast('Connecté avec succès !');

                            if (typeof $rootScope.urlRef !== 'undefined' && $rootScope.urlRef !== null && $rootScope.urlRef != '/') {
                                window.location.href = $rootScope.urlRef;
                                $rootScope.urlRef = null;
                            } else {
                                $state.go('root.consos');
                            }
                        //}
                    })
                ;
                // On récupère les données utilisateur
                $http
                    .get(apiPrefix + 'users/' + username)
                    .success(function(data){
                        $rootScope.me = data;
                    })
                ;
            } else {
                remove();
            }
        };

        return {
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
