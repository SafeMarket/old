app.controller('AppController',function($scope,storage){
	$scope.page = storage.data.page? storage.data.page : 'settings'

	$scope.$watch('page',function(page){
		storage.data.page=page
		storage.save()
	})

	$scope.$on('receipt',function($event,receipt){
		$scope.page = 'order'
	})
})