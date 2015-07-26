angular.module('portfolio', ['ui.router', 'ngMaterial', 'ngMessages'])
    // Setup theme
    .config(function($mdThemingProvider) {
        $mdThemingProvider.definePalette('foyerPalette', {
            '50': 'ffebee',
            '100': 'ffcdd2',
            '200': 'ef9a9a',
            '300': 'e57373',
            '400': 'ef5350',
            '500': 'f44336',
            '600': 'e53935',
            '700': 'd32f2f',
            '800': 'c62828',
            '900': 'b71c1c',
            'A100': 'ff8a80',
            'A200': 'ff5252',
            'A400': 'ff1744',
            'A700': 'd50000',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
            'contrastLightColors': undefined
        });
        $mdThemingProvider.theme('default').primaryPalette('foyerPalette');
    })
    // Setup routes
    .config(function($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
        $urlMatcherFactoryProvider.strictMode(false);
        $urlRouterProvider.otherwise('/404');

        $stateProvider
            .state('login', {
                url: '',
                templateUrl: 'views/login.html',
                controller: 'Login_Ctrl'
            })
            .state('root', {
                url: '',
                abstract: true,
                template: '<div ui-view></div>'
            })
            .state('root.home', {
                url: 'home',
                templateUrl: 'views/home.html',
                controller: 'Home_Ctrl'
            })
            .state('root.404', {
                url: '404',
                templateUrl: 'views/404.html'
            })
            .state('root.418', {
                url: '418',
                templateUrl: 'views/418.html'
            })
        ;
    })
    // Setup interceptor
    .factory('ErrorCodes_Interceptor', function($rootScope, $location, $q, StorageService) {
        return {
            responseError: function(response) {
                switch (response.status) {
                case 401:
                    StorageService.remove('token');
                    StorageService.remove('roles');
                    $rootScope.isLogged = false;
                    $location.path('/');
                    break;
                case 403:
                    $location.path('/403');
                    break;
                case 404:
                    $location.path('/404');
                    break;
                case 500:
                    $location.path('/erreur');
                    break;
                case 503:
                    if (response.data.until)
                        StorageService.set('maintenance', response.data.until);
                    else
                        StorageService.remove('maintenance');
                    $location.path('/maintenance');
                    $rootScope.maintenance = true;
                    break;
                }
                return $q.reject(response);
            }
        };
    })
;
