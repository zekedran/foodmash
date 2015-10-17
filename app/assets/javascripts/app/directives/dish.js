'use strict';

angular.module('foodmashApp.directives')

.directive('dish', ['Dish', '$q', 'toaster', 'DishType', 'Cuisine', 'Upload', 'Aws', function(Dish, $q, toaster, DishType, Cuisine, Upload, Aws){

	return {

		restrict: 'E',

		templateUrl: '/templates/dish.html',

		controller: ['$scope', 'Dish', '$q', 'toaster', 'DishType', 'Cuisine','Upload', 'Aws', function($scope, Dish, $q, toaster, DishType, Cuisine, Upload, Aws){

			$scope.cuisines = {};
			$scope.dish_types = {};
			$scope.updatedDish = new Dish;

			DishType.query().then(function(dish_types){
				if(dish_types.length > 0){
				  $scope.dish_types = dish_types;		
				}else{
				  $scope.dish_types = null;
				}
			}, function(err){
				$scope.dish_types = null;
			});

			Cuisine.query().then(function(cuisines){
				if(cuisines.length > 0){
				  $scope.cuisines = cuisines;		
				}else{
				  $scope.cuisines = null;
				}
			}, function(err){
				$scope.cuisines = null;
			});

			$scope.setUpdate = function(dish){
				$scope.updatedDish = angular.copy(dish);
			};

			$scope.uploadFiles = function(file, errFiles){
				if(file){
					Aws.loadAWS().then(function(aws){
						Upload.upload({
						    url: 'https://foodmash.s3.amazonaws.com/', //S3 upload url including bucket name
						    method: 'POST',
						    data: {
						        key: 'images/dishes/' + file.name, // the key to store the file on S3, could be file name or customized
						        AWSAccessKeyId: aws.key,
						        acl: 'public-read', // sets the access to the uploaded file in the bucket: private, public-read, ...
						        policy: aws.policy, // base64-encoded json policy (see article below)
						        signature: aws.signature, // base64-encoded signature based on policy string (see article below)
						        "Content-Type": file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
						        file: file
						    }
						});
					});
				}
			};

			$scope.updateDish = function(dish, dishUpdateCross){
				var d = $q.defer();
				if(!dishUpdateCross){
					if(!$scope.dishUpdateForm.$pristine){
						$scope.updatedDish.update().then(function(response){
							toaster.pop('success', 'Dish was updated!');
							var index = $scope.dishes.indexOf(dish);
							if(angular.isNumber(index) && index >= 0){
								$scope.dishes[index] = $scope.updatedDish;
							}
							d.resolve(response);
						}, function(err){
							toaster.pop('error', 'Dish was not updated!');
							d.reject(err);
						});
					}else{
						$scope.updatedDish = new Dish;
						d.resolve(null);
					}
				}
				return d.promise;
			};

			$scope.deleteDish = function(dish){
				var d = $q.defer();
				dish.delete().then(function(response){
					toaster.pop('success', 'Dish was deleted!');
					$scope.dishes.splice($scope.dishes.indexOf(dish), 1);
					d.resolve(response);
				}, function(err){
					toaster.pop('error', 'Dish was not deleted!');
					d.reject(err);
				});
				return d.promise;
			};

		}]

	};

}]);