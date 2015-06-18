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
					reject(error)
				})
		})
	}

	blockchain.getUtxosPromise = function(address){
		return $q(function(resolve,reject){
			$http
				.get('https://blockchain.info/unspent?address='+address)
				.success(function(response){
					resolve(response)
				})
				.error(function(error){
					reject(error)
				})
		})
	}

	blockchain.getPushTxPromise = function(txHex){
		return $q(function(resolve,reject){
			$http({
				method: 'POST'
				,url: 'https://blockchain.info/pushtx?cors=true'
				,data: $.param({tx:txHex})
				,headers:{
					"Content-Type":"application/x-www-form-urlencoded"
				}
			}).success(function(response){
				resolve(response)
			}).error(function(error){
				reject(error)
			})
		})
	}

	blockchain.getHeightPromise = function(txHex){
		return $q(function(resolve,reject){
			$http
				.get('https://blockchain.info/q/getblockcount')
				.success(function(response){
					resolve(response)
				}).error(function(error){
					reject(error)
				})
		})
	}

	return blockchain

})