angular.module('portfolio')
    .config(function($translateProvider) {
        $translateProvider.translations('fr', {
            INTRO: 'Salut',
            START: 'Démarrer',
            BUTTON_LANG_EN: 'English',
            BUTTON_LANG_FR: 'Français'
        });
    })
;
