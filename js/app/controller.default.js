(function ($) {

    RevConfModule
        .controller('defaultController', 
        ['$rootScope', '$scope', 'wpApiService', '$location', 
        function ($rootScope, $scope, wpApiService, $location) {

            var vm = this;

            vm.page = wpApiService.getPage($location.path().split('/')[1]) || {
                title : '404 - Page not Found',
                content : '<p>Page not found, sorry.</p>'
            };

            $rootScope.title = vm.page.title;
            
        }]);

})(jQuery);