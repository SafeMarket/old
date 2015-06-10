app.factory('pgp',function($q){
	var pgp = {}

	pgp.getEncryptPromise = function(armoredPublicKeys,message){
		var keys = []
		armoredPublicKeys.forEach(function(armoredPublicKey){
			var key = openpgp.key.readArmored(armoredPublicKey).keys[0]
			keys.push(key)
		})

		console.log(keys)

		return $q(function(resolve,reject){
			openpgp.encryptMessage(keys,message).then(function(pgpMessage) {
    			resolve(pgpMessage)
			}).catch(function(error) {
			    reject(error)
			});
		})
	}

	pgp.getDecryptPromise = function(armoredPrivateKey,privateKeyPassword,armoredMessage){

		var privateKey = openpgp.key.readArmored(armoredPrivateKey).keys[0]
			,pgpMessage = openpgp.message.readArmored(armoredMessage)

		privateKey.decrypt(privateKeyPassword)

		return $q(function(resolve,reject){
			openpgp.decryptMessage(privateKey, pgpMessage).then(function(plaintext){
				resolve(plaintext)
			})
		})
	}

	return pgp

})