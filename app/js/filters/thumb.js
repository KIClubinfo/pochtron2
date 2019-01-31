angular.module('foyer').filter('thumb', function() {
    return function(path) {
        if (!path) {
            return;
        }

        return path.replace(/images/, 'thumbnails');
    };
});
