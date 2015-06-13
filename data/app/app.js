var app = angular.module('app',['ui.bootstrap','angular-growl', 'yaru22.angular-timeago'])

if(self.port)
  self.port.on('load',function(data){
    data = typeof data==='object'? data:{}

    localStorage.setItem('app',JSON.stringify(data))
    angular.bootstrap(document, ['app']);
  })


app.config(function(growlProvider,$provide) {
    growlProvider.globalTimeToLive(5000);
    growlProvider.onlyUniqueMessages(false);
});


app.run(function($rootScope,ticker){
	//force ticker to start
})

_.json64 = {
	encode:function(object){
		return btoa(JSON.stringify(object))
	},decode:function(string){
		return JSON.parse(atob(string))
	}
}

_.doKeysMatch = function(a, b) {
  var aKeys = Object.keys(a).sort();
  var bKeys = Object.keys(b).sort();
  return JSON.stringify(aKeys) === JSON.stringify(bKeys);
}

_.bipPrivateToPublic = function(privateKey){
  return (new BIP32(privateKey)).extended_public_key_string()
}

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


validate.validators.type = function(value, options, key, attributes) {
  if(options==='array')
    return typeof Array.isArray(value) ? null : 'is not an array'

	return typeof value===options ? null : 'is not a '+options
};

validate.validators.startsWith = function(value, options, key, attributes) {
	return _.startsWith(value,options) ? null : 'does not start with '+options
};

