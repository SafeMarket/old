angular.module('app').service('blockchain',function($http,$q,storage){

	var blockchain = {}

	function getHost(){
		if(storage.get('settings').useOnions)
			return 'http://blockchatvqztbll.onion/'
		else
			return 'https://blockchain.info/'
	}

	blockchain.getAddressPromise = function(address){
		return $q(function(resolve,reject){
			$http
				.get(getHost()+'rawaddr/'+address+'?cors=true')
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
				.get(getHost()+'unspent?address='+address)
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
				,url: getHost()+'pushtx?cors=true'
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
				.get(getHost()+'q/getblockcount')
				.success(function(response){
					resolve(response)
				}).error(function(error){
					reject(error)
				})
		})
	}

	return blockchain

})