Blocks = new Meteor.Collection("blocks");
Order = new Meteor.Collection("order");

//Meteor Client operates on the browser side
if (Meteor.isClient) { 
  
  //Reactive variable when the popup is triggered 
  Session.set('openPopup', false);
}

//Meteor server is used to run server exclusive calls, in our case the mongo updates and http call must be done on server side  
if (Meteor.isServer) { 
   Meteor.startup(function () {
    Meteor.methods({
		  checkTwitter: function (url) {
				this.unblock();
				console.log(url);
				return Meteor.http.call('GET', 'https://api.twitter.com/1/statuses/oembed.xml?url='+url);
			}, 
      updateblock: function (blockname, value) {
       Blocks.update({ _id: blockname }, { $addToSet: { tags: value } });       
      },
      updateOrder: function (blockname, value) {       

       var order = Order.find({ id: blockname }).fetch();

       if(order.length == 0){
          var orderArray = [];
          orderArray.push(value);
          Order.insert({ id: blockname, Order : orderArray });
       }else{
          Order.update({ id: blockname }, { $addToSet: { Order: value } }); 
       }      
      },     
      updateBlockFullText: function (blockname, value) {
       Blocks.update({ _id: blockname }, { $set: { text: value } });
      },
  	  removeBlock: function(blockname){
  		 Blocks.remove({ _id: blockname });
  	  }
    });
  });
}