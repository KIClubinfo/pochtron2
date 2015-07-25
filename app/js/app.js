angular.module('portfolio', ['ui.router', 'angularify.semantic.sidebar', 'pascalprecht.translate', 'ngSanitize'])
    // Setup routes
    .config(function($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $translateProvider) {
        $urlMatcherFactoryProvider.strictMode(false);
        $urlRouterProvider.otherwise('/404');

        $stateProvider
            .state('root', {
                url: '',
                abstract: true,
                template: '<div ui-view></div>'
            })
            .state('root.home', {
                url: '',
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
    // Set up root methods
    .run(function($rootScope, $translate) {
        $rootScope.changeLanguage = function(key) {
            $translate.use(key);
        };
    })
;

// Activate theme
$(document)
    .ready(function() {
        // Create sidebar and attach to menu open
        $('.ui.sidebar')
            .sidebar('attach events', '.toc.item')
        ;
    })
;
