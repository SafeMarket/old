app.factory('storage',function($rootScope){
	

	var storage = {}
		,dataJson = localStorage.getItem('app')

	if(dataJson)
		data = JSON.parse(dataJson) ? JSON.parse(dataJson) : {}
	else
		data = {}

	storage.save = function(key,keyData){
		data[key]=angular.copy(keyData)

		if(self.port){
			console.log('storage.js emit',data)
			self.port.emit('store',data)
		}else if(localStorage)
			localStorage.setItem('app',JSON.stringify(data))
		else
			throw 'Unkown storage'

		$rootScope.$broadcast('storage.save',data)
	}

	storage.get = function(key){
		return angular.copy(data[key])
	}


	return storage

})