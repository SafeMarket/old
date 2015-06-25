angular.module('app').service('blockchain',function($http,$q,storage,$interval){

	var blockchain = {}
		,isRequesting

	wait = function(callback){
		if(!isRequesting){
			isRequesting = true
			callback()
		}
		else
			var interval = $interval(function(){
				if(isRequesting)
					return

				callback()
				$interval.cancel(interval)
			},1000)
	}

	function getHost(){
		if(storage.get('settings') && storage.get('settings').useOnions)
			return 'http://blockchatvqztbll.onion/'
		else
			return 'https://blockchain.info/'
	}

	blockchain.getAddressPromise = function(address,pageN){
		pageN = pageN ? pageN : 0

		return $q(function(resolve,reject){
			wait(function(){$http
				.get(getHost()+'rawaddr/'+address+'?cors=true&offset='+(pageN*50))
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

	blockchain.getTxsPromise = function(address){
		
		return $q(function(resolve,reject){

			var txs = []

			function getTxsPagePromise(pageN){
				blockchain
					.getAddressPromise(address,pageN)
					.then(function(response){
						if(response.txs.length === 0)
							resolve(txs)
						else{
							txs = txs.concat(response.txs)
							getTxsPagePromise(pageN+1)
						}
					})

			}

			getTxsPagePromise(0)
		})

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
			wait(function(){
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
		})

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