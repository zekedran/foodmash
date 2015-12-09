'use strict';

angular.module('foodmashApp.interceptors', [])

.factory('UserAuthInterceptor',
   ['$rootScope', '$q', 'AuthService', function($rootScope, $q, AuthService) {

     return {

       'request': function(req) {
         var d = $q.defer();
         AuthService.currentUser().then(function(user) {
           if(user && req.url != "https://s3-ap-southeast-1.amazonaws.com/foodmash/" && req.url != "https://test.payu.in/_payment/"){
             req.params = req.params || {};
             req.params['auth_token'] = req.params['auth_token'] || user.auth_token;
             req.params['auth_user_token'] = req.params['auth_user_token'] || user.user_token;
             d.resolve(req);
           } else {
             d.resolve(req);
           }
         });
         return d.promise;
         
       },

       'requestError': function(reqErr) { 
         return reqErr;
       } 
     };

   }]);

