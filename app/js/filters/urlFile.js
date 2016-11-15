angular.module('foyer').filter('urlFile', function() {
    return function(input) {
        if(!input){
          return "";
        }

        return apiPrefix + input;
    };
});
