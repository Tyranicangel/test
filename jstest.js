app.controller('OwnerMapCtrl', ['$scope','$http','$rootScope','$q','Commas', function ($scope,$http,$rootScope,$q,Commas) {
	$rootScope.showloader=true;
	$scope.map = { center: { latitude: 17.424986, longitude: 78.475428 }, zoom: 13 };
	$scope.mainmarkers=[];
	$scope.assetfilter='data.data.original_price';
	$scope.basic = true;
	$scope.eachmarkershow = false;
	$scope.eachmarker = [];
	$scope.addcampdets = true;
	$scope.campabstruction = true;
	$scope.bokngicndets = false;
	$scope.camp = {};
	$scope.currentdate = '2015-04-07';
	

	// $scope.$watch
	

	var markerlist=[];
	var typelisttrue = [];
	var loclisttrue = [];
	var vislisttrue = [];

	$scope.assetcount = 0;
	$scope.highlow = 'lowtohigh';
	
	$q.all([
		$http({
			method:'GET',
			url:$rootScope.apiend+'/getalldata',
			headers:{'JWT-AuthToken':localStorage.omtoken},
		}).success(function(result){
			
			$scope.citylist=result['city']; //city
			for(var i=0;i<result['city'].length;i++)
			{
				if(result['city'][i]['id']==1)
				{
					$scope.maincity=result['city'][i];
				}
			}

			$scope.visibilitylist=result['visibility']; //vis
			for(var i=0;i<result['visibility'].length;i++)
			{
				result['visibility'][i]['check']=true;
				vislisttrue.push(result['visibility'][i]['id']);
			}

			$scope.losminlist = [];  	//los
			$scope.losmaxlist = [];

			angular.forEach(result['los'],function(x){
				if(x.losflag=='1')
				{
					$scope.losmaxlist.push(x);
				}
				else
				{
					$scope.losminlist.push(x);
				}
			});

			$scope.tosminlist = [];		//tos
			$scope.tosmaxlist = [];

			angular.forEach(result['tos'],function(x){
				if(x.tosflag=='1')
				{
					$scope.tosmaxlist.push(x);
				}
				else
				{
					$scope.tosminlist.push(x);
				}
			});

			$scope.footminlist = [];		//footfall
			$scope.footmaxlist = [];

			angular.forEach(result['footfall'],function(x){
				if(x.mmflag=='1')
				{
					$scope.footmaxlist.push(x);
				}
				else
				{
					$scope.footminlist.push(x);
				}
			});

			$scope.priceminlist = [];		//price
			$scope.pricemaxlist = [];

			angular.forEach(result['price'],function(x){
				if(x.mmflag=='1')
				{
					$scope.pricemaxlist.push(x);
				}
				else
				{
					$scope.priceminlist.push(x);
				}
			});

			$scope.bpminlist = [];		//bp
			$scope.bpmaxlist = [];

			angular.forEach(result['bp'],function(x){
				if(x.mmflag=='1')
				{
					$scope.bpmaxlist.push(x);
				}
				else
				{
					$scope.bpminlist.push(x);
				}
			});

			for(var i=0;i<result['type'].length;i++)
			{
				result['type'][i]['check']=true;
				typelisttrue.push(result['type'][i]['id']);
			}
			$scope.typelist=result['type'];
			
		})

	]).then(function(){
		$scope.get_assets_localities_data($scope.maincity);
		$scope.getcampaigns();
		$scope.losmin = 0;
		$scope.losmax = 700;
		$scope.tosmin = 0;
		$scope.tosmax = 20;
		$scope.footmin = 0;
		$scope.footmax = 400000;
		$scope.pricemin = 0;
		$scope.pricemax = 600000;
		$scope.bpmin = 0;
		$scope.bpmax = 10;

		var today = new Date();
		var res = today.toISOString().substring(0, 10);

		var dt = new Date(today);
		dt.setMonth(dt.getMonth()+4);
		var tml = dt.toISOString().substring(0, 10);

		$scope.fromdate = res;
		$scope.tilldate = tml; //change these

	});


	$(document).click(function(e){
		if($(e.target).parents('.assetshow').length==0)
		{
			$scope.assetshow=false;
		}
		if($(e.target).parents('.availshow').length==0)
		{
			$scope.availshow=false;
		}
		if($(e.target).parents('.cityshow').length==0)
		{
			$scope.cityshow=false;
		}
		if($(e.target).parents('.localshow').length==0)
		{
			$scope.localshow=false;
		}
		if($(e.target).parents('.visibshow').length==0)
		{
			$scope.visibshow=false;
		}
		if($(e.target).parents('.losshow').length==0)
		{
			$scope.losshow=false;
		}
		if($(e.target).parents('.tosshow').length==0)
		{
			$scope.tosshow=false;
		}
		if($(e.target).parents('.footshow').length==0)
		{
			$scope.footshow=false;
		}
		if($(e.target).parents('.priceshow').length==0)
		{
			$scope.priceshow=false;
		}
		if($(e.target).parents('.buyingshow').length==0)
		{
			$scope.buyingshow=false;
		}
		$scope.$apply();
	});

	$scope.get_assets_localities_data = function(city)
	{
		$http({
			method:'GET',
			url:$rootScope.apiend+'/getlocalitiesandassets',
			headers:{'JWT-AuthToken':localStorage.omtoken},
			params:city
		}).success(function(result){
			$scope.assets = result['assets'];
			markerlist = [];
			markerindex = {};
			for (var i = 0; i < $scope.assets.length; i++) {
				var m={};
				m.id=$scope.assets[i].id;
				m.coords={latitude:$scope.assets[i].data.latitude,longitude:$scope.assets[i].data.longitude};
				m.data = $scope.assets[i];
				markerindex[m.id] = i;
				$scope.assets[i].los = angular.copy(Math.round($scope.assets[i].los * 100)/100);
				$scope.assets[i].tos = angular.copy(Math.round($scope.assets[i].tos * 100)/100);
				var freedates = [];
				if($scope.assets[i].booking.length==0)
				{
					freedates.push(["2000","9999"]);
				}
				else
				{
				for (var j = 0;j<$scope.assets[i].booking.length; j++) {
						if(j==0)
						{
							if($scope.assets[i].booking[j]['bookingstart'] > $scope.todate)
							{
								freedates.push(["2000",$scope.assets[i].booking[j]['bookingstart']]);
							}
						}
						else
						{
							if(Date.daysBetween($scope.assets[i].booking[j-1]['bookingend'],$scope.assets[i].booking[j]['bookingstart']) >1)
							{
								freedates.push([$scope.assets[i].booking[j-1]['bookingend'],$scope.assets[i].booking[j]['bookingstart']]);
							}
						}
						if(j==$scope.assets[i].booking.length-1)
						{
								freedates.push([$scope.assets[i].booking[j]['bookingend'],"9999"]);
						}
					
					};
				}
				$scope.assets[i].freedates = freedates;
				markerlist.push(m);
			};

			$scope.markerinit = {onload:intifunc()};
			
			function intifunc()
			{
				$rootScope.showloader=false;
			} 

			$scope.mainmarkers=angular.copy(markerlist);
			angular.forEach($scope.mainmarkers,function(x){
				$scope.assetcount++;
			});


			$scope.localitylist=result['locality'];
			for(var i=0;i<result['locality'].length;i++)
			{
				result['locality'][i]['check']=true;
				loclisttrue.push(result['locality'][i]['id']);
			}

			$scope.primecount = 0;
			angular.forEach(result['locality'],function(x){
				if(x.primeflag=='1')
				{
					$scope.primecount++;
				}
			});
		})

	}

	$scope.check_all_types=function(){
		var val=!$scope.checked_all_types();
		angular.forEach($scope.typelist,function(type){
			type.check=val;
		});

		$scope.change_types();
		$scope.change_markers();

	}

	$scope.checked_all_types=function(){
		var flag=1;
		count=0;
		if($scope.typelist)
		{
			angular.forEach($scope.typelist,function(type){
				if(type.check)
				{
					count++;
				}
			});
			if(count==0)
			{
				$scope.type_error="Please select atleast one asset type.";
			}
			else
			{
				$scope.type_error='';
			}
			return count===$scope.typelist.length;
		}
		else
		{
			return false;
		}
	}


	Date.daysBetween = function( date1, date2 ) {
	  //Get 1 day in milliseconds
	  var one_day=1000*60*60*24;

	  // Convert both dates to milliseconds
	  var date1_ms = new Date(date1);
	  date1_ms = date1_ms.getTime();

	  var date2_ms = new Date(date2);
	  date2_ms = date2_ms.getTime();

	  // Calculate the difference in milliseconds
	  var difference_ms = date2_ms - date1_ms;
	    
	  // Convert back to days and return
	  return Math.round(difference_ms/one_day); 

	}


	$scope.check_all_types_loc=function(){
		var val=!$scope.checked_all_types_loc();
		angular.forEach($scope.localitylist,function(type){
			type.check=val;
		});

		$scope.change_locality();
		$scope.change_markers();
	}


	$scope.checked_all_types_loc=function(){
		var flag=1;
		count=0;
		if($scope.localitylist)
		{
			angular.forEach($scope.localitylist,function(type){
				if(type.check)
				{
					count++;
				}
			});


			if(count==0)
			{
				$scope.type_error_loc="Please select atleast one locality.";
			}
			else
			{
				$scope.type_error_loc='';
			}
			return count===$scope.localitylist.length;
		}
		else
		{
			return false;
		}
	}


	$scope.check_all_types_loc_prime=function(){
		var val=!$scope.checked_all_types_loc_prime();
		angular.forEach($scope.localitylist,function(type){
			if(type.primeflag=='1')
			{
				type.check=val;
			}else
			{
				type.check = false;
			}
		});

		$scope.change_locality();
		$scope.change_markers();
	}


	$scope.checked_all_types_loc_prime=function(){
		
		count1=0;
		count2 = 0;

		if($scope.localitylist)
		{
			angular.forEach($scope.localitylist,function(type){
				if(type.check)
				{
					if(type.primeflag=='1')
					{
						count2++;
					}

					count1++;
				}
			});

			if(count1 == count2 && count2==$scope.primecount)
			{
				return true;
			}else
			{
				return false;
			}

		}
		else
		{
			return false;
		}
	}


	$scope.check_all_types_vis=function(){
		var val=!$scope.checked_all_types_vis();
		angular.forEach($scope.visibilitylist,function(type){
			type.check=val;
		});

		$scope.change_visibility();
		$scope.change_markers();
	}

	$scope.checked_all_types_vis=function(){
		
		count=0;
		if($scope.visibilitylist)
		{
			angular.forEach($scope.visibilitylist,function(type){
				if(type.check)
				{
					count++;
				}
			});
			if(count==0)
			{
				$scope.type_error_vis="Please select atleast one type of visibility!";
			}
			else
			{
				$scope.type_error_vis='';
			}
			return count===$scope.visibilitylist.length;
		}
		else
		{
			return false;
		}
	}

	
	


	$scope.change_city=function(city){
		$scope.map.center={latitude:city.latitude,longitude:city.longitude};
		$scope.maincity=city;
		$scope.change_markers();
		//change localities here - get loc list
		//change markers here - get markers list
		// remove all filters
	}

	
	$scope.change_types = function()
	{
		typelisttrue = [];
		angular.forEach($scope.typelist,function(x){
			if(x.check==true)
			{
				typelisttrue.push(x.id);
			}
		});
	}

	
	$scope.change_locality = function()
	{		
		loclisttrue = [];
		angular.forEach($scope.localitylist,function(x){
			if(x.check==true)
			{
				loclisttrue.push(x.id);
			}
		});
	}

	
	$scope.change_visibility = function()
	{		
		vislisttrue = [];
		angular.forEach($scope.visibilitylist,function(x){
			if(x.check==true)
			{
				vislisttrue.push(x.id);
			}
		});
	}

	$scope.$watch('fromdate',function(){
		if(!$scope.fromdate)
		{
			
		}
		else
		{
			$scope.change_markers();
		}
	});

	$scope.$watch('tilldate',function(){
		if(!$scope.tilldate)
		{
			
		}
		else
		{
			$scope.change_markers();
		}
	});

	$scope.change_markers=function(){
		if($scope.assets)
		{
			var new_markerlist = [];
			$rootScope.showloader = true;
			$scope.bokngicndets = true;
			$scope.cls_each_asst();

			$scope.assetcount = 0;

			
			for (var i = $scope.assets.length - 1; i >= 0; i--) {
				
				if(typelisttrue.indexOf($scope.assets[i]['type_id'])>-1)
				{
					
				}
				else
				{
					continue;
				}

				if(loclisttrue.indexOf($scope.assets[i]['locality_id'])>-1)
				{
					
				}
				else
				{
					continue;
				}

				if(vislisttrue.indexOf($scope.assets[i]['visid'])>-1)
				{
					
				}
				else
				{
					continue;
				}

				if(parseFloat($scope.assets[i]['los'])>=parseFloat($scope.losmin) && parseFloat($scope.assets[i]['los'])<=parseFloat($scope.losmax))
				{

				}else
				{
					continue;
				}

				if(parseFloat($scope.assets[i]['tos'])>=parseFloat($scope.tosmin) && parseFloat($scope.assets[i]['tos'])<=parseFloat($scope.tosmax))
				{

				}else
				{
					continue;
				}


				if(parseFloat($scope.assets[i]['footfall'])>=parseFloat($scope.footmin) && parseFloat($scope.assets[i]['footfall'])<=parseFloat($scope.footmax))
				{

				}else
				{
					continue;
				}

				if(parseFloat($scope.assets[i]['price'])>=parseFloat($scope.pricemin) && parseFloat($scope.assets[i]['price'])<=parseFloat($scope.pricemax))
				{

				}else
				{
					continue;
				}

				if(parseFloat($scope.assets[i]['bp'])>=parseFloat($scope.bpmin) && parseFloat($scope.assets[i]['bp'])<=parseFloat($scope.bpmax))
				{

				}else
				{
					continue;
				}

				//write dates ka logic here
				
				var fromdate = $scope.fromdate;
				var todate = $scope.tilldate;

				var bookstatus='booked';

				for (var j = 0; j < $scope.assets[i]['freedates'].length; j++) {

					if(fromdate >$scope.assets[i]['freedates'][j][0] && fromdate < $scope.assets[i]['freedates'][j][1])
					{
						if(todate<$scope.assets[i]['freedates'][j][1])
						{
							bookstatus = 'free';
							break;
						}
						else
						{
							bookstatus = 'partial';
							break;
						}
					}
					else if(fromdate<=$scope.assets[i]['freedates'][j][0])
					{
						if(todate>=$scope.assets[i]['freedates'][j][0])
						{
							bookstatus = 'partial';
							break;
						}
					}
					
				};
				//console.log(bookstatus);

				$scope.assets[i]['bookingstatus'] = bookstatus;
				if($scope.assets[i]['bookingstatus'] == 'free'|| $scope.assets[i]['bookingstatus']=='partial')
				{

				}
				else
				{
					continue;
				}

				var m={};
				m.id=$scope.assets[i].id;
				m.coords={latitude:$scope.assets[i].data.latitude,longitude:$scope.assets[i].data.longitude};
				m.data=$scope.assets[i];
				// m.icon = 'images/hicon.png';
				
				new_markerlist.push(m);
			}
			
			//console.log(new_markerlist);
			$scope.mainmarkers=angular.copy(new_markerlist);
			angular.forEach($scope.mainmarkers,function(x){
				$scope.assetcount++;
			});
			

			$scope.map.zoom=12;
			$scope.map.center={latitude:$scope.maincity.latitude,longitude:$scope.maincity.longitude};
			$rootScope.showloader = false;

		}
	}

	$scope.marker_change_func = function(marker)
	{
		//console.log(marker);

		if($scope.activemarker == marker.id)
		{
			if(marker.data.types.type=='Hoarding')
			{
				return 'images/hactive.png';
			}
			else if(marker.data.types.type=='Unipoles')
			{
				return 'images/uactive.png';
			}
			else if(marker.data.types.type=='Foot Bridge')
			{
				return 'images/factive.png';
			}
			else if(marker.data.types.type=='Central Meridian')
			{
				return 'images/cactive.png';
			}
			else if(marker.data.types.type=='Bus Shelter')
			{
				return 'images/bactive.png';
			}
		}

		if($scope.activemarker != marker.id && marker.data.bookingstatus=="free")
		{
			if(marker.data.types.type=='Hoarding')
			{
				return 'images/hfree.png';
			} 
			else if(marker.data.types.type=='Unipoles')
			{
				return 'images/ufree.png';
			}
			else if(marker.data.types.type=='Foot Bridge')
			{
				return 'images/ffree.png';
			}
			else if(marker.data.types.type=='Central Meridian')
			{
				return 'images/cfree.png';
			}
			else if(marker.data.types.type=='Bus Shelter')
			{
				return 'images/bfree.png';
			}
			// write for everything
		}

		if($scope.activemarker != marker.id && marker.data.bookingstatus=="partial")
		{
			if(marker.data.types.type=='Hoarding')
			{
				return 'images/hpartial.png';
			}
			else if(marker.data.types.type=='Unipoles')
			{
				return 'images/upartial.png';
			}
			else if(marker.data.types.type=='Foot Bridge')
			{
				return 'images/fpartial.png';
			}
			else if(marker.data.types.type=='Central Meridian')
			{
				return 'images/cpartial.png';
			}
			else if(marker.data.types.type=='Bus Shelter')
			{
				return 'images/bpartial.png';
			}
			//write for everything
		}

		if(marker.data.types.type=='Hoarding')
		{
			return 'images/hinit.png';
		}
		else if(marker.data.types.type=='Unipoles')
		{
			return 'images/uinit.png';
		}
		else if(marker.data.types.type=='Foot Bridge')
		{
			return 'images/finit.png';
		}
		else if(marker.data.types.type=='Central Meridian')
		{
			return 'images/cminit.png';
		}
		else if(marker.data.types.type=='Bus Shelter')
		{
			return 'images/bsinit.png';
		}
	}

	$scope.markerclick = function(marker)
	{
		
		$scope.eachmarker = marker;
		$scope.eachmarkershow = true;
		$scope.activemarker = marker.id;
	}

	$scope.center_pointer = function(data)
	{
		$scope.map = { center: { latitude: data.coords.latitude, longitude: data.coords.longitude }, zoom: 16 };
	}
	
	$scope.show_asset_dets = function(type)
	{
		$scope.basic = false;
		$scope.indicators = false;
		$scope.avail = false;

		if(type=='basic')
		{
			$scope.basic = true;
		}
		else if(type=='indicators')
		{
			$scope.indicators = true;
		}
		else if(type=='avail')
		{
			$scope.avail = true;
		}
	}

	$scope.cls_each_asst = function()
	{
		$scope.eachmarkershow = false;
		$scope.activemarker = '';
	}

	$scope.showslider=false;

	$scope.show_slideshow=function(){
		angular.forEach($scope.eachmarker.data.slideshow,function(slide){
			slide.imgactive=0;
		});
		$scope.sliderimg=$scope.eachmarker.data.slideshow[0].image_path;
		$scope.eachmarker.data.slideshow[0].imgactive=1;
		$scope.showslider=true;
	}

	$scope.close_slider=function(){
		$scope.showslider=false;
	}

	$scope.cls_bk_dets = function()
	{
		$scope.bokngicndets = false;
	}

	$scope.imgactive=function(slide)
	{
		if(slide.imgactive==1)
		{
			return 'imgactive';
		}
	}

	$scope.change_slider=function(slide)
	{
		if(slide.imgactive==0)
		{
			angular.forEach($scope.eachmarker.data.slideshow,function(slider){
				slider.imgactive=0;
			});
			slide.imgactive=1;
			$scope.sliderimg=slide.image_path;
		}
	}

	$scope.move_left=function(slide)
	{
		for(var i=0;i<$scope.eachmarker.data.slideshow.length;i++)
		{
			if($scope.eachmarker.data.slideshow[i].imgactive==1)
			{
				$scope.eachmarker.data.slideshow[i].imgactive=0;
				$scope.eachmarker.data.slideshow[i-1].imgactive=1;
				$scope.sliderimg=$scope.eachmarker.data.slideshow[i-1].image_path;
				break;
			}
		}
	}

	$scope.move_right=function(slide)
	{
		for(var i=0;i<$scope.eachmarker.data.slideshow.length;i++)
		{
			if($scope.eachmarker.data.slideshow[i].imgactive==1)
			{
				$scope.eachmarker.data.slideshow[i].imgactive=0;
				$scope.eachmarker.data.slideshow[i+1].imgactive=1;
				$scope.sliderimg=$scope.eachmarker.data.slideshow[i+1].image_path;
				break;
			}
		}
	}

	$scope.show_left=function(){
		if($scope.eachmarker.data.slideshow[0].imgactive==1)
		{
			return false;
		}
		else
		{
			return true;
		}
	}

	$scope.show_right=function(){
		var counter=0;
		var out=true;
		angular.forEach($scope.eachmarker.data.slideshow,function(slider){
			if(slider.imgactive==1)
			{
				if(counter==$scope.eachmarker.data.slideshow.length-1)
				{
					out=false;
				}
			}
			counter++;
		});
		return out;
	}

	$scope.show_add_camp_dets = function(type)
	{
		$scope.addcampdets = false;
		$scope.showastdets = false;
		$scope.showastavail = false;

		if(type=='add')
		{
			$scope.addcampdets = true;
		}
		else if(type=='details')
		{
			$scope.showastdets = true;
		}
		else if(type=='avail')
		{
			$scope.showastavail = true;
		}
	}

	$scope.show_camp_box = function(marker)
	{
		if($scope.ownercampaigns.length==0)
		{
			$scope.crtnewcamp = true;
			$scope.nocamp = true;
		}
		else
		{
			$scope.addcampaignbox = true;
			$scope.camp.disprice = marker.data.data.original_price;
			$scope.maincampaign = null;
			$scope.campabstruction = true;

			$scope.addcampdets = false;
			$scope.showastdets = false;
			$scope.showastavail = false;

			$scope.addcampdets = true;
			$scope.camp.fromdatecamp = '';
			$scope.camp.todatecamp = '';

			$scope.addcampsuccess = false;
		}
	}

	$scope.close_camp = function()
	{
		$scope.addcampaignbox = false;
	}

	$scope.create_new_camp = function()
	{
		$scope.crtnewcamp = true;
		$scope.addcampaignbox = false;
	}

	$scope.close_crt_camp = function()
	{
		$scope.crtnewcamp = false;
	}

	$scope.getcampaigns = function()
	{
		$http({
			method:'GET',
			url:$rootScope.apiend+'/getownercampaigns',
			headers:{'JWT-AuthToken':localStorage.omtoken},
		}).success(function(result){
			
			$scope.ownercampaigns = result;

			if($scope.maincampaign)
			{
				for (var i = 0; i < $scope.ownercampaigns.length; i++) {
					if($scope.maincampaign.id ==$scope.ownercampaigns[i]['id'])
					{
						$scope.maincampaign = $scope.ownercampaigns[i];
					}
				};
			}
			$rootScope.showloader = false;
		})
	}

	$scope.create_new_campaign_main = function()
	{
		$rootScope.showloader = true;
		$http({
			method:'POST',
			url:$rootScope.apiend+'/createcampagin',
			headers:{'JWT-AuthToken':localStorage.omtoken},
			data:{dat:$scope.campaignname}
		}).success(function(result){
			if(result=='success')
			{
				$scope.crtnewcamp = false;
				$scope.getcampaigns();
				$scope.addcampaignbox = true;
				$rootScope.showloader = false;
			}
			else
			{
				alert('Sorry something went wrong!');
			}
		})
	}

	$scope.add_asset_to_camp = function()
	{
		var freeflag=0;
		for (var i = 0; i < $scope.eachmarker.data.freedates.length; i++)
		{
			if($scope.camp.fromdatecamp>$scope.eachmarker.data.freedates[i][0] && $scope.camp.todatecamp<$scope.eachmarker.data.freedates[i][1])
			{
				freeflag=1;
			}
		};
		if(!$scope.camp.disprice || $scope.camp.disprice =='')
		{
			alert('Please enter a price!');
		}
		else if(!$scope.camp.fromdatecamp)
		{
			alert('Please select a from date which you want to book this asset from!');
		}
		else if(!$scope.camp.todatecamp)
		{
			alert('Please select a to date which you want to book this asset till!');
		}
		else if($scope.maincampaign==null)
		{
			alert('Please select a campaign you want to add this asset to!');
		}
		else if($scope.camp.fromdatecamp>$scope.camp.todatecamp)
		{
			alert('From Date cant be greater than till date!');
		}
		else if(freeflag==0)
		{
			alert('Sorry this asset is not available between those dates!');
		}
		else
		{

			$rootScope.showloader = true;
			$http({
				method:'POST',
				url:$rootScope.apiend+'/addtocampaign',
				headers:{'JWT-AuthToken':localStorage.omtoken},
				data:{dat:$scope.camp,id:$scope.maincampaign.id,marker:$scope.eachmarker}
			}).success(function(result){
				if(result=='success')
				{
					$scope.getcampaigns();
					$scope.addcampsuccess = true;
				}
				else if(result=='booked')
				{
					$rootScope.showloader = false;
					alert('Sorry this asset is already added to this campaign and is booked in between those dates!');
				}
				else
				{
					alert('Sorry something went wrong!');
				}
			})
		}
	}

	$scope.remove_asset_from_camp = function(data,index)
	{
		$rootScope.showloader = true;
		$http({
			method:'POST',
			url:$rootScope.apiend+'/removeassetfromcamp',
			headers:{'JWT-AuthToken':localStorage.omtoken},
			data:{dat:data}
		}).success(function(result){
			if(result=='success')
			{
				$rootScope.showloader = false;
				alert('Successfully deleted from campaign!');
				data.showmarker = true;
				$scope.maincampaign.campdets.splice(index,1);
			}
			else
			{
				alert('Sorry something went wrong!');
			}
		})
	}

	$scope.check_free = function(data)
	{
		filmarker = [];
		var assetid = data.asset_id;
		var markerind = markerindex[assetid];
		filmarker = markerlist[markerind];
		var out = 'booked';
		for (var i = 0; i < filmarker.data.freedates.length; i++) {
			if(data.bookfrom>filmarker.data.freedates[i][0])
			{
				if(data.bookto<filmarker.data.freedates[i][1])
				{
					out =  'free';
				}
			}
		};
		return out;
	}

}]);