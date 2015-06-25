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

	blockchain.getTxsPromise = function(address){
		
		return $q(function(resolve,reject){

			var txs = []

			function getTxsPagePromise(pageN){
				console.log('pageN',pageN)
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
		console.log('getUtxosPromise')
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
		console.log(txHex)

		var data = {
			jsonrpc:'2.0'
			,method:'sendrawtransaction'
			,params:[txHex]
		}

		$http({
			url:'http://localhost:8332'
			,method:'POST'
			,data:JSON.stringify(data)
			,headers:{
				'Content-Type': 'application/json'
				,'Authorization': 'Basic '+btoa('rpcuser:PVYqYx9H8PeAhBPGkDpf')
			}
		}).success(function(){
			console.log('success',arguments)
		}).error(function(){
			console.log('error',arguments)
		});
		return
	}

	blockchain.getHeightPromise = function(txHex){
		console.log('getHeightPromise')
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