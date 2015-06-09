var pgpPublic = "-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: BCPG C# v1.6.1.0\n\nmQENBFV12h8BCADKEinbwbGfjM48RulqVnv3XsD5tSKp5a8b8hRNZ3H3B3q0/T6j\nmX+FeHDtGujPAtVIB9gTvtc0fapCeqNwwuKdxMLSAh9v0Kd2iRa4ZbZJizY90wq4\n4rF3yhncPMHmw5Js17sEScFzEASjARyD3yrP6yj1yTf/FhtRcP6n78g6UxxtJJJp\nxIoDKPbSaask8XxcB1S96GZe7BtxLteIEl12KKJBSpVbL/v/ZNt/p0DqeguP4egD\newPECT/LkOeg2z1u6d2mwCyqjBvRgyj9SMZoOUcVyZv7473ECzZnaGKahwELrEi6\nsjpFbEFSBy36at2PAFYW+oZ3x1rLIT2Ydd3xABEBAAG0AIkBHAQQAQIABgUCVXXa\nHwAKCRDexTpv6mqgYyZcCACRtePs5DDy7/TIngbkqwdfh3Q8ODZ0aE50Kg4KoA2z\n2m0VJ3R3P9JujFaQ5B7jUlTsAIEghPrZnw+Uu/VVaToDEzq+nASZYbxulq3Gj44L\nTfdQHjHSnxl2xat9Kxy7Y+5LyjRv6My7fId2RiY8dPR7v4iwPIOx1J1y7tQ45qmi\nZoRc7SIXFPqxRRbG3yYZzBgpr1p5Dd6wyK9rVKcRMpdQkL1n1ngHmgMNdgxTBlQT\n9YGoe+uOYg9h2UZpzERrb3U2rJZbSG9dAIYQ4bdwL7zw7JXLGok+QDsLsSMHOk6m\ng6uezgfQNcQUWrzsEcAw539k6SimA/0HzTzARiNEnPLC\n=lcOQ\n-----END PGP PUBLIC KEY BLOCK-----"

angular.module('app').controller('ManifestController',function($scope,Vendor){
	
	if(self.port)
		self.port.on('show',function(options){
			$scope.manifest = null
			$scope.name = null
			$scope.products = [{}]
			$scope.preferences = options.preferences
			$scope.rates = options.rates
			$scope.$apply()
		})

	$scope.submit = function(){

		console.log({
			name:$scope.name
			,currency:$scope.preferences.currency
			,pgpPublic:pgpPublic
			,products:$scope.products
		})

		var vendor = new Vendor({
			name:$scope.name
			,currency:$scope.preferences.currency
			,pgpPublic:pgpPublic
			,products:$scope.products
		},$scope.rates)

		$scope.manifest = vendor.manifest
	}
})