var app = angular.module('app',['ui.bootstrap','angular-growl', 'yaru22.angular-timeago'])

if(self.port)
  self.port.on('load',function(data){
    console.log('load',data)
    data=data?data:{}
    
    localStorage.setItem('app',JSON.stringify(data))

    console.log('bootstrap')
    angular.bootstrap(document, ['app']);
  })


app.config(function(growlProvider) {
    growlProvider.globalTimeToLive(5000);
    growlProvider.onlyUniqueMessages(false)
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


validate.validators.array = function(value, options, key, attributes) {
	return Array.isArray(value) ? null : key+' is not an array'
};

validate.validators.startsWith = function(value, options, key, attributes) {
	return _.startsWith(value,options) ? null : key+' does not start with '+options
};

