angular.module('foyer')
    .factory('Permissions', function($rootScope, $http, Storage, jwtHelper, $state, Alert) {
        'ngInject';
        
        remove = function() {
            $rootScope.isLogged = false;
            Storage.remove('token');
            Storage.remove('roles');
        };

        // Charge les permissions à partir du token stocké dans le Storage
        load = function() {
            if (Storage.get('token') && !jwtHelper.isTokenExpired(Storage.get('token'))) {
                $rootScope.isLogged = true;
            } else {
                remove();
            }
        };

        return {
            load: function() {
                load();
            },

            set: function(loginData) {
                Storage.set('token', loginData.token);
                Storage.set('roles', loginData.data.roles);
                load();
                var username = loginData.data.username;

                // Checking if user is member of Foyer at this point is not a security breach because all used API routes are protected
                $http
                    .get(apiPrefix + 'users/' + username + '/clubs')
                    .success(function(data){
                        membreFoyer = false;
                        for (var i = 0; i < loginData.data.roles.length; i++) {
                            if (loginData.data.roles[i] == 'ROLE_ADMIN')
                                membreFoyer = true;
                        }
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].club.slug == 'foyer')
                                membreFoyer = true;
                        }
                        if (!membreFoyer) {
                            Alert.toast('Tu n\'es pas un membre du Foyer ! Accès interdit !');
                            remove();
                        } else {
                            if (typeof $rootScope.urlRef !== 'undefined' && $rootScope.urlRef !== null && $rootScope.urlRef != '/') {
                                window.location.href = $rootScope.urlRef;
                                $rootScope.urlRef = null;
                            } else {
                                $state.go('root.basket');
                            }
                            Alert.toast('Connecté avec succès !');
                        }
                    })
                ;
                // On récupère les données utilisateur
                $http
                    .get(apiPrefix + 'users/' + username)
                    .success(function(data){
                        $rootScope.me = data;
                    })
                ;
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
