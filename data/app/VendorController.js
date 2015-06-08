angular.module('app').controller('VendorController',function($scope,$q,$timeout,Vendor){

	$scope.totals = {
		vendor_currency:0
		,my_currency:0
		,btc:0
	}

	self.port.on('show',function onShow(options){
		$scope.rates = rates = options.rates
		$scope.preferences = options.preferences
		$scope.vendor = null

		try{
			$scope.vendor = Vendor.fromXml(options.vendorXml)
		}catch(err){
			$scope.error=err
		}

		$scope.$apply()
	})

	$scope.$watch('vendor.products',function(product){
		if(!$scope.vendor) return

		$scope.totals = {
			vendor_currency:$scope.vendor.getTotal()
			,btc:$scope.vendor.getTotal('BTC')
			,my_currency:$scope.vendor.getTotal($scope.preferences.currency)
		}
	},true)

	$scope.checkout = function(){
		this.vendor.getReceiptPromise($q,$scope.message).then(function(receipt){
			$scope.receipt = receipt
		})
	}

	$scope.update = function(){
		$scope.receipt.getUpdatePromise().finally(function(){
			$timeout(function(){
				console.log($scope.receipt.blockchain.total_received)
			})
		})
	}

})

function convert(amount,currencies){

	if(!rates.hasOwnProperty(currencies.from) || !rates.hasOwnProperty(currencies.to))
		throw 'Invalid currency'

	amount_btc = amount/rates[currencies.from]
	return amount_btc*rates[currencies.to]
}