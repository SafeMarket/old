app.controller('AppController',function($scope,storage){
	$scope.page = storage.get('page')? storage.get('page') : 'settings'
	$scope.path = window.location.href.replace('index.html','')

	$scope.$watch('page',function(page,pageBefore){
		if(!page || !pageBefore || page == pageBefore) return
		storage.save('page',page)
	})

	$scope.$on('receipt',function($event,receipt){
		$scope.page = 'order'
	})
})