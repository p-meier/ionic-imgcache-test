angular.module('imgcache', ['ionic'])
    .run(function ($ionicPlatform, $log, $rootScope) {
        ImgCache.options.debug = true;
        ImgCache.options.chromeQuota = 50 * 1024 * 1024;

        $ionicPlatform.ready(function () {
            ImgCache.init(function () {
                $log.debug('ImgCache init: success!');
                $rootScope.$broadcast('imgcache:ready');
            }, function () {
                $log.error('ImgCache init: error! Check the log for errors');
            });
        });
    })
    .service('$imgcache', function ($q) {
        return {
            cacheImage: function (src) {
                var deferred = $q.defer();
                ImgCache.isCached(src, function (path, success) {
                    if (success) {
                        deferred.resolve(path);
                    } else {
                        ImgCache.cacheFile(src, function () {
                            ImgCache.isCached(src, function (path, success) {
                                deferred.resolve(path);
                            }, deferred.reject);
                        }, deferred.reject);
                    }
                }, deferred.reject);
                return deferred.promise;
            },

            getCacheSizeInBytes: function(){
                return ImgCache.getCurrentSize();
            },

            clearCache : function() {
                var deferred = $q.defer();

                ImgCache.clearCache(deferred.resolve, deferred.reject);

                return deferred.promise;
            }

        };
    })
    .directive('imgCache', function () {
        return {
            restrict: 'A',
            link: function (scope, el, attrs) {

                var useCached = function (src) {
                    ImgCache.isCached(src, function (path, success) {
                        if (success) {
                            ImgCache.useCachedFile(el);
                        } else {
                            ImgCache.cacheFile(src, function () {
                                ImgCache.useCachedFile(el);
                            });
                        }
                    });

                };

                scope.$on('imgcache:ready', function() {
                    attrs.$observe('ngSrc', useCached);

                    useCached(attrs.ngSrc);
                });
            }
        };
    });