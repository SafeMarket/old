angular.module('app').service('blockchain',function($http,$q,storage,$interval){

	var blockchain = {}
		,isRequesting

	wait = function(callback){
		console.log('request',isRequesting)
		if(!isRequesting){
			isRequesting = true
			callback()
		}
		else
			var interval = $interval(function(){
				console.log('interval',isRequesting)
				if(isRequesting)
					return

				callback()
				$interval.cancel(interval)
			},1000)
	}

	function getHost(){
		if(storage.get('settings').useOnions)
			return 'http://blockchatvqztbll.onion/'
		else
			return 'https://blockchain.info/'
	}

	blockchain.getAddressPromise = function(address){
		return $q(function(resolve,reject){
			wait(function(){$http
				.get(getHost()+'rawaddr/'+address+'?cors=true')
				.success(function(response){
					console.log(response)
					resolve(response)
					isRequesting = false
				})
				.error(function(error){
					reject(error)
					isRequesting = false
				})
			})})
	}

	blockchain.getUtxosPromise = function(address){
		return $q(function(resolve,reject){
			wait(function(){$http
				.get(getHost()+'unspent?address='+address)
				.success(function(response){
					resolve(response)
					isRequesting = false
				})
				.error(function(error){
					reject(error)
					isRequesting = false
				})
			})})
	}

	blockchain.getPushTxPromise = function(txHex){
		return $q(function(resolve,reject){
			wait(function(){$http({
				method: 'POST'
				,url: getHost()+'pushtx?cors=true'
				,data: $.param({tx:txHex})
				,headers:{
					"Content-Type":"application/x-www-form-urlencoded"
				}
			}).success(function(response){
				resolve(response)
				isRequesting = false
			}).error(function(error){
				reject(error)
				isRequesting = false
			})
		})})
	}

	blockchain.getHeightPromise = function(txHex){
		return $q(function(resolve,reject){
			wait(function(){$http
				.get(getHost()+'q/getblockcount')
				.success(function(response){
					resolve(response)
					isRequesting = false
				}).error(function(error){
					reject(error)
					isRequesting = false
				})
			})})
	}

	return blockchain

})