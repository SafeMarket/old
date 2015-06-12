app.factory('storage',function($rootScope){
	

	var storage = {
		data:{}
	}

	var dataJson = localStorage.getItem('app')

	if(dataJson)
		storage.data = JSON.parse(dataJson) ? JSON.parse(dataJson) : {}
	else
		storage.data = {}

	storage.save = function(){
		if(self.port){
			self.port.emit('store',this.data)
		}else if(localStorage)
			localStorage.setItem('app',JSON.stringify(this.data))
		else
			throw 'Unkown storage'

		$rootScope.$broadcast('storage.save')
	} 


	return storage

})