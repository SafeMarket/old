app.factory('check',function(growl){

	return function(data,constraints){
		
		var dataKeys = Object.keys(data)
		    ,constraintKeys = Object.keys(constraints)

		dataKeys.forEach(function(key){
		    if(constraintKeys.indexOf(key)===-1)
			    delete data[key]
		})  

		var errors = validate(data,constraints)

		if(errors===undefined || errors===null)
			return null

		var error = errors[Object.keys(errors)[0]][0]

		growl.addErrorMessage(error)
	    throw error
	}

})