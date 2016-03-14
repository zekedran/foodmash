'use strict';

angular.module('foodmashApp.controllers')

.controller('BodyController', ['$scope', '$location', 'toaster', 'CartService', 'City', '$rootScope', function($scope, $location, toaster, CartService, City, $rootScope){

		CartService.setCartGlobally();

		City.setCity().then(function(cities){
			if(cities.length > 0){
				$scope.cities = cities;
				$scope.selectedCity = cities[0];
				$rootScope.city = $scope.selectedCity;
				$scope.selectedArea = cities[0].areas[0];
				$rootScope.area = $scope.selectedArea;
			}else{
				$scope.cities = null;
			}
		}, function(err){
			$scope.cities = null;
		});

		$scope.selectCity = function(city){
			$scope.selectedCity = city;
			$rootScope.city = $scope.selectedCity;
		};

		$scope.selectArea = function(area){
			$scope.selectedArea = area;
			$rootScope.area = $scope.selectedArea;
		};

		$scope.setLoadCombos = function(){
			$scope.loadCombos = true;
		};

		$scope.checkIfSideBarPresent = function(){
			var current_path = $location.path();
			if(current_path == '/' || current_path == '/panel' || current_path == '/customerPanel' || current_path == '/restaurantPanel' || current_path == '/packagingCentrePanel'){
				return true;
			}else{
				return false;
			}
		};

		$scope.addBodyBackground = function(){
			var current_path = $location.path();
			if(current_path == '/'){
				return true;
			}else{
				return false;
			}
		};

		$scope.routeToCart = function(){
			$location.path("/cart");
		};

	 	$scope.routeToRoot = function(){
	 	 	$location.path("/");
	 	};

	 	$scope.routeToTermsAndConditions = function(){
	 		$location.path("/terms-and-conditions");
	 	};

	 	$scope.routeToPrivacyPolicy = function(){
	 		$location.path("/privacy-policy");
	 	};

	 	$scope.routeToRefundPolicy = function(){
	 		$location.path("/refund-policy");
	 	};

	 	$scope.routeToAboutUs = function(){
	 		$location.path("/about-us");
	 	};

 		$rootScope.addLoader = function(htmlElement,bgColor,color){
 	 		var bgString = "";
 	 		var colorString = "color:rgba(255,255,255,1)";

 	 		if(bgColor==='transparent') { bgString = ""; }
 	 		else if(bgColor==='white') { bgString = "background-color: rgba(255,255,255,0.975);"; }
 	 		else if(bgColor==='black') { bgString = "background-color: rgba(0,0,0,0.75);"; }

 	 		if(color === 'white') { colorString = "color:rgba(255,255,255,1);"; }
 	 		else if(color === 'black') { colorString = "color:rgba(0,0,0,1);"; }
 	 		else if(color === 'red')  { colorString = "color:rgba(255,10,0,1);"; }

 	 		var addLoaderDiv = "<div style='"+bgString+colorString+"z-index: 100;position: absolute;width: 100%;height: 100%;top: 0;bottom: 0;left: 0;right: 0;display: table;text-align:center;'><div style='display: table-cell;vertical-align: middle;'><i class='fa fa-circle-o-notch fa-spin'></i></div></div>";
	 		angular.element(document).ready(function(){
 	 			var div = $('' + htmlElement.toString());
 	 			div.prepend(addLoaderDiv);
 	 			div.css("position", "relative");
 	 			// div.hide();
 	 		});
 	 	};

 	 	$rootScope.removeLoader = function(htmlElement){
 	 		angular.element(document).ready(function (){ 
				$('' + htmlElement.toString()).each(function() { $(this).children().first().remove(); 
					// $(this).show(); 
				});
 	 		});
 	 	};

 	 	$rootScope.disableButton = function(htmlElement,textToDisplay){
 	 		if(textToDisplay === undefined) textToDisplay = "Loading..."; 
 	 		angular.element(document).ready(function(){
 	 			htmlElement = $('' + htmlElement.toString());
 	 			htmlElement.attr('disabled', 'disabled');
 	 			if(htmlElement.children('i.fa').length != 0){
 	 				htmlElement.children('i.fa').addClass('hidden-icon').hide();
 	 			}
 	 			htmlElement.html(function() { return $(this).html().replace(htmlElement.text(),"<span class='hidden-button-text'>"+htmlElement.text()+"</span>"); });
 	 			htmlElement.find('.hidden-button-text').hide();
 	 			htmlElement.prepend('<span class="loading-button-content-wrapper"><i class="fa fa-spin fa-circle-o-notch"></i>'+textToDisplay+'</span>');
 	 		});
 	 	};

 	 	$rootScope.enableButton = function(htmlElement){
 	 		angular.element(document).ready(function(){
 	 			htmlElement = $('' + htmlElement.toString());
 				htmlElement.removeAttr('disabled');
 				htmlElement.children('.loading-button-content-wrapper').remove();
 				if(htmlElement.children('.hidden-icon').length != 0){
 					htmlElement.children('.hidden-icon').show().removeClass('hidden-icon');
 				}
 				htmlElement.children('.hidden-button-text').after( function() {
 			  		return $(this).text();
 				}).remove();
 	 		});
		};
}]);

