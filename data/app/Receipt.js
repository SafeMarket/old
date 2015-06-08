angular.module('app').factory('Receipt',function(){
	function Receipt(vendor,message){
		var indexMax = Math.pow(2,31)-1
			,products = []

		vendor.products.forEach(function(product){
			if(product.quantity===0) return true
			products.push({
				id:product.id
				,quantity:product.quantity
			})
		})

		angular.extend(this,{
			vendor: vendor
			,index: Math.random(0,indexMax)
			,epoch: Math.round((new Date()).getTime() / 1000)
			,products:products
			,total:vendor.getTotal('BTC')
			,message:message
		})

		this.setAddress()
		console.log(this.address)
	}

	Receipt.prototype.getData = function(){
		return {
			index:this.index
			,epoch:this.epoch
			,products:this.products
			,total:this.total
			,message:this.message
		}
	}

	Receipt.prototype.setAddress = function(){
		console.log('setAddress')
		console.log(this.vendor.mpk)
		var bip32 = new BIP32(this.vendor.mpk.trim())

		console.log('a')
		var paths = ['m',this.index,this.epoch]
			console.log(paths)
		var child = bip32.derive(paths.join('/'))
		console.log('child')
		var hash160 = child.eckey.pubKeyHash

		console.log(hash160)

		this.address =  (new Bitcoin.Address(hash160)).toString()
	}

	return Receipt
})