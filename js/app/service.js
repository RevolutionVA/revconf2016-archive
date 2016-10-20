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