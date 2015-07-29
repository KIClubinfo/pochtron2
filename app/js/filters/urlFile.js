angular.module('foyer').filter('urlFile', function() {
    return function(input) {
        return apiPrefix + input;
    };
});
