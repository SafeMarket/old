app.controller('AppController',function($scope,storage){
	$scope.page = storage.data.page? storage.data.page : 'settings'
	$scope.path = window.location.href.replace('index.html','')
	console.log($scope.path)

	$scope.$watch('page',function(page){
		console.log('page',page)
		storage.data.page=page
		storage.save()
	})

	$scope.$on('receipt',function($event,receipt){
		$scope.page = 'order'
	})
})