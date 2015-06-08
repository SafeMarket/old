angular.module('app').service('blockchain',function($http){

	function Blockchain(){}

	Blockchain.prototype.getAddressPromise = function(address){
		return $http.get('https://blockchain.info/rawaddr/'+address)
	}

	return new Blockchain
})