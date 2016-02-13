'use strict';

angular.module('foodmashApp.controllers')

.controller('ComboDescriptionController', ['$scope', '$location', 'toaster', 'CartService', 'ComboService', function($scope, $location, toaster, CartService, ComboService){

	$scope.selectedDishes = [];
	$scope.combo = {};

	$scope.routeToRoot = function(){
		$location.path("/");
	};

	ComboService.getComboForDescription().then(function(combo){
		$scope.combo = combo;
		setQuantityForCombo();
	  	setQuantityForComboItems();
	  	pushDefaultComboOption($scope.combo);
	}, function(err){
		$scope.combo = null;
	});

	$scope.selectDish = function(combo, combo_option, dish){
		var selectedDish = {"product": {}, "item": {}};
		selectedDish["product"]["id"] = combo.id;
		selectedDish["category_id"] = combo_option.id;
		selectedDish["category_type"] = "ComboOption";
		selectedDish["item"]["id"] = parseInt(dish.id, 10);
		selectedDish["item"]["name"] = dish.name;
		selectedDish["item"]["description"] = dish.description;
		selectedDish["item"]["price"] = parseFloat(dish.price);
		selectedDish["added_at"] = Date.now();
		selectedDish["quantity"] = 1;
		checkAndPush(selectedDish)
	};

	$scope.removeSelectedDish = function(combo_option, combo_option_dish){
		if($scope.checkIfSelected(combo_option, combo_option_dish)){
			for(var i=0; i<$scope.selectedDishes.length; i++){
				if(combo_option.id == $scope.selectedDishes[i]["category_id"] && combo_option_dish.dish.id == $scope.selectedDishes[i]["item"]["id"]){
					$scope.selectedDishes[i]["quantity"] -= 1;
					if($scope.selectedDishes[i]["quantity"] == 0 && checkAndRemove($scope.combo, combo_option)){
						$scope.selectedDishes.splice(i, 1);
					}else{
						$scope.selectedDishes[i]["quantity"] = 1;
					}
				}
			}
		}
	};

	$scope.toggleDish = function(combo, combo_option, combo_option_dish){
		if($scope.checkIfSelected(combo_option, combo_option_dish)){
			for(var i=0; i<$scope.selectedDishes.length; i++){
				if(combo_option.id == $scope.selectedDishes[i]["category_id"] && combo_option_dish.dish.id == $scope.selectedDishes[i]["item"]["id"]){
					$scope.selectedDishes.splice(i, 1);
				}
			}
		}else{
			$scope.selectDish(combo, combo_option, combo_option_dish.dish);
		}
	};

	$scope.checkIfSelected = function(combo_option, combo_option_dish){
		for(var i=0; i<$scope.selectedDishes.length; i++){
			if(combo_option.id == $scope.selectedDishes[i]["category_id"] && combo_option_dish.dish.id == $scope.selectedDishes[i]["item"]["id"]){
				return true;
			}
		}
		return false;
	};

	$scope.showQuantityOfSelectedDish = function(combo_option, combo_option_dish){
		for(var i=0; i<$scope.selectedDishes.length; i++){
			if(combo_option.id == $scope.selectedDishes[i]["category_id"] && combo_option_dish.dish.id == $scope.selectedDishes[i]["item"]["id"]){
				return $scope.selectedDishes[i]["quantity"];
			}
		}
		return 0;
	};

	$scope.addCombo = function(combo){
		pushAllComboDishes(combo);
		CartService.addToCart(combo, $scope.selectedDishes);
		$scope.selectedDishes = [];
		setQuantityForCombo();
		setQuantityForComboItems();
		pushDefaultComboOption($scope.combo);
		toaster.pop('success', 'Added to cart!');
	};

	$scope.removeCombo = function(combo){
		CartService.removeFromCart(combo);
		if($scope.combo.quantity >= 1){
			$scope.combo.quantity -= 1;
		}
		toaster.pop('success', 'Removed from cart!');
	};

	$scope.addComboDish = function(combo_dish){
		$scope.combo.combo_dishes.filter(function(cdish){
			if(cdish.id == combo_dish.id){
				cdish.quantity += 1;
			}
		});
	};

	$scope.removeComboDish = function(combo_dish){
		$scope.combo.combo_dishes.filter(function(cdish){
			if(cdish.id == combo_dish.id && cdish.quantity > cdish.min_count){
				cdish.quantity -= 1;
			}
		});
	};

	function checkAndPush(selectedDish){
		for(var i = 0; i<$scope.selectedDishes.length; i++){
			if(selectedDish["product"]["id"] == $scope.selectedDishes[i]["product"]["id"] && selectedDish["category_id"] == $scope.selectedDishes[i]["category_id"] && selectedDish["category_type"] == $scope.selectedDishes[i]["category_type"] && selectedDish["item"]["id"] == $scope.selectedDishes[i]["item"]["id"]){
				$scope.selectedDishes[i]["quantity"] += 1;
				return ;
			}
		}
		$scope.selectedDishes.push(selectedDish);
	};

	function checkAndRemove(combo, combo_option){
		var count = 0;
		$scope.selectedDishes.filter(function(selectedDish){
			if(selectedDish["product"]["id"] == combo.id && selectedDish["category_id"] == combo_option.id){
				count += 1;
			}
		});
		if(count == combo_option.min_count){
			return false;
		}else if(count > 1){
			return true;
		}
	};

	function pushAllComboDishes(combo){
		if(combo.combo_dishes){
			for(var i=0; i<combo.combo_dishes.length; i++){
				var selectedDish = {"product": {}, "item": {}};
				selectedDish["product"]["id"] = combo.id;
				selectedDish["category_id"] = combo["combo_dishes"][i].id;
				selectedDish["category_type"] = "ComboDish";
				selectedDish["item"]["id"] = parseInt(combo["combo_dishes"][i].dish.id, 10);
				selectedDish["item"]["name"] = combo["combo_dishes"][i].dish.name;
				selectedDish["item"]["description"] = combo["combo_dishes"][i].dish.description;
				selectedDish["item"]["price"] = parseFloat(combo["combo_dishes"][i].dish.price);
				selectedDish["added_at"] = Date.now();
				selectedDish["quantity"] = combo["combo_dishes"][i].quantity;
				$scope.selectedDishes.push(selectedDish);
			}
		}
	};

	function pushDefaultComboOption(combo){
		if(combo.combo_options){
			for(var i=0; i<combo.combo_options.length; i++){
				var selectedDish = {"product": {}, "item": {}};
				selectedDish["product"]["id"] = combo.id;
				selectedDish["category_id"] = combo["combo_options"][i].id;
				selectedDish["category_type"] = "ComboOption";
				if(combo["combo_options"][i].combo_option_dishes.length > 0){
					selectedDish["item"]["id"] = parseInt(combo["combo_options"][i].combo_option_dishes[0].dish.id, 10);
					selectedDish["item"]["name"] = combo["combo_options"][i].combo_option_dishes[0].dish.name;
					selectedDish["item"]["description"] = combo["combo_options"][i].combo_option_dishes[0].dish.description;
					selectedDish["item"]["price"] = parseFloat(combo["combo_options"][i].combo_option_dishes[0].dish.price);
				}
				selectedDish["added_at"] = Date.now();
				selectedDish["quantity"] = combo["combo_options"][i].quantity;
				$scope.selectedDishes.push(selectedDish);
			}
		}
	};

	function setQuantityForCombo(){
		CartService.getCartInfo().then(function(cart){
			if($scope.combo){
				$scope.combo.quantity = 0;
				cart.orders.filter(function(order){
					if(order.product.id == $scope.combo.id){
						$scope.combo.quantity += order.quantity;
					}
				});
			}
		});
	};

	function setQuantityForComboItems(){
		if($scope.combo.combo_dishes && $scope.combo.combo_dishes.length > 0){
			for(var i=0;i<$scope.combo.combo_dishes.length;i++){
				$scope.combo.combo_dishes[i].quantity = $scope.combo.combo_dishes[i].min_count;
			}
		}

		if($scope.combo.combo_options && $scope.combo.combo_options.length > 0){
			for(var i=0;i<$scope.combo.combo_options.length;i++){
				$scope.combo.combo_options[i].quantity = $scope.combo.combo_options[i].min_count;
			}
		}
	};

}]);

