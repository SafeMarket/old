app.factory('storage',function($rootScope){
	

	var storage = {
		data:{}
	}

	if(!self.port){
		var dataJson = localStorage.getItem('app')

		if(dataJson)
			storage.data = JSON.parse(dataJson) ? JSON.parse(dataJson) : {}
		else
			storage.data = {}
	}

	
	storage.save = function(){
		console.log('save')
		console.log(self.port)
		if(localStorage)
			localStorage.setItem('app',JSON.stringify(this.data))
		else if(self.port){
			console.log('emit store')
			self.port.emit('store',this.data)
		}
		else
			throw 'Unkown storage'

		$rootScope.$broadcast('storage.save')
	} 


	return storage

})