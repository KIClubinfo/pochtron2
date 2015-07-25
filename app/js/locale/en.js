angular.module('portfolio')
    .config(function($translateProvider) {
        $translateProvider.translations('en', {
            INTRO: 'Hello',
            START: 'Get started',
            BUTTON_LANG_EN: 'English',
            BUTTON_LANG_FR: 'Français'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    })
;
