'use strict';

angular.module('foodmashApp.directives')

.directive('comboDishes', ['ComboDish', '$q', 'toaster', 'Dish', 'ComboService', function(ComboDish, $q, toaster, Dish, ComboService){

	return {

		restrict: 'A',

		templateUrl: '/templates/combo-dishes.html',

		controller: ['$scope', 'ComboDish', '$q', 'toaster', 'Dish', 'ComboService', function($scope, ComboDish, $q, toaster, Dish, ComboService){

			$scope.dish_types = [];
			$scope.restaurants = [];
			$scope.combo_dishes = [];
			$scope.combo_dish = new ComboDish;
			$scope.dishes = [];
			$scope.loadingDishes = true;

			ComboService.getRestaurantsForCombo($scope.combo.packaging_centre_id).then(function(restaurants){
				$scope.restaurants = restaurants;
			}, function(err){
				$scope.restaurants = null;
			});

			ComboService.getDishTypesForCombo().then(function(dish_types){
				$scope.dish_types = dish_types;
			}, function(err){
				$scope.dish_types = null;
			});

			$scope.$watch('combo', function(n, o){
				if(n.id){
					if($scope.combo.combo_dishes && $scope.combo.combo_dishes.length > 0){
						$scope.combo.combo_dishes.filter(function(cd){
							$scope.combo_dishes.push(new ComboDish(cd));
						});
					}else{
						$scope.combo_dishes = new Array;
					}
				}
			});

			$scope.selectRestaurant = function(restaurant){
				$scope.selectedRestaurant = restaurant;
				$scope.loadDishes($scope.selectedDishType.id || null, $scope.selectedRestaurant.id || null);
			};

			$scope.selectDishType = function(dish_type){
				$scope.selectedDishType = dish_type;
				$scope.combo_dish.dish_type_id = dish_type.id;
				$scope.loadDishes($scope.selectedDishType.id || null, $scope.selectedRestaurant.id || null);
			};

			$scope.selectDish = function(dish){
				$scope.selectedDish = dish;
				$scope.combo_dish.dish_id = dish.id;
			};

			$scope.loadDishes = function(dish_type_id, restaurant_id){
				var d = $q.defer();
					Dish.query({dish_type_id: dish_type_id, restaurant_id: restaurant_id}).then(function(dishes){
					if(dishes.length > 0){
						$scope.dishes = dishes;
						d.resolve(dishes);
					}else{
						$scope.dishes = null;
						d.resolve(null);
					}
				}, function(err){
					$scope.dishes = null;
					d.reject(err);
				});
				$scope.loadingDishes = false;
				return d.promise;
			};

			$scope.addComboDish = function(combo_id){
				var d = $q.defer();
				$scope.combo_dish.combo_id = combo_id;
				$scope.combo_dish.save().then(function(response){
					toaster.pop('success', 'Combo Dish was created!');
					$scope.combo_dishes.unshift($scope.combo_dish);
					$scope.combo_dish = new ComboDish;
					renewSelectedValues();
					d.resolve(response);
				}, function(err){
					toaster.pop('error', 'Combo Dish was not created!');
					d.reject(null);
				});
				return d.promise;
			};

			function renewSelectedValues(){
				$scope.combo_dish.dish_id = $scope.selectedDish.id;
				$scope.combo_dish.dish_type_id = $scope.selectedDishType.id;
			};

		}]

	};

}]);