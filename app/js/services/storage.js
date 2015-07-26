angular.module('foyer')
    .factory('Storage', function() {
        return {
            get: function(key) {
                return localStorage.getItem(key);
            },

            set: function(key, data) {
                if (typeof(data) == 'object')
                    localStorage.setItem(key, JSON.stringify(data));
                else
                    localStorage.setItem(key, data);
            },

            remove: function(key) {
                localStorage.removeItem(key);
            },

            clearAll: function() {
                localStorage.clear();
            }
        };
    })
;
