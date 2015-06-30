app.controller('VendorController',function($scope,$q,$timeout,Vendor,storage,growl,$rootScope){

	$scope.$watch('xpubkey',function(xpubkey){
		if(!xpubkey) return

		$rootScope.isLoading = true

		try{

		Vendor.getFromXpubkeyPromise(xpubkey).then(function(vendor){
			$rootScope.isLoading = false
			$scope.vendor = vendor
		},function(){
			$rootScope.isLoading = false
			growl.addErrorMessage('Something went wrong')
		})

		}catch(error){
			$rootScope.isLoading = false
			growl.addErrorMessage('Something went wrong')
		}
		
	})

	$scope.$on('vendorData',function(event,vendorData){
		$scope.vendor = new Vendor(vendorData)
	})

	$scope.$on('xpubkey',function(event,xpubkey){
		$scope.xpubkey = xpubkey
	})

	$scope.total = 0

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
		if(!storage.get('settings')){
			growl.addErrorMessage('You must complete your settings')
			throw 'settings incomplete'
		}

		$scope.vendor.getReceiptPromise($scope.message).then(function(receipt){
			$rootScope.$broadcast('receipt','<receipt>'+receipt+'</receipt>')
		})
	}

})