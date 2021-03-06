'use strict';

angular.module('foodmashApp.directives')

.directive('comboDish', ['ComboDish', '$q', 'toaster', 'Dish', function(ComboDish, $q, toaster, Dish){

	return {

		restrict: 'A',

		templateUrl: '/templates/combo-dish.html',

		controller: ['$scope', 'ComboDish', '$q', 'toaster', 'Dish', function($scope, ComboDish, $q, toaster, Dish){

			$scope.updatedComboDish = new ComboDish;	
			$scope.dishes_for_update = [];
			$scope.loadingDishesForUpdate = true;

			$scope.selectRestaurantForUpdate = function(restaurant){
				$scope.selectedRestaurantForUpdate = restaurant;
				$scope.loadDishesForUpdate($scope.selectedDishTypeForUpdate.id || null, $scope.selectedRestaurantForUpdate.id || null);
			};

			$scope.selectDishTypeForUpdate = function(dish_type){
				$scope.selectedDishTypeForUpdate = dish_type;
				$scope.updatedComboDish.dish_type_id = dish_type.id;
				$scope.loadDishesForUpdate($scope.selectedDishTypeForUpdate.id || null, $scope.selectedRestaurantForUpdate.id || null);
			};

			$scope.selectDishForUpdate = function(dish){
				$scope.selectedDishForUpdate = dish;
				$scope.updatedComboDish.dish_id = dish.id;
			};

			$scope.setUpdate = function(combo_dish){
				$scope.updatedComboDish = angular.copy(combo_dish);
			};

			$scope.loadDishesForUpdate = function(dish_type_id, restaurant_id){
				var d = $q.defer();
				Dish.query({dish_type_id: dish_type_id, restaurant_id: restaurant_id}).then(function(dishes_for_update){
				if(dishes_for_update.length > 0){
					$scope.dishes_for_update = dishes_for_update;
					d.resolve(dishes_for_update);
				}else{
					$scope.dishes_for_update = null;
					d.resolve(null);
				}
				}, function(err){
					$scope.dishes_for_update = null;
					d.reject(err);
				});
				$scope.loadingDishesForUpdate = false;
				return d.promise;
			};
			

			$scope.updateComboDish = function(combo_dish, comboDishUpdateCross){
				var d = $q.defer();
				$scope.updatedComboDish.update().then(function(response){
					toaster.pop('success', 'Combo Dish was updated!');
					var index = $scope.combo_dishes.indexOf(combo_dish);
					if(angular.isNumber(index) && index >= 0){
						$scope.combo_dishes[index] = $scope.updatedComboDish;
					}
					d.resolve(response);
				}, function(err){
					toaster.pop('Combo Dish was not updated!');
					d.reject(err);
				});
				return d.promise;
			};

			$scope.deleteComboDish = function(combo_dish){
				var d = $q.defer();
				combo_dish.delete().then(function(response){
					toaster.pop('success', 'Combo Dish was deleted!');
					$scope.combo_dishes.splice($scope.combo_dishes.indexOf(combo_dish), 1);
					d.resolve(response);
				}, function(err){
					toaster.pop('error', 'Combo Dish was not deleted!');
					d.reject(err);
				});
				return d.promise;
			};

		}]

	};

}]);