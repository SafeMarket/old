app.factory('pgp',function($q,$timeout,growl){
	var pgp = {}

	pgp.getEncryptPromise = function(armoredPublicKeys,message){
		growl.addInfoMessage('Executing pgp encryption...')
		var keys = []
		armoredPublicKeys.forEach(function(armoredPublicKey){
			var key = openpgp.key.readArmored(armoredPublicKey).keys[0]
			keys.push(key)
		})

		return $q(function(resolve,reject){
			$timeout(function(){ //give the ux time to update
				openpgp.encryptMessage(keys,message).then(function(pgpMessage) {
					growl.addSuccessMessage('Encryption complete')
	    			resolve(pgpMessage)
				}).catch(function(error) {
					growl.adErrorMessage('Something went wrong')
				    reject(error)
				});
			},1000)
		})
	}

	pgp.getDecryptPromise = function(armoredPrivateKey,privateKeyPassword,armoredMessage){

		if(!armoredPrivateKey)
			throw 'Private key not set'

		if(!armoredMessage)
			throw 'Missing armored message'


		growl.addInfoMessage('Executing pgp decryption...')

		var privateKey = openpgp.key.readArmored(armoredPrivateKey).keys[0]
			,pgpMessage = openpgp.message.readArmored(armoredMessage)
		
		privateKeyPassword = typeof privateKeyPassword==='string'?privateKeyPassword:''

		privateKey.decrypt(privateKeyPassword)

		return $q(function(resolve,reject){
			$timeout(function(){ //give the ux time to update
				openpgp.decryptMessage(privateKey, pgpMessage).then(function(plaintext){
					growl.addSuccessMessage('Decryption complete')
					resolve(plaintext)
				}).catch(function(){
					growl.adErrorMessage('Something went wrong')	
					reject(error)
				})
			},1000)
		})
	}

	return pgp

})