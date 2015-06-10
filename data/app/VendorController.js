app.controller('VendorController',function($scope,$q,$timeout,Vendor,storage,growl,$rootScope){

	$scope.$watch('manifest',function(manifest){
		if(!manifest) return

		try{
			$scope.vendor = Vendor.fromManifest(manifest)
			growl.addSuccessMessage('Manifest loaded')
		}catch(error){
			growl.addErrorMessage('Invalid manifest')
		}
		
	})

	$scope.totals = {
		vendor_currency:0
		,my_currency:0
		,btc:0
	}

	if(self.port)
		self.port.on('show',function onShow(options){
			$scope.preferences = options.preferences
			$scope.vendor = null

			try{
				$scope.vendor = Vendor.fromXml(options.vendorXml,options.rates)
				console.log($scope.vendor)
			}catch(err){
				$scope.error=err
			}

			$scope.$apply()
		})

	$scope.$watch('vendor.data.products',function(product){
		if(!$scope.vendor) return

		$scope.totals = {
			vendor_currency:$scope.vendor.getTotal()
			,btc:$scope.vendor.getTotal('BTC')
			,my_currency:$scope.vendor.getTotal(storage.data.settings.currency)
		}
	},true)

	$scope.checkout = function(){
		$scope.vendor.getReceiptPromise().then(function(receipt){
			console.log(receipt)
			$rootScope.$broadcast('receipt',receipt)
		})
	}

})