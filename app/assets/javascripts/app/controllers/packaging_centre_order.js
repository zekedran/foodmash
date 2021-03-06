'use strict';

angular.module('foodmashApp.controllers')

.controller('PackagingCentreOrderController', ['$scope','$interval','$location','toaster','$rootScope', 'PackagingCentre', '$filter', 'PackagingPanelService', '$q', 'Cart', function($scope, $interval, $location, toaster, $rootScope, PackagingCentre, $filter, PackagingPanelService, $q, Cart){

	$scope.cart = {};
	$scope.selectedStatus = {};
	$scope.next_status = {};
    $scope.elapsedTime = null;
    $scope.timer = null;
	$scope.packaging_centre_orders = [];
    $scope.packagingOrderOptions = PackagingPanelService.getPackagingPanelOptions();

	$scope.statuses = PackagingPanelService.getPackagingPanelStatuses();

	PackagingPanelService.getPackagingCentreOrder().then(function(cart){
		$scope.cart = cart;
        findNextStatus($scope.cart.aasm_state);
        aggregatePackagingCentreOrders();
        if(cart.aasm_state != 'delivered'){
        	findElapsedTime(new Date());
            $scope.timer = $interval(function(){ findElapsedTime(new Date()) }, 1000);
        }else{
        	findElapsedTime(new Date(cart.delivered_at));
        }
    }, function(err){
		$scope.cart = null;
	});

	$scope.routeToPackagingCentrePanelOrder = function(cart){
		PackagingPanelService.setCartForOrderPage(cart);
		$location.path('/packagingCentrePanel/Order');
	};

	$scope.load = function(){
	    angular.element(document).ready(function (){
	      new WOW().init();
	      $('[data-toggle="tooltip"]').tooltip();
	      $('[data-toggle="popover"]').popover();
	    });
	 };

	 $scope.selectOption = function(option){
	 	$scope.selectedOption = option;
	 	switch(option.name){
	 		case 'Current': 
	 		if($scope.loadedCarts){
	 			var deliveredCarts = $filter('filter')($scope.loadedCarts, {aasm_state: 'delivered'}, true);
	 			$scope.carts = $scope.loadedCarts;
	 			deliveredCarts.filter(function(cart){
	 				var index = $scope.carts.indexOf(cart);
	 				$scope.carts.splice(index, 1);
	 			});
	 		}
	 		break;
	 		case 'Delivered': 
	 		if($scope.loadedCarts){
	 			$scope.carts = $filter('filter')($scope.loadedCarts, {aasm_state: 'delivered'}, true);
	 		}
	 		break;
	 	};
	 };

	 $scope.checkIfSelected = function(option){
	 	if(option == $scope.selectedOption){
	 		return true;
	 	}
	 	return false;
	 };

	$scope.checkIfCompleted = function(status){
		if($scope.statuses.indexOf(status) <= $scope.statuses.indexOf(getSuitableStatus($scope.cart.aasm_state))){
			return true;
		}
		return false;
	};

	$scope.getStatusIcon = function(status){
		var icon_class = '';
		$scope.statuses.filter(function(s){
			if(s.name == status){
				icon_class = 'fa fa-fw ' + s.icon_class.split(" ")[1];
				return icon_class;
			}
		});
		return icon_class;
	};

	$scope.getStatusPercent = function(status){
		var percent = '';
		$scope.statuses.filter(function(s){
			if(s.name == status){
				percent = s.percent;
				return percent;
			}
		});
		return percent;
	};

	$scope.getStatusAlias = function(status){
		var alias = '';
		$scope.statuses.filter(function(s){
			if(s.name == status){
				alias = s.alias;
				return alias;
			}
		});
		return alias;
	};

	$scope.updateStatus = function(){
		var d = $q.defer();
		$rootScope.disableButton('.order-status-update-button');
		Cart.changeStatus($scope.next_status.name, $scope.cart.id).then(function(cart){
			toaster.pop('success', 'Cart status was successfully updated!');
			$scope.cart = cart;
			PackagingPanelService.setUpdatedCart(cart);
			$rootScope.enableButton('.order-status-update-button');
			findNextStatus($scope.cart.aasm_state);
       		$scope.killTimer(cart);
			d.resolve(cart);
		}, function(err){
			toaster.pop('error', 'Cart status was not updated!');
			$rootScope.enableButton('.order-status-update-button');
			d.reject(err);
		});
		return d.promise;
	};

	$scope.cancelStatus = function(){
		var d = $q.defer();
		if(confirm('Are you sure ?')){
			$rootScope.disableButton('.order-status-cancel-button');
			Cart.changeStatus('cancel', $scope.cart.id).then(function(cart){
				toaster.pop('success', 'Cart was successfully cancelled!');
				$scope.cart = cart;
				PackagingPanelService.setUpdatedCart(cart);
				$rootScope.enableButton('.order-status-cancel-button');
	       		$scope.killTimer(cart);
				d.resolve(cart);
			}, function(err){
				toaster.pop('error', 'Cart was not cancelled!');
				$rootScope.enableButton('.order-status-cancel-button');
				d.reject(err);
			});
		}
		return d.promise;
	};

    $scope.killTimer = function(cart){
        if($scope.timer != null && (cart.aasm_state == 'delivered' || cart.aasm_state == 'not_started')) {
            $interval.cancel($scope.timer);
            $scope.timer=null;
            findElapsedTime(new Date(cart.delivered_at));
        }
    };

    $scope.calculatePorderPrice = function(pOrders){
    	var total = 0;
    	pOrders.filter(function(pOrder){
    		total += pOrder.quantity * pOrder.item.price
    	});
    	return total
    }

	function findNextStatus(cart_status){
		$scope.statuses.filter(function(status){
			if(status.name == cart_status){
				var index = $scope.statuses.indexOf(status);
				$scope.next_status = $scope.statuses[index + 1];
			}
		});
	};

	function getSuitableStatus(status){
		var get_status  = {};
		$scope.statuses.filter(function(s){
			if(s.name == status){
				get_status = s;
			}
		});
		return get_status;
	};

	function aggregatePackagingCentreOrders(){
		if($scope.cart && $scope.cart.orders && $scope.cart.orders.length > 0){
			$scope.cart.orders.filter(function(order){
				order.order_items.filter(function(order_item){
					var old_quantity = order_item.quantity;
					order_item.quantity = order.quantity * order_item.quantity;
					$scope.packaging_centre_orders.push(angular.copy(order_item));
					order_item.quantity = old_quantity;
				});
			});
		}
	};

    function findElapsedTime(time){
        var now = time;
        var purchased_at = new Date($scope.cart.purchased_at);
        var diff = Math.abs(now.getTime() - purchased_at.getTime())/1000;
        var diffSecs = Math.floor(diff % 60);
        var diffMins = Math.floor(diff / 60);
        var diffHours = Math.floor(diffMins / 60);
        if(parseInt(diffMins)>0){
            diffHours = Math.floor(diffMins / 60);
            diffMins = diffMins % 60;
            diffHours = (diffHours < 10) ? "0" + diffHours : diffHours;
        }
        diffHours = (diffHours < 10) ? "" + diffHours : diffHours;
        diffMins = (diffMins < 10) ? "0" + diffMins : diffMins;
        diffSecs = (diffSecs < 10) ? "0" + diffSecs : diffSecs;
        $scope.elapsedTime = ((diff==undefined)?"":(diffHours+":"))+diffMins + ":" + diffSecs;
    };

}]);