app.factory('check',function(growl){

	var check = {}

	check.constraints = function(data,constraints){
		
		var dataKeys = Object.keys(data)
		    ,constraintKeys = Object.keys(constraints)

		constraintKeys.forEach(function(key){
			if(!constraints[key].type)
				throw key+' must be constrained by type'
		})

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

	check.signature = function(message,address,signature){

		try{
			var isValid = bitcoin.bitcoin.Message.verify(address, signature, message)
		}catch(error){
			growl.addErrorMessage('Invalid signature')
			throw 'Invalid signature'
		}

		if(isValid!==true){
			growl.addErrorMessage('Invalid signature')
			throw 'Invalid signature'
		}

		growl.addSuccessMessage('Signature validated')

	}


	return check
})