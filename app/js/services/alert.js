angular.module('foyer')
    .factory('Alert', function($mdToast) {
        return {
            toast: function(content) {
                $mdToast.show(
                  $mdToast.simple()
                    .content(content)
                    .position('bottom right')
                    .hideDelay(3000)
                );
            },
        };
    })
;
