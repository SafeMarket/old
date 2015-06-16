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

	$scope.$on('manifest',function(event,manifest){
		$scope.manifest = manifest
	})

	$scope.total = 0

	/*
	$scope.totals = {
		vendor_currency:0
		,my_currency:0
		,btc:0
	}
	*/

	if(self.port)
		self.port.on('show',function onShow(options){
			$scope.preferences = options.preferences
			$scope.vendor = null

			try{
				$scope.vendor = Vendor.fromXml(options.vendorXml,options.rates)
			}catch(err){
				$scope.error=err
			}

			$scope.$apply()
		})

	$scope.$watch('vendor.data.products',function(product){
		if(!$scope.vendor){
			$scope.product = null
			return
		}

		$scope.total = $scope.vendor.getTotal()

	},true)

	$scope.checkout = function(){
		$scope.vendor.getReceiptPromise($scope.message).then(function(receipt){
			$rootScope.$broadcast('receipt',receipt)
		})
	}

})