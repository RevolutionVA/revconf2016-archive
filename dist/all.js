/*!
 * IE10 viewport hack for Surface/desktop Windows 8 bug
 * Copyright 2014-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

// See the Getting Started docs for more information:
// http://getbootstrap.com/getting-started/#support-ie10-width

(function () {
  'use strict';

  if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement('style');
    msViewportStyle.appendChild(
      document.createTextNode(
        '@-ms-viewport{width:auto!important}'
      )
    );
    document.head.appendChild(msViewportStyle);
  }

})();

/* global jQuery */
var RevConfModule = angular.module("RevConfModule", ['ui.router', 'ngSanitize']);

(function ($) {

    RevConfModule

        .run(['$rootScope', '$state', 'wpApiService', '$timeout', '$location', 
        function ($rootScope, $state, wpApiService, $timeout, $location) {
            
            $rootScope.state = $state;

            window.$rootScope = $rootScope;

            $rootScope.loaded = false;
            var haltedState = null;

            wpApiService.init().then(function () {
                $rootScope.loaded = true;
                onDocLoaded(function(){
                    $('body').removeClass('loading');
                });
                
                haltedState = haltedState || { toStateName: 'home', toParams: {} };
                $state.go(haltedState.toStateName, haltedState.toParams);
            });

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

                if (toState.name !== 'loading' && !$rootScope.loaded) {
                    event.preventDefault();
                    haltedState = { toStateName: toState.name, toParams: toParams, hash: window.location.hash };
                    $state.go('loading');
                }
                
                
                
                $('[data-section-id]').removeClass('active');
            });
            
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, options) {

                if (toState.name !== 'loading' && haltedState) {
                    if(haltedState.hash)
                        $location.hash(haltedState.hash.substring(1));
                    haltedState = null;
                }
            });

        }])

        .config(['$locationProvider', '$stateProvider', '$urlRouterProvider', '$httpProvider', 
        function ($locationProvider, $stateProvider, $urlRouterProvider, $httpProvider) {

            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

            $locationProvider.html5Mode(true);

            $urlRouterProvider.when('', '/home');
            $urlRouterProvider.otherwise('/home');

            $stateProvider
                .state('loading', {
                    url: '/loading',
                    title: 'loading',
                    views: {
                        'main@': {
                            template: ''
                        }
                    }
                })
                .state('about', {
                    url: '/about',
                    title: 'About',
                    views: {
                        'main@': {
                            templateUrl: '/templates/about.html',
                            controllerAs: 'vm',
                            controller: 'aboutController'
                        }
                    }
                })
                .state('schedule', {
                    url: '/schedule',
                    title: 'Schedule',
                    views: {
                        'main@': {
                            templateUrl: '/templates/schedule.html',
                            controllerAs: 'vm',
                            controller: 'scheduleController'
                        }
                    }
                })
                .state('home', {
                    url: '/home',
                    title: 'Home',
                    params: {
                        section: 'intro'
                    },
                    views: {
                        'main@': {
                            templateUrl: '/templates/home.html',
                            controllerAs: 'vm',
                            controller: 'homeController'
                        }
                    }
                })
                .state('default', {
                    url: '/{path:.+}',
                    title: 'loading',
                    views: {
                        'main@': {
                            controllerAs: 'vm',
                            controller: 'defaultController',
                            templateUrl: '/templates/default.html'
                        }
                    }
                })
        }])

        .directive('outboundTrack', function () {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    element.on('click', function () {
                        event.preventDefault();
                        var url = this.href;
                        ga('send', 'event', 'outbound', 'click', url, {
                            'transport': 'beacon'
                        });
                        window.open(url);
                    });
                }
            }
        })

        .directive('contributor', function () {
            return {
                restrict: 'E',
                templateUrl: '/templates/contributor.html'
            }
        })

        .directive('contributorDetails', ['wpApiService', '$rootScope', '$timeout', function (wpApiService, $rootScope, $timeout) {
            $('#contributor-modal').on('hidden.bs.modal', function (event) {
                $timeout(function () { $rootScope.contributor = false; });
            });
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.on('click', 'a', function (event) {
                        event.stopPropagation();
                    });
                    element.on('click', function (event) {
                        var contributor_id = parseInt(attrs['contributorDetails']);
                        $timeout(function () {
                            $rootScope.contributor = wpApiService.getContributor(contributor_id);
                        });
                        $('#contributor-modal').modal({ 'show': true });
                    })
                }
            }
        }])

        .directive('sponsor', ['wpApiService', '$rootScope', '$timeout', function (wpApiService, $rootScope, $timeout) {
            return {
                restrict: 'E',
                templateUrl: 'templates/sponsor.html',
                link: function (scope, element) {
                }
            }
        }])

        ;

    $(document)
        .on('click', 'a[data-no-bubble]', function (event) {
            event.stopPropagation();
        }).on('click', '[data-section-id] a', function (event) {
            $('.navbar-toggler:visible').trigger('click');
        });

})(jQuery);

function onDocLoaded(callback, params) {
    var docLoadInterval = setInterval(function () {

        if (document.readyState !== 'complete')
            return;

        clearInterval(docLoadInterval);

        callback(params);

    }, 100);
}

var shuffleArray = function (array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

function googleAuthInit(initCallback) {
    
    var auth2; // The Sign-In object.
    var googleAuth = this;
    googleAuth.User; // The current user.
    
    var userChangedCallback = function(){};
    
    gapi.load('auth2', function () {
        
        auth2 = gapi.auth2.init({
            client_id: '865035679015-c7n7s2oq7j0tn3kh7m8hihl86p0kj0qr.apps.googleusercontent.com',
            scope: 'email'
        });
        
        googleAuth.userChanged = function(callback){
            if('function' === typeof callback)
                userChangedCallback = callback;
        }
        
        googleAuth.signOut = function(){
            auth2.disconnect();
        }
        
        googleAuth.signIn = function(){
            auth2.signIn();
        }
        
        auth2.isSignedIn.listen(function(value){
            value;
        });

        auth2.currentUser.listen(function (user) {
            googleAuth.User = user;
            userChangedCallback();
        });

        if (auth2.isSignedIn.get() == true) {
            auth2.signIn();
        }
        
        if (auth2) {
            googleAuth.User = auth2.currentUser.get();
            userChangedCallback();
        }
        
        if('function' === typeof initCallback)
            initCallback();
        
    });
    
    return googleAuth;
    
}
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
(function ($) {

    RevConfModule
        .controller('scheduleController', ['$rootScope', '$scope', 'wpApiService', '$timeout', 
        function ($rootScope, $scope, wpApiService, $timeout) {

            var vm = this;

            vm.Favorites = {};
            
            $rootScope.title = 'RevolutionConf 2016';

            vm.GoogleAuth = new googleAuthInit(function(){
               
                var userChanged = function(){
                    
                    $timeout(function(){
                        
                        if(vm.GoogleAuth.User.isSignedIn())
                        {
                            vm.Save.Server = true;
                            vm.Save.User = {
                                id_token : vm.GoogleAuth.User.getAuthResponse().id_token,
                                email : vm.GoogleAuth.User.getBasicProfile().getEmail()
                            };
                            vm.Save.pullFromServer(function(){
                                vm.Save.pushToServer();
                            });
                        }
                        else
                        {
                            vm.Save.Server = false;
                        }
                        
                    }, 1);
                };
                
                vm.GoogleAuth.userChanged(userChanged); 
                
                userChanged();
                
            });

            vm.Save = {
                User : {
                    id_token : null,
                    email : null
                },
                Server : false,
                Active : false,
                methodSwitch : function(){
                    if(vm.Save.Active) return;
                    
                    if(vm.Save.Server)
                    {
                        vm.GoogleAuth.signOut();
                    }
                    else
                    {
                        vm.GoogleAuth.signIn();
                    }
                },
                Timeout : null,
                pushToServer : function(callback){
                    
                    callback = 'function' === typeof callback ? callback : function(){};
                    
                    if(!vm.Save.Server) return;
                    
                    if(vm.Save.Timeout)
                        $timeout.cancel(vm.Save.Timeout);
                    
                    vm.Save.Timeout = $timeout(function(){
                        vm.Save.Active = true;
                        wpApiService.saveUserSchedule({
                            id_token: vm.Save.User.id_token,
                            filter : vm.filter,
                            favoriteItems : vm.favoriteItems
                        }).then(function(){
                            callback();
                            vm.Save.Active = false;
                        });
                    }, 2000);
                },
                pullFromServer : function(callback){
                    
                    callback = 'function' === typeof callback ? callback : function(){};
                    
                    wpApiService.getUserSchedule({id_token : vm.Save.User.id_token}).then(function(response){
                        $timeout(function(){
                            
                            if(response && response.filter) vm.filter = response.filter;
                            if(response && response.favoriteItems) vm.favoriteItems = response.favoriteItems;
                            
                            callback();
                        },1);
                    });
                }
            };

            vm.filter = localStorage.getItem("schedule-filter") ? JSON.parse(localStorage.getItem("schedule-filter")) : {
                favs: false,
                room: '',
                search: ''
            };

            vm.filterUpdated = function () {
                localStorage.setItem("schedule-filter", JSON.stringify(vm.filter));
                vm.Save.pushToServer();
            }

            vm.favoriteItems = localStorage.getItem("schedule-favorites") ? JSON.parse(localStorage.getItem("schedule-favorites")) : {};

            vm.favoriteItemsUpdated = function (item) {
                localStorage.setItem("schedule-favorites", JSON.stringify(vm.favoriteItems));
                vm.Save.pushToServer();
            }

            vm.filterEvents = function (event) {

                var hide = false;

                if (!hide && vm.filter.favs && !vm.favoriteItems[event.ID]) {
                    hide = true;
                }

                if (!hide && vm.filter.room && event.room !== vm.filter.room) {
                    hide = true;
                }

                if (!hide && vm.filter.search) {
                    hide = event.searchBlob.indexOf(vm.filter.search.toLowerCase()) === -1;
                }

                return !hide;
            }

            vm.Schedule = wpApiService.getSchedule();

            vm.Schedule = $.map(vm.Schedule, function (timeslot) {

                timeslot.eventIds = $.map(timeslot.items, function (item) {
                    return item.ID;
                });

                timeslot.items = $.map(timeslot.items, function (event) {

                    event.searchBlob = event.speaker ? $(['<div>', event.title, event.description, event.speaker.name, event.speaker.title, event.speaker.company_name, '</div>'].join(' ')).text().toLowerCase() : '';

                    return event;
                });

                timeslot.eventIds = timeslot.eventIds.length > 1 ? timeslot.eventIds : false;

                return timeslot;
            });

            vm.timeslotHasFavs = function (timeslot) {
                if (!timeslot.eventIds) return false;
                return timeslot.eventIds.filter(function (id) {
                    return vm.Favorites[id];
                }).length;
            }

            vm.favSession = function (idSelected, idGroup) {

                $.each(idGroup, function (key, id) {
                    if (idSelected != id)
                        delete vm.Favorites[id];
                });
                vm.Favorites[idSelected] = !vm.Favorites[idSelected];
            }
            
            vm.Speakers = shuffleArray(wpApiService.getSpeakers());

        }]);

})(jQuery);
/* global angular */
/* global $ */
/* global RevConfModule */
(function() {

    RevConfModule
        .service('wpApiService', ['$http', '$q', '$sce', '$rootScope', 
        function($http, $q, $sce, $rootScope) {

            function getItems(response) {
                return response.data.items;
            }

            var rawData = {
                sponsors: { items: [], ids: [] },
                sponsor_levels: { items: [], ids: [] },
                tickets: { items: [], ids: [] },
                sessions: { items: [], ids: [] },
                general: { content: {} },
                contributors: { items: [], ids: [] },
                schedule: [],
            };

            var apiUrl = '/api';

            $rootScope.appInitiated = false;

            function getItemByID(id, type) {
                var idIndex = rawData[type].ids.indexOf(id);
                return rawData[type].items[idIndex];
            }

            function Speaker(speaker) {
                return $.extend(speaker, {
                    sessions: $.grep(rawData.sessions.items, function(session) {
                        return session.speaker == speaker.ID;
                    })
                });
            }

            function Session(session) {
                return $.extend(session, {
                    speaker: getItemByID(session.speaker, 'contributors')
                });
            }

            return {
                getContributor: function(id) {
                    return getItemByID(id, 'contributors');
                },
                getContent: function() {
                    return rawData.content
                },
                getPage: function(slug) {
                    var page = $.grep(rawData.pages, function(page){
                        return page.slug === slug;
                    });
                    return page.length ? page[0] : null;
                },
                getSpeakers: function() {
                    var speakers = $.grep(rawData.contributors.items, function(contributor) {
                        return contributor.role === "Speaker";
                    });
                    speakers = $.map(speakers, function(speaker) { return new Speaker(speaker); });
                    return speakers;
                },
                getKeynoteSpeaker: function() {
                    return $.grep(rawData.contributors.items, function(contributor) { return contributor.role === "Keynote Speaker"; })[0];
                },
                getAdvisors: function() {
                    return $.grep(rawData.contributors.items, function(contributor) { return contributor.role === "Advisor"; });
                },
                getVolunteers: function() {
                    return $.grep(rawData.contributors.items, function(contributor) { return contributor.role === "Volunteer"; });
                },
                getOrganizers: function() {
                    return $.grep(rawData.contributors.items, function(contributor) { return contributor.role === "Organizer"; });
                },
                getSessions: function() {
                    return $.map(rawData.sessions.items, function(session) {
                        return new Session(session);
                    });
                },
                getSessionsBySpeaker: function(speaker_id) {
                    return $.grep(rawData.sessions.items, function(session) {
                        return session.speaker == speaker_id;
                    });
                },
                getSponsors: function() {
                    return rawData.sponsors.items;
                },
                getTickets: function() {
                    return $.map(rawData.tickets.items, function(ticket) {
                        ticket.available = ticket.availability === 'available';
                        return ticket;
                    });
                },
                getSchedule: function() {
                    return $.map(rawData.schedule, function(timeslot) {
                        timeslot.items = $.map(timeslot.items, function(event){
                            if(event.speaker)
                                event = new Session(event);
                            return event;
                        });
                        return timeslot;
                    });
                },
                init: function() {
                    return $q.all([
                        $http.get(apiUrl + '/sponsors.json'),
                        $http.get(apiUrl + '/sponsor-levels.json'),
                        $http.get(apiUrl + '/tickets.json'),
                        $http.get(apiUrl + '/sessions.json'),
                        $http.get(apiUrl + '/general.json'),
                        $http.get(apiUrl + '/contributors.json'),
                        $http.get(apiUrl + '/schedule.json')
                    ]).then(function(responses) {
                        rawData.sponsors = responses[0].data;
                        rawData.sponsor_levels = responses[1].data;
                        rawData.tickets = responses[2].data;
                        rawData.sessions = responses[3].data;
                        rawData.content = responses[4].data.data.content;
                        rawData.pages = responses[4].data.data.pages;
                        rawData.contributors = responses[5].data;
                        rawData.schedule = responses[6].data.data;
                    });
                },
                saveUserSchedule : function(data){
                    /*
                    return $http.post(apiUrl + '/wp-admin/admin-ajax.php?action=user_schedule&type=save', data)
                        .then(function(response){
                            return response.data.data;
                        });
                    */
                },
                getUserSchedule : function(data){
                    /*
                    return $http.post(apiUrl + '/wp-admin/admin-ajax.php?action=user_schedule&type=get', data)
                        .then(function(response){
                            return response.data.data;
                        });
                    */
                }
            }

        }]);

})();