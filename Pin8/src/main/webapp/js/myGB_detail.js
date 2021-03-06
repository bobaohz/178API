(function($){
	$(document).ready(function() {
		var status = urlData("status");
		var shopId = urlData("id");
		var userInfo = sessionData("userInfo");
		var vm = new Vue({
			el: "body",
			data: {
				userInfo: userInfo,
				gbStatus: ['召集中','采购中','结算中','已结束'],
				statusIndex: status,
				gbDetail: '',
				owner: '',
				payStatus: false,
				valuation: '',
				valuateScore: 0,
				valuationText: ''
			},
			computed: {
				fullNum: function(){
					return parseInt(this.owner.credit);
				},
				halfNum: function(){
					if(this.owner.credit!=5){
						return this.owner.credit-parseInt(this.owner.credit);
					}
				},
				emptyNum: function(){
					if(this.owner.credit<=4){
						return 5-Math.ceil(this.owner.credit);
					}
				}
			},
			ready: function(){
				this.getShopDetail();
			},
			methods: {
				// activeStatus: function(i){
				// 	this.statusIndex = i;
				// },
				decrease: function(list){
					if(list.totalQuantity || list.totalQuantity.toString()!=""){
						list.totalQuantity--;
					}
				},
				increase: function(list){
					if((list.totalQuantity || list.totalQuantity.toString()!="") && list.totalQuantity<list.quantityLimit){
						list.totalQuantity++;
					}
				},
				submitPage1: function(){
					this.submitUpdate();
				},
				returnPage1: function(){
					location.href = "./myGB_quit.html?id="+shopId;
				},
				payPage3: function(){
					this.payStatus = true;
				},
				confirmPage3: function(){
					this.confirmReceive();
				},
				historyPage4: function(){

				},
				sharePage4: function(){

				},
				getShopDetail: function(){
					var self = this;
					$.ajax({
						type: 'POST',
						url: '../groupbuy/get',
						data: JSON.stringify({
							"userId": userInfo.id,
							"gbId":shopId
						}),
						dataType: 'json',
						contentType: 'application/json',
						success: function(result){
							if(result.status==0){
								self.gbDetail = result.bean;
								self.getOwner();
							}
							console.log("My gb detail:");
							self.$log("gbDetail");
						},
						error: function(result){
						  	console.log('error',result);
						}
					});
				},
				getOwner: function(){
					var self = this;
					$.ajax({
						type: 'POST',
						url: '../user/getUser',
						data: JSON.stringify({
							"id": self.gbDetail.createdBy
						}),
						dataType: 'json',
						contentType: 'application/json',
						success: function(result){
							if(result.status==0){
								self.owner = result.bean;
								if(self.statusIndex==3){
									self.getValuation();
								}
							}
							console.log("Owner infomation:");
							self.$log("owner");
						},
						error: function(result){
						  	console.log('error',result);
						}
					});
				},
				confirmReceive: function(){
					var self = this;
					$.ajax({
						type: 'POST',
						url: '../groupbuy/receive',
						data: JSON.stringify({
							"id": shopId
						}),
						dataType: 'json',
						contentType: 'application/json',
						success: function(result){
							if(result.status==0){
								console.log("Confirm receive successfully.");
								location.href = "./myGB_list.html";
							}
						},
						error: function(result){
						  	console.log('error',result);
						}
					});
				},
				submitUpdate: function(){
					var self = this;
					var items = [];
					for(var i=0;i<self.gbDetail.items.length;i++){
						items.push({
							"gbiId": self.gbDetail.items[i].id,
							"quantity": self.gbDetail.items[i].totalQuantity
						})
					}
					$.ajax({
						type: 'POST',
						url: '../groupbuy/participate',
						data: JSON.stringify({
							"gbId": shopId,
							"userId": userInfo.id,
							"items": items
						}),
						dataType: 'json',
						contentType: 'application/json',
						success: function(result){
							if(result.status==0){
								console.log("Submit update successfully.");
							}
						},
						error: function(result){
						  	console.log('error',result);
						}
					});
				},
				finishPay: function(){
					var self = this;
					$.ajax({
						type: 'POST',
						url: '../groupbuy/pay',
						data: JSON.stringify({
							"id": shopId
						}),
						dataType: 'json',
						contentType: 'application/json',
						success: function(result){
							if(result.status==0){
								console.log("Finish pay successfully.");
								location.href = "./myGB_detail.html?status=3&id="+shopId;
							}
						},
						error: function(result){
						  	console.log('error',result);
						}
					});
				},
				setValuateScore: function(e){
					this.valuateScore = $(e.target).index();
				},
				getValuation: function(){
					var self = this;
					$.ajax({
						type: 'POST',
						url: '../comm/getValuations',
						data: JSON.stringify({
						    "valuator": userInfo.id,
						    "valuatee": this.owner.id,
						    "eventType": "EVENT_GROUPBUY",
						    "eventId": shopId,
						    "valuateType": "GroupBuyOwner"
						}),
						dataType: 'json',
						contentType: 'application/json',
						success: function(result){
							if(result.status==0){
								self.valuation = result.bean;
								console.log("get valuation:");
								self.$log("valuation");
							}
						},
						error: function(result){
						  	console.log('error',result);
						}
					});
				},
				submitValuation: function(){
					var self = this;
					$.ajax({
						type: 'POST',
						url: '../comm/valuate',
						data: JSON.stringify({
						    "valuator": userInfo.id,
						    "valuatee": this.owner.id,
						    "eventType": "EVENT_GROUPBUY",
						    "eventId": shopId,
						    "valuateType": "GroupBuyOwner",
						    "detail": this.valuationText,
						    "scale": this.valuateScore
						}),
						dataType: 'json',
						contentType: 'application/json',
						success: function(result){
							if(result.status==0){
								self.valuation = result.bean;
								console.log("get valuation:");
								self.$log("valuation");
							}
						},
						error: function(result){
						  	console.log('error',result);
						}
					});
				},
				copyNumber: function(number) {
					var str = $("#"+number).text();
					var save = function(e){
				        e.clipboardData.setData('text/plain', str);
				        e.preventDefault();
				    }
				    document.addEventListener('copy', save);
				    document.execCommand('copy');
				    document.removeEventListener('copy',save);
				    alert('复制成功！');
				}
			}
		});
	});	
})(jQuery);
