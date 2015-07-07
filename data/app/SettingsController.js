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
			,xprvkey:{type:'string',startsWith:'xprv'}
			,pgp_public:{presence:true,type:'string',startsWith:'-----BEGIN PGP PUBLIC KEY BLOCK-----',endsWith:'-----END PGP PUBLIC KEY BLOCK-----'}
			,pgp_private:{presence:true,type:'string',startsWith:'-----BEGIN PGP PRIVATE KEY BLOCK-----',endsWith:'-----END PGP PRIVATE KEY BLOCK-----'}
			,pgp_passphrase:{type:'string'}
			,useOnions:{type:'boolean'}
			,info:{type:'string'}
		})

		storage.save('settings',$scope.settings)
		growl.addSuccessMessage('Settings saved')
	}

	$scope.setRandomXprvkey = function(){
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
			,randomString0 = _.sample(characters, 64).join('')
			,randomString1 = _.sample(characters, 64).join('')
			,hasher = new jsSHA(randomString0, 'TEXT')
        	,I = hasher.getHMAC(randomString1, "TEXT", "SHA-512", "HEX")
       		,il = Crypto.util.hexToBytes(I.slice(0, 64))
        	,ir = Crypto.util.hexToBytes(I.slice(64, 128))
			,gen_bip32 = new BIP32();
        
        gen_bip32.eckey = new Bitcoin.ECKey(il);
        gen_bip32.eckey.pub = gen_bip32.eckey.getPubPoint();
        gen_bip32.eckey.setCompressed(true);
        gen_bip32.eckey.pubKeyHash = Bitcoin.Util.sha256ripe160(gen_bip32.eckey.pub.getEncoded(true));
        gen_bip32.has_private_key = true;

        gen_bip32.chain_code = ir;
        gen_bip32.child_index = 0;
        gen_bip32.parent_fingerprint = Bitcoin.Util.hexToBytes("00000000");
        gen_bip32.version = 76066276;
        gen_bip32.depth = 0;

        gen_bip32.build_extended_public_key();
        gen_bip32.build_extended_private_key();
        
        $scope.settings.xprvkey = gen_bip32.extended_private_key_string()
	}

})