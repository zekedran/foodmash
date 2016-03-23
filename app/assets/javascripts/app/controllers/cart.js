'use strict';

angular.module('foodmashApp.controllers')

.controller('CartController', ['$scope', '$q', 'toaster','$location','CartService','$rootScope', 'DeliveryAddress', 'Cart', 'Payment', '$http', '$httpParamSerializer', function($scope, $q, toaster, $location, CartService, $rootScope, DeliveryAddress, Cart, Payment, $http, $httpParamSerializer){

	$scope.cart = {};
	$scope.cart.delivery_charge = 0;
	$scope.delivery_addresses = [];
	$scope.delivery_address = new DeliveryAddress;
	$scope.loadingDeliveryAddresses = true;
	$scope.payment_method = "";
	if($rootScope.currentUser){
		setNameAndMobileNo();
		$scope.setup_details = {
			"email": $rootScope.currentUser.email,
			"productinfo": "a bunch of combos from Foodmash",
			"firstname": $rootScope.currentUser.name.split(" ")[0],
			"phone": $rootScope.currentUser.mobile_no,
			"surl": 'http://www.foodmash.in/web/payments/success',
			"furl": 'http://www.foodmash.in/web/payments/failure'
		};
	}

	CartService.getCartInfo().then(function(cart){
		$scope.cart = cart;
		calcTaxAndGrandTotal();
	}, function(cart){
		$scope.cart = cart;
	});

	$scope.load = function(){
	    angular.element(document).ready(function (){
	      new WOW().init();
	      $('[data-toggle="tooltip"]').tooltip();
	      $('[data-toggle="popover"]').popover();
	    });
	 };

	 if($rootScope.currentUser && !$rootScope.delivery_addresses && $rootScope.area && $rootScope.area.id){
 		DeliveryAddress.query({user_id: $rootScope.currentUser.id, area_id: $rootScope.area.id}).then(function(delivery_addresses){
 			if(delivery_addresses.length > 0){
 				$scope.delivery_addresses = delivery_addresses;
 				$rootScope.delivery_addresses = delivery_addresses;
 				setPrimaryAsDeliveryAddress();
 			}else{
 				$scope.delivery_addresses = new Array;
 				$scope.cart.delivery_address_id = null;
 				$rootScope.delivery_addresses = null;
 			}
 			$scope.loadingDeliveryAddresses = false;
 		}, function(err){
 			$scope.delivery_addresses = null;
 			$scope.loadingDeliveryAddresses = false;
 		});
	 }else{
	 	if($rootScope.delivery_addresses){
	 		$scope.delivery_addresses = $rootScope.delivery_addresses;
	 	}else{
	 		$scope.delivery_addresses = null;
	 	}
	 }

	$scope.isDeliveryAddressSelected = function(delivery_address){
		if($scope.cart.delivery_address_id == delivery_address.id){
			return true;
		}else{
			return false;
		}
	};

	$scope.selectDeliveryAddress = function(delivery_address){
		if($scope.cart.delivery_address_id != delivery_address.id){
			$scope.cart.delivery_address_id = delivery_address.id;
		}
	};

	$scope.setCod = function(){
		$scope.payment_method = 'COD';
	};

	$scope.setPayu = function(){
		$scope.payment_method = 'Payu';
	};

	$scope.proceedToPayment = function(){
		if($scope.cart.total == 0){
			toaster.pop('info', 'Cart is empty!');
			return ;
		}
		if(!$rootScope.currentUser){
			toaster.pop('info', 'Login to proceed to Payment');
			$location.path('/login');
			$rootScope.storeLocation = '/cart';
			return ;
		}
		if(!angular.isNumber($scope.cart.delivery_address_id) && $rootScope.currentUser){
			toaster.pop('info', 'Delivery Address needs to be selected!');
			return ;
		}
		if($scope.cart.total != 0 && angular.isNumber($scope.cart.delivery_address_id) && $rootScope.currentUser && $scope.payment_method == 'Payu'){
			$scope.setup_details["txnid"] = $scope.cart.order_id;
			$scope.setup_details.amount = $scope.cart.grand_total;
			Payment.getHash($scope.setup_details).then(function(response){
				$scope.setup_details.hash = response.hash;
				$scope.setup_details.key = response.key;
				$scope.setup_details.salt = response.salt;
				$scope.processCart();
				angular.element(document).ready(function (){
					$('#payu-payment-form').submit();
				});
			}, function(err){
				toaster.pop('error', 'Could not generate hash');
			});
		}if($scope.cart.total != 0 && angular.isNumber($scope.cart.delivery_address_id) && $rootScope.currentUser && $scope.payment_method == 'COD'){
			$rootScope.disableButton('.cod-button', 'Confirming...');
			Payment.purchaseForCod($scope.cart).then(function(response){
				toaster.pop('success', 'Cart was purchased!');
				$rootScope.enableButton('.cod-button');
				refreshCartAndSelectDelAdd();
			}, function(err){
				toaster.pop('error', 'Cart was not purchased!');
				$rootScope.enableButton('.cod-button');
			});
		}
	};

	$scope.applyPromoCode = function(promo_code){
		$scope.cart.user_id = $rootScope.currentUser.id;
		Payment.validatePromoCode(promo_code, $scope.cart).then(function(response){
			console.log(response);
			if(response.promo_discount){
				toaster.pop('success', 'A discount of ' + response.promo_discount + ' was applied to cart!');
			}else{
				toaster.pop('error', 'Failed to apply promo code!');
			}
			if(response.cart){
				$scope.cart.grand_total = response.cart.grand_total;
				$scope.cart.vat = response.cart.vat;
				$scope.cart.delivery_charge = response.cart.delivery_charge;
			}
		}, function(err){
			toaster.pop('error', 'Failed to apply promo code!');
			console.log(err);
		});
	};

	$scope.processCart = function(){
		var d = $q.defer();
		Cart.addToCart($scope.cart).then(function(cart){
			toaster.pop('success', 'Cart was submitted!');
			refreshCartAndSelectDelAdd();
			d.resolve(cart);
		}, function(err){
			toaster.pop('error', 'Cart was not submitted!');
			d.reject(err);
		});
		return d.promise;
	};

	$scope.addDeliveryAddress = function(){
		var d = $q.defer();
		$scope.delivery_address.area_id = $rootScope.area.id;
		$scope.delivery_address.save().then(function(response){
			toaster.pop('success', 'Delivery Address was created!');
			$scope.delivery_addresses.push($scope.delivery_address);
			$scope.delivery_address = new DeliveryAddress;
			$scope.reload();
			setNameAndMobileNo();
			d.resolve(response);
		}, function(err){
			toaster.pop('error', 'Delivery Address was not created!');
			d.reject(err);
		});
		return d.promise;
	};

	$scope.reload = function(){
		var d = $q.defer();
		DeliveryAddress.query({user_id: $rootScope.currentUser.id, area_id: $rootScope.area.id}).then(function(delivery_addresses){
		if(delivery_addresses.length > 0){
			$scope.delivery_addresses = delivery_addresses;
			$rootScope.delivery_addresses = delivery_addresses;
			setPrimaryAsDeliveryAddress();
			d.resolve(null);
		}else{
			$scope.delivery_addresses = new Array;
			$scope.cart.delivery_address_id = null;
			$rootScope.delivery_addresses = null;
			d.resolve(null);
		}
	}, function(err){
		$scope.delivery_addresses = null;
		d.reject(err);
	});
		return d.promise;
	};

	$scope.updateCartInfo = function(){
		var total = 0;
		$scope.cart.orders.filter(function(order){ 
			total += order.total * order.quantity;
		});
		$scope.cart.total = total;
		calcTaxAndGrandTotal();
	};

	function setNameAndMobileNo(){
		$scope.delivery_address.name = $rootScope.currentUser.name;
		$scope.delivery_address.contact_no = $rootScope.currentUser.mobile_no;
	};

	function refreshCartAndSelectDelAdd(){
		$location.path('/');
		CartService.refreshCart();
		setPrimaryAsDeliveryAddress();
	};

	function calcTaxAndGrandTotal(){
		$scope.cart.vat = $scope.cart.total * 0.02;
		if($scope.cart.total == 0){
			$scope.cart.delivery_charge = 0;
		}
		if($scope.cart.total){
			if($scope.cart.total < 200){
				$scope.cart.delivery_charge = 30;
				$scope.cart.grand_total = ($scope.cart.total + $scope.cart.vat + $scope.cart.delivery_charge).toFixed(2);
			}else{
				$scope.cart.delivery_charge = 40;
				$scope.cart.grand_total = ($scope.cart.total + $scope.cart.vat + $scope.cart.delivery_charge).toFixed(2);
			}
		}else{
			$scope.cart.grand_total = (0).toFixed(2);			
		}
	};

	function setPrimaryAsDeliveryAddress(){
		$scope.delivery_addresses.filter(function(delivery_address){
			if(delivery_address.primary == true && !angular.isNumber($scope.cart.delivery_address_id)){
				$scope.cart.delivery_address_id = delivery_address.id
			}
		});
	};

}]);