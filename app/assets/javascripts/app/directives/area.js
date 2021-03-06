'use strict';

angular.module('foodmashApp.directives')

.directive('area', ['toaster', 'Areas', '$q', 'PackagingCentre', function(toaster, Areas, $q, PackagingCentre){

	return {

		restrict: 'A',

		templateUrl: '/templates/area.html',

		controller: ['$scope', 'toaster', 'Areas', '$q', 'PackagingCentre', function($scope, toaster, Areas, $q, PackagingCentre){

			$scope.updatedArea = new Areas;

			$scope.setUpdate = function(area){
				$scope.updatedArea = angular.copy(area);
			};

			$scope.selectPackagingCentreForUpdate = function(packaging_centre){
				$scope.selectedPackagingCentreForUpdate = packaging_centre;
				$scope.updatedArea.packaging_centre_id = packaging_centre.id;
			};

			$scope.updateArea = function(area){
				var d = $q.defer();
				$scope.updatedArea.update().then(function(response){
					toaster.pop('success', 'Area was successfully updated!');
					var index = $scope.areas.indexOf(area);
					if(angular.isNumber(index) && index >= 0){
						$scope.areas[index] = $scope.updatedArea;
					}
					d.resolve(response);
				}, function(err){
					toaster.pop('error', 'Area was not updated!');
					d.reject(err);
				});
				return d.promise;
			};

			$scope.deleteArea = function(area){
				var d = $q.defer();
				if(confirm('Are you sure ?')){
					area.delete().then(function(response){
						$scope.areas.splice($scope.areas.indexOf(area), 1);
						toaster.pop('success', 'Area was succussfully deleted!');
						d.resolve(response);
					}, function(err){
						toaster.pop('error', 'Area was not deleted!');
						d.reject(err);
					});
				}
				return d.promise;
			};

		}]

	};

}]);