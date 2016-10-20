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