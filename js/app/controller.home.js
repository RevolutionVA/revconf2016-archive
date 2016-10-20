/* global shuffleArray */
/* global RevConfModule */

function SortByTitle(a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
}

RevConfModule
    .controller('homeController', ['$rootScope', '$scope', 'wpApiService', function ($rootScope, $scope, wpApiService) {
        
        var vm = this;
        $rootScope.title = 'RevolutionConf 2016';
        vm.Tickets = wpApiService.getTickets();
        vm.Organizers = wpApiService.getOrganizers();
        vm.Speakers = shuffleArray(wpApiService.getSpeakers());
        vm.KeynoteSpeaker = wpApiService.getKeynoteSpeaker();
        vm.Sessions = wpApiService.getSessions();
        vm.Sessions.sort(SortByTitle);
        vm.Content = wpApiService.getContent();
        vm.Sponsors = wpApiService.getSponsors();

        onDocLoaded(function scrollNavInit() {
            
            var links = $('[data-section-id]'),
                sections = [],
                current = '',
                scrollTimeout = null;

            links.each(function () {
                var section_link = $(this), section_id = section_link.data('section-id');
                sections.push({
                    id: section_id,
                    link: section_link,
                    position: $('#' + section_id),
                    container: $('#' + section_id).parent()
                })
            });

            if (window.location.hash) {
                $(sections).each(function (i, section) {
                    if (window.location.hash === '#' + section.id) {
                        $('html, body').scrollTop(section.position.offset().top);
                        return false;
                    }
                });
            }
            
            function scrollTimeoutSetup(){
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(updateNavigation, 100);
            }

            $(document).on('scroll', scrollTimeoutSetup);

            $scope.$on('$destroy', function(){
                $(document).off('scroll', scrollTimeoutSetup);
            });

            function updateNavigation() {
                var scrollTop = $('body').scrollTop();

                $(sections).each(function (i, section) {
                    var top = section.position.offset().top;
                    if (scrollTop >= top && scrollTop <= (top + section.container.height())) {
                        if (current != section.id) {
                            links.removeClass('active');
                            section.link.addClass('active');
                        }
                        current = section.id;
                        return false;
                    }
                });
            }

            updateNavigation();
        });

    }])
    .directive('signUpForm', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {

                var form_is_valid = false;

                $(element).on('submit', function (event) {
                    var
                        fieldName = $('[name="fullname"]', element),
                        fieldEmail = $('[name="email"]', element);

                    event.preventDefault();

                    if (form_is_valid)
                        return true;

                    $('.has-danger', element).removeClass('has-danger');

                    if (!fieldName.val().length) {
                        fieldName.closest('.form-group').addClass('has-danger');
                    }

                    if (!fieldEmail.val().length || !validateEmail(fieldEmail.val())) {
                        fieldEmail.closest('.form-group').addClass('has-danger');
                    }

                    if (!$('.has-danger', element).length) {
                        form_is_valid = true;
                        $('.form-group', element).hide();
                        $('.text-success', element).show();
                        setTimeout(function () {
                            //$(element).submit();
                        }, 1000);
                    }

                    if (!form_is_valid)
                        return false;
                });

                function validateEmail(email) {
                    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                }
            }
        };
    });