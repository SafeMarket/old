angular.module('app').service('blockchain',function($http,$q){

	var blockchain = {}

	blockchain.getAddressPromise = function(address){
		return $q(function(resolve,reject){
			$http
				.get('https://blockchain.info/rawaddr/'+address+'?cors=true')
				.success(function(response){
					console.log(response)
					resolve(response)
				})
				.error(function(error){
					console.log(error)
					reject(error)
				})
		})
	}

	return blockchain

})