app.controller('MarketplaceController',function($scope,$rootScope,blockchain,Vendor,storage,growl){

	var vendorDatas = storage.get('vendorDatas')

	$scope.vendorDatasSyncedAt = storage.get('vendorDatasSyncedAt')

	$scope.$on('storage.vendorDatasSyncedAt.save',function(event,data){
		$scope.vendorDatasSyncedAt = data.vendorDatasSyncedAt
	})

	if(!vendorDatas)
		$scope.vendors = []
	else{
		$scope.vendors = []
		vendorDatas.forEach(function(vendorData){
			try{
				$scope.vendors.push(new Vendor(vendorData))
			}catch(error){

			}
		})
	}

	$scope.loadVendor = function(xpubkey){
		$rootScope.$broadcast('xpubkey',xpubkey)
	}

	var flags = {}
		,chainDecimal = _.buffer('c')[0]
		,keyDecimal = _.buffer('K')[0]

	$scope.sync = function(){
		growl.addInfoMessage('Starting sync. This may take some time.')
		storage.save('vendorDatas',[])
		$scope.vendors=[]
		blockchain
			.getTxsPromise(marketplaceAddress)
			.then(function(txs){
				txs.forEach(function(tx){
					var address = tx.inputs[0].prev_out.addr
					
					if(!flags[address])
						flags[address]={}

					var flag = flags[address]

					var script = tx.out[0].script
						,buffer = new bitcoin.Buffer.Buffer(script,'hex')
						,isChain = false
						,isKey = false

					if(buffer.length<4)
						return true

					if(buffer[0]!== 106) //check OP_RETURN
						return true


					if(buffer[2]==chainDecimal)
						isChain = true
					if(buffer[2]==keyDecimal)
						isKey = true

					if(!isKey&&!isChain)
						return true


					if(isKey && flag.key) //ensure unique key
						return true
					else if(isKey)
						flag.key = buffer.slice(3).toString('hex')

					if(isChain && flag.chain) //ensure unique chain
						return true
					else if(isChain)
						flag.chain = buffer.slice(3).toString('hex')

				})

				Object.keys(flags).forEach(function(address){
					var flag = flags[address]

					if(!flag.chain || !flag.key || flag.xpubkey)
						return

					var hex = '0488B21E'+'00'+'00000000'+'00000000'+flag.chain+flag.key

					var buffer = _.buffer(hex,'hex')
						,bufferArray = _.bufferToArray(buffer)
						,xpubkey = (new BIP32(bufferArray)).extended_public_key_string()


					Vendor.getFromXpubkeyPromise(xpubkey).then(function(vendor){
						var vendorDatas = storage.get('vendorDatas') ? storage.get('vendorDatas') : []
						vendorDatas.push(vendor.data)

						storage.save('vendorDatas',vendorDatas)
						storage.save('vendorDatasSyncedAt',(new Date).getTime())
						$scope.vendors.push(vendor)
					})
				})

		})

	}

})