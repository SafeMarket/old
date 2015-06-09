var app = angular.module('app',['ui.bootstrap'])



app.directive('mkPrivate', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.integer = function(modelValue, viewValue) {
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
      ctrl.$validators.integer = function(modelValue, viewValue) {

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
      ctrl.$validators.integer = function(modelValue, viewValue) {
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

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}