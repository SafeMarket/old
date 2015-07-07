angular.module('app').service('blockchain',function($http,$q,storage,$interval,$rootScope){

	var blockchain = {}
		,isRequesting

	wait = function(callback){
		$rootScope.isLoading = true
		if(!isRequesting){
			isRequesting = true
			callback()
		}
		else
			var interval = $interval(function(){
				if(isRequesting)
					return

				isRequesting = true
				callback()
				$interval.cancel(interval)
			},1000)
	}

	function getHost(){
		if(false && storage.get('settings') && storage.get('settings').useOnions)
			return 'blockchatvqztbll.onion/'
		else
			return 'https://blockchain.info/'
	}

	blockchain.getTickerPromise = function(){
		return $q(function(resolve,reject){
			wait(function(){$http
				.get(getHost()+'ticker')
				.success(function(response){
					resolve(response)
					isRequesting = false
					$rootScope.isLoading = false
				})
				.error(function(error){
					reject(error)
					isRequesting = false
					$rootScope.isLoading = false
				})
			})})
	}

	blockchain.getAddressPromise = function(address,pageN){
		pageN = pageN ? pageN : 0

		return $q(function(resolve,reject){
			wait(function(){$http
				.get(getHost()+'rawaddr/'+address+'?cors=true&offset='+(pageN*50))
				.success(function(response){
					resolve(response)
					isRequesting = false
					$rootScope.isLoading = false
				})
				.error(function(error){
					reject(error)
					isRequesting = false
					$rootScope.isLoading = false
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
					$rootScope.isLoading = false
				})
				.error(function(error){
					reject(error)
					isRequesting = false
					$rootScope.isLoading = false
				})
			})})
	}

	blockchain.getPushTxPromise = function(txHex){

		return $q(function(resolve,reject){
			wait(function(){
				$http({
				    method: 'POST'
				    ,url: getHost()+'pushtx?cors=true'
				    ,data: $.param({tx:txHex})
				    ,headers:{
				        "Content-Type":"application/x-www-form-urlencoded"
				    }
				}).success(function(response){
					resolve(response)
					$rootScope.isLoading = false
				}).error(function(error){
					reject(error)
					$rootScope.isLoading = false
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
					$rootScope.isLoading = false
				}).error(function(error){
					reject(error)
					isRequesting = false
					$rootScope.isLoading = false
				})
			})})
	}

	return blockchain

})