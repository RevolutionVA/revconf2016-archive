(function ($) {

    RevConfModule
        .controller('aboutController', ['$rootScope', '$scope', 'wpApiService', function ($rootScope, $scope, wpApiService) {

            var vm = this;

            $rootScope.title = 'RevolutionConf 2016';

            vm.Organizers = wpApiService.getOrganizers();
            
            vm.Advisors = shuffleArray(wpApiService.getAdvisors());
            
            vm.Volunteers = shuffleArray(wpApiService.getVolunteers());
            
            vm.Content = wpApiService.getContent();
            
        }]);

})(jQuery);