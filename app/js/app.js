var apiPrefix = 'https://upont.enpc.fr/api/';

angular
    .module('foyer', [
        'angular-jwt',
        'infinite-scroll',
        'naif.base64',
        'ngAnimate',
        'ngMaterial',
        'ngMaterialCss',
        'ngMessages',
        'ngResource',
        'ui.router',
        'chart.js',
    ])
    // Setup theme
    .config(function (ChartJsProvider) {
        'ngInject';
        // Configure all charts
        ChartJsProvider.setOptions({
          responsive: true,
          maintainAspectRatio: true,
        });
    })
    .config(function($mdThemingProvider) {
        'ngInject';

        $mdThemingProvider.definePalette('mcgpalette0', {
            '50': '#e4e7ea',
            '100': '#b8c1c9',
            '200': '#98a4b1',
            '300': '#708092',
            '400': '#627181',
            '500': '#556270',
            '600': '#48535f',
            '700': '#3b444d',
            '800': '#2d343c',
            '900': '#20252a',
            'A100': '#e4e7ea',
            'A200': '#b8c1c9',
            'A400': '#627181',
            'A700': '#3b444d',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100 A200'
        });

        $mdThemingProvider.definePalette('mcgpalette1', {
            '50': '#f4fcfb',
            '100': '#b9ebe8',
            '200': '#8ddfd9',
            '300': '#55cfc6',
            '400': '#3dc8be',
            '500': '#33b4ab',
            '600': '#2c9c94',
            '700': '#25847e',
            '800': '#1f6c67',
            '900': '#185550',
            'A100': '#f4fcfb',
            'A200': '#b9ebe8',
            'A400': '#3dc8be',
            'A700': '#25847e',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 300 400 500 A100 A200 A400'
        });

        $mdThemingProvider.definePalette('mcgpalette2', {
            '50': '#fefffb',
            '100': '#e4f9b4',
            '200': '#d1f580',
            '300': '#b8f03e',
            '400': '#aeee21',
            '500': '#9fe011',
            '600': '#8bc40f',
            '700': '#77a70d',
            '800': '#628b0b',
            '900': '#4e6e08',
            'A100': '#fefffb',
            'A200': '#e4f9b4',
            'A400': '#aeee21',
            'A700': '#77a70d',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 300 400 500 600 700 A100 A200 A400 A700'
        });

        $mdThemingProvider.definePalette('mcgpalette3', {
            '50': '#fff2f2',
            '100': '#ffa6a6',
            '200': '#ff6e6e',
            '300': '#ff2626',
            '400': '#ff0808',
            '500': '#e80000',
            '600': '#c90000',
            '700': '#ab0000',
            '800': '#8c0000',
            '900': '#6e0000',
            'A100': '#fff2f2',
            'A200': '#ffa6a6',
            'A400': '#ff0808',
            'A700': '#ab0000',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100 A200'
        });

        $mdThemingProvider.definePalette('mcgpalette4', {
            '50': '#faeff0',
            '100': '#e6b5b9',
            '200': '#d88b92',
            '300': '#c6565f',
            '400': '#be404a',
            '500': '#a73841',
            '600': '#903038',
            '700': '#79292f',
            '800': '#622126',
            '900': '#4b191d',
            'A100': '#faeff0',
            'A200': '#e6b5b9',
            'A400': '#be404a',
            'A700': '#79292f',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100 A200'
        });

        $mdThemingProvider.theme('default')
            .primaryPalette('red')
            .accentPalette('red')
            // .primaryPalette('mcgpalette0')
            // .accentPalette('mcgpalette1', {
            //     'default': '300'
            // })
        ;
    })
    // Setup routes
    .config(function($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
        'ngInject';

        $urlMatcherFactoryProvider.strictMode(false);
        $urlRouterProvider.otherwise('/404');

        $stateProvider
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
    .factory('ErrorCodes_Interceptor', function($rootScope, $location, $q, Storage) {
        'ngInject';

        return {
            responseError: function(response) {
                switch (response.status) {
                case 401:
                    Storage.remove('token');
                    Storage.remove('roles');
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
                        Storage.set('maintenance', response.data.until);
                    else
                        Storage.remove('maintenance');
                    $location.path('/maintenance');
                    $rootScope.maintenance = true;
                    break;
                }
                return $q.reject(response);
            }
        };
    })
    .config(function($httpProvider, jwtOptionsProvider) {
        'ngInject';

        jwtOptionsProvider.config({
            tokenGetter: function (Storage, options, jwtHelper, $q) {
                'ngInject';

                // On n'envoie pas le token pour les templates
                if (options.url.substr(options.url.length - 5) === '.html')
                    return null;

                if (Storage.get('token') && jwtHelper.isTokenExpired(Storage.get('token'))) {
                    Permissions.remove('token');
                    return $q.reject(options);
                }
                return Storage.get('token');
            },
            whiteListedDomains: ['localhost', 'upont.enpc.fr', 'foyer.enpc.org'],
        });

        $httpProvider.interceptors.push('jwtInterceptor');
        $httpProvider.interceptors.push('ErrorCodes_Interceptor');
    })
    .config(function($httpProvider) {
        'ngInject';

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    })
;

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);
