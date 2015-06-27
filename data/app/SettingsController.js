app.controller('SettingsController',function($scope,storage,$timeout,ticker,growl,check){
	$scope.settings = storage.get('settings')
	$scope.currencies = Object.keys(ticker.rates)

	$scope.$on('ticker.rates',function($event,rates){
		$scope.currencies = Object.keys(rates)
	})


	$scope.save = function(){
		if(!$scope.settingsForm.$valid)
			return growl.addErrorMessage('Save failed')

		check.constraints($scope.settings,{
			name:{presence:true,type:'string'}
			,currency:{presence:true,inclusion:Object.keys(ticker.rates),type:'string'}
			,address:{presence:true,type:'string'}
			,mk_private:{presence:true,type:'string',startsWith:'xprv'}
			,pgp_public:{presence:true,type:'string',startsWith:'-----BEGIN PGP PUBLIC KEY BLOCK-----',endsWith:'-----END PGP PUBLIC KEY BLOCK-----'}
			,pgp_private:{presence:true,type:'string',startsWith:'-----BEGIN PGP PRIVATE KEY BLOCK-----',endsWith:'-----END PGP PRIVATE KEY BLOCK-----'}
			,pgp_passphrase:{type:'string'}
			,useOnions:{type:'boolean'}
			,info:{type:'string'}
		})

		storage.save('settings',$scope.settings)
		growl.addSuccessMessage('Settings saved')
	}

})