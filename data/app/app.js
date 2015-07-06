var app = angular.module('app',['ui.bootstrap','angular-growl', 'yaru22.angular-timeago'])
  ,marketplaceAddress = '19r4NhfZkJRs3pkPN8iMVCML6Rt91VANiH'

if(self.port)
  self.port.on('load',function(data){
    data = typeof data==='object'? data:{}
    localStorage.setItem('app',JSON.stringify(data))
    angular.bootstrap(document, ['app']);
    self.port.emit('bootstrapped')
  })
else
   window.onload = function(){
    angular.bootstrap(document, ['app']);
  }

app.config(function(growlProvider,$provide,$httpProvider) {
    growlProvider.globalTimeToLive(5000);
    growlProvider.onlyUniqueMessages(false);
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
});


app.run(function($rootScope,ticker){
  //force ticker to start

  $rootScope.path = self.port ? window.location.href.replace('index.html','') : '/'
 
  if(self.port)
    self.port.on('receipt',function(receipt){
      $rootScope.$broadcast('receipt',receipt)
    })
})

app.filter('convert',function(convert){
  return function (price,currency_from,currency_to){
    price = convert(price,{from:currency_from,to:currency_to})
    return _.formatPrice(price,currency_to)
  }
})

_.buffer = function(){
  var args = Array.prototype.slice.call(arguments)
    , args = [null].concat(args)
    , Buffer = bitcoin.Buffer.Buffer
  //http://stackoverflow.com/questions/5054926/javascript-create-instance-with-array-of-arguments
  return (new (Buffer.bind.apply(Buffer,args)))
}

_.bufferToArray = function(buffer){
  var a = []
  _.range(buffer.byteLength).forEach(function(i){
    a.push(buffer[i])
  })
  return a
}

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

_.getWif = function(xprvkey){
  var bip = new BIP32(xprvkey)
  return _.bipToWif(bip)
}

_.getSignature = function(message,xprvkey){
  return _.signWithWif(message,_.getWif(xprvkey))
}

_.signWithWif = function(message,wif){
  var key = bitcoin.bitcoin.ECKey.fromWIF(wif)
    ,signature = bitcoin.bitcoin.Message.sign(key, message)

    signature = signature.toString('base64')

    return signature
}

_.ab2str=function(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

_.intToHex = function(i){
  if(i>255 || i<0)
    throw 'invalid range'

  var h = i.toString(16)

  if(h.length===1)
    h = '0'+h

  return h
}

_.str2ab=function(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
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

validate.validators.type = function(value, options, key, attributes) {
  if(value === null || value === undefined) return null

  if(options==='array')
    return typeof Array.isArray(value) ? null : 'is not an array'

	return typeof value===options ? null : 'is not a '+options
};

validate.validators.startsWith = function(value, options, key, attributes) {
  if(!value) return null
	return _.startsWith(_.trim(value),options) ? null : 'should start with '+options
};

validate.validators.endsWith = function(value, options, key, attributes) {
  if(!value) return null
  return _.endsWith(_.trim(value),options) ? null : 'should end with '+options
};

