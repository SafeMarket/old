var app = angular.module('app',['ui.bootstrap','angular-growl', 'yaru22.angular-timeago'])

if(self.port)
  self.port.on('load',function(data){
    data = typeof data==='object'? data:{}
    localStorage.setItem('app',JSON.stringify(data))
    angular.bootstrap(document, ['app']);
  })
else
   window.onload = function(){
    angular.bootstrap(document, ['app']);
  }


app.config(function(growlProvider,$provide) {
    growlProvider.globalTimeToLive(5000);
    growlProvider.onlyUniqueMessages(false);
});


app.run(function($rootScope,ticker){
	//force ticker to start
})

app.filter('convert',function(convert){
  return function (price,currency_from,currency_to){
    price = convert(price,{from:currency_from,to:currency_to})
    return _.formatPrice(price,currency_to)
  }
})


_.json64 = {
	encode:function(object){
		return btoa(JSON.stringify(object))
	},decode:function(string){
		return JSON.parse(atob(string))
	}
}

_.decimal = function(input){
  return new Decimal(input)
}

_.formatPrice = function(price,currency){

  var places = currency==='BTC' ? 6 : 2

  price = new Decimal(price)

  return price.toFixed(places)
}

_.doKeysMatch = function(a, b) {
  var aKeys = Object.keys(a).sort();
  var bKeys = Object.keys(b).sort();
  return JSON.stringify(aKeys) === JSON.stringify(bKeys);
}

_.bipPrivateToPublic = function(privateKey){
  return (new BIP32(privateKey)).extended_public_key_string()
}

_.bipToWif = function(bip){
  privkeyBytes = bip.eckey.priv.toByteArrayUnsigned()

  while (privkeyBytes.length < 32)
    privkeyBytes.unshift(0)
 
  var bytes = [0].concat(privkeyBytes).concat([1])
    ,checksum = Crypto.SHA256(Crypto.SHA256(bytes, {asBytes: true}), {asBytes: true}).slice(0, 4)

  return Bitcoin.Base58.encode(bytes.concat(checksum))
}

_.keyToAddress = function(key){
  var bip = new BIP32(key)
    ,hash160 = bip.eckey.pubKeyHash

  return (new Bitcoin.Address(hash160)).toString()
}

_.getWif = function(mk_private){
  var bip = new BIP32(mk_private)
  return _.bipToWif(bip)
}

_.getSignature = function(message,mk_private){
  return _.signWithWif(message,_.getWif(mk_private))
}

_.signWithWif = function(message,wif){
  var key = bitcoin.bitcoin.ECKey.fromWIF(wif)
    ,signature = bitcoin.bitcoin.Message.sign(key, message)

    signature = signature.toString('base64')

    return signature

}

_.parseBase58Check = function(address) {
  var bytes = Bitcoin.Base58.decode(address);
  var end = bytes.length - 4;
  var hash = bytes.slice(0, end);
  var checksum = Crypto.SHA256(Crypto.SHA256(hash, {asBytes: true}), {asBytes: true});
  if (checksum[0] != bytes[end] ||
      checksum[1] != bytes[end+1] ||
      checksum[2] != bytes[end+2] ||
      checksum[3] != bytes[end+3])
          throw new Error("Wrong checksum");
  var version = hash.shift();
  return [version, hash];
}

/*
app.directive('price', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.price = function(modelValue, viewValue) {
        
        if(ctrl.$isEmpty(modelValue))
          return true;

        if(!parseFloat(modelValue)>0)
          return false;

      	return true;
      };
    }
  };
});

app.directive('mkPrivate', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.mk_private = function(modelValue, viewValue) {
        if(ctrl.$isEmpty(modelValue)) {
          return true;
        }

        if(!_.startsWith(viewValue,'xprv')){
          return false;
        }

        return true;
      };
    }
  };
});

app.directive('pgpPublic', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.pgp_public = function(modelValue, viewValue) {

        if(ctrl.$isEmpty(modelValue))
          return true;

        if(!_.startsWith(viewValue,'-----BEGIN PGP PUBLIC KEY BLOCK-----'))
          return false;

        if(!_.endsWith(viewValue,'-----END PGP PUBLIC KEY BLOCK-----'))
          return false;

        return true;
      };
    }
  };
});


app.directive('pgpPrivate', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.pgp_private = function(modelValue, viewValue) {
        if(ctrl.$isEmpty(modelValue)) 
          return true;

        if(!_.startsWith(viewValue,'-----BEGIN PGP PRIVATE KEY BLOCK-----'))
            return false;


        if(!_.endsWith(viewValue,'-----END PGP PRIVATE KEY BLOCK-----'))
          return false;

        return true;
      };
    }
  };
});

*/

validate.validators.type = function(value, options, key, attributes) {
  if(value === null || value === undefined) return null

  if(options==='array')
    return typeof Array.isArray(value) ? null : 'is not an array'

	return typeof value===options ? null : 'is not a '+options
};

validate.validators.startsWith = function(value, options, key, attributes) {
	return _.startsWith(value,options) ? null : 'does should start with '+options
};

validate.validators.endsWith = function(value, options, key, attributes) {
  return _.endsWith(value,options) ? null : 'does should end with '+options
};

