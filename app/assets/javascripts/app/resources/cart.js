'user strict';

angular.module('foodmashApp.resources')

.factory('Cart', ['railsResourceFactory', '$q', function(railsResourceFactory, $q){
	var resource = railsResourceFactory({
		url: '/web/carts',
		name: 'cart'
	});

	resource.addToCart = function(cart){
		var self = this;
		var d = $q.defer();
		resource.$post(self.$url('addToCart'), {cart: cart}).then(function(response){
			d.resolve(response);
		}, function(err){
			d.reject(err);
		});
		return d.promise;
	};

	resource.show = function(){
		var self = this;
		var d = $q.defer();
		resource.$get(self.$url('show')).then(function(response){
			d.resolve(response);
		}, function(err){
			d.reject(err);
		});
		return d.promise;
	};

	resource.changeStatus = function(status, cart_id){
		var self = this;
		var d = $q.defer();
		resource.$post(self.$url('changeStatus'), {status: status, id: cart_id}).then(function(response){
			d.resolve(response);
		}, function(err){
			d.reject(err);
		})
		return d.promise;
	};

	return resource;
}]);