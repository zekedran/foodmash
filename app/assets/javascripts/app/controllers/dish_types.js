'use strict';

angular.module('foodmashApp.controllers')

.controller('DishTypesController', ['$scope','DishType','$q','toaster', function($scope, DishType, $q, toaster){
	$scope.dish_types = {};
	$scope.dish_type = new DishType;
	$scope.updatedDishType = new DishType;

	DishType.query().then(function(dish_types){
		if(dish_types.length > 0){
		  $scope.dish_types = dish_types;		
		}else{
		  $scope.dish_types = new Array;
		}
	}, function(err){
		$scope.dish_types = null;
	});

	$scope.setUpdate = function(dish_type){
		$scope.updatedDishType = angular.copy(dish_type);
	};

	$scope.updateDishType = function(dish_type, updateCross){
		var d = $q.defer();
		if(!updateCross){
			$scope.updatedDishType.update().then(function(response){
				toaster.pop('success', 'Dish Type was successfully updated!');
				var index = $scope.dish_types.indexOf(dish_type);
				if(angular.isNumber(index)){
					$scope.dish_types[index] = $scope.updatedDishType;
				}
				d.resolve(response);
			}, function(err){
				toaster.pop('error', 'Dish Type was not updated!');
				d.reject(err);
			});
		}
		return d.promise;
	};

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

	$scope.deleteDishType = function(dish_type){
		var d = $q.defer();
		dish_type.delete().then(function(response){
			$scope.dish_types.splice($scope.dish_types.indexOf(dish_type), 1);
			toaster.pop('success', 'Dish Type was succussfully deleted!');
			d.resolve(response);
		}, function(err){
			toaster.pop('error', 'Dish Type was not deleted!');
			d.reject(err);
		});
		return d.promise;
	};

}]);