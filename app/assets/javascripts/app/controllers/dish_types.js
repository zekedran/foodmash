'use strict';

angular.module('foodmashApp.controllers')

.controller('DishTypesController', ['$scope','DishType','$q','toaster', function($scope, DishType, $q, toaster){
	$scope.dish_types = {};
	$scope.dish_type = new DishType;
	$scope.loadingDishTypes = true;

	DishType.query().then(function(dish_types){
		if(dish_types.length > 0){
		  $scope.dish_types = dish_types;		
		}else{
		  $scope.dish_types = new Array;
		}
		$scope.loadingDishTypes = false;
	}, function(err){
		$scope.dish_types = null;
		$scope.loadingDishTypes = false;
	});

	$scope.addDishType = function(addCross){
		if(!addCross){
			if(!$scope.addDishTypeForm.$pristine){
				$scope.dish_type.save().then(function(result){
					toaster.pop('success', 'A new Dish Type was created!');
					$scope.dish_types.unshift($scope.dish_type);
					$scope.dish_type = new DishType;
				}, function(err){
					toaster.pop('error', 'Failed to create new Dish Type');
				});
			}
		}else{
			$scope.dish_type = new DishType;
			d.resolve(null);
		}
	};

}]);