app.factory('storage',function($rootScope){
	

	var storage = {
		data:{}
	}

	storage.fetch = function(){
		
		if(localStorage){
			var dataJson = localStorage.getItem('app')
			if(dataJson)
				this.data = JSON.parse(dataJson) ? JSON.parse(dataJson) : {}
			else
				this.data = {}
		}
	}

	storage.save = function(){
		if(localStorage)
			localStorage.setItem('app',JSON.stringify(this.data))

		$rootScope.$broadcast('storage.save')
	} 

	storage.fetch()

	return storage

})