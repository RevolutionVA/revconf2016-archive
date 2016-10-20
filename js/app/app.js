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