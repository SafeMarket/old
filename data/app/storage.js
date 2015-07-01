app.factory('storage',function($rootScope){
	

	var storage = {}
		,dataJson = localStorage.getItem('app')
		,data = {}

	if(dataJson)
		data = JSON.parse(dataJson) ? JSON.parse(dataJson) : {}

	storage.save = function(key,keyData){
		data[key]=angular.copy(keyData)

		if(self.port){
			self.port.emit('store',data)
		}
		
		localStorage.setItem('app',JSON.stringify(data))
		
		$rootScope.$broadcast('storage.'+key+'.save',data[key])
	}

	storage.get = function(key){
		return angular.copy(data[key])
	}


	return storage

})