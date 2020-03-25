angular.module('foyer').factory('Paginate', function($http, $q, $httpParamSerializer, $rootScope) {
    'ngInject';

    loadData = function(paginationData, append) {
        // On indique qu'on est en train de charger de nouvelles données
        $rootScope.infiniteLoading = true;

        var url = paginationData.url;

        return $http({
            method: 'GET',
            url: apiPrefix + url + '?' + $httpParamSerializer(paginationData.pagination_params)
        }).then(
            function(response) {
                if (!append) {
                    paginationData = response.data;
                } else {
                    var merged = paginationData.data.concat(response.data.data);
                    paginationData = response.data;
                    paginationData.data = merged;
                }
                paginationData.url = url;

                $rootScope.infiniteLoading = false;

                return paginationData;
            }, function() {
                console.error('Failed to load more data');
                $rootScope.infiniteLoading = false;
            }
        );

    };

    return {
        get: function(url, paginationParams) {
            return $http({
                method: 'GET',
                url: apiPrefix + url + '?' + $httpParamSerializer(paginationParams)
            }).then(
                function(response) {
                    var paginationData = response.data;
                    paginationData.url = url;
                    return paginationData;
                },
                function() {
                    console.error('Failed to load initial data');
                }
            );
        },

        next: function(paginationData) {
            if ('next_page' in paginationData.pagination_infos) {
                paginationData.pagination_params.page = paginationData.pagination_infos.next_page;
                return loadData(paginationData, true);
            }
            else {
                return $q(function(resolve, reject) {
                    reject();
                });
            }
        },

        first: function(paginationData) {
            paginationData.pagination_params.page = paginationData.pagination_infos.first_page;
            return loadData(paginationData);
        }
    };
});
