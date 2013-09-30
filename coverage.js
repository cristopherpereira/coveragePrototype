Blocks = new Meteor.Collection("blocks");
Order = new Meteor.Collection("order");

//Meteor Client operates on the browser side
if (Meteor.isClient) { 
  
  //Reactive variable when the popup is triggered 
  Session.set('openPopup', false);

  centerMansory();
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

function centerMansory(blockname){
  $.Isotope.prototype._getCenteredMasonryColumns = function() {
    this.width = this.element.width();
    
    var parentWidth = this.element.parent().width();
    
                  // i.e. options.masonry && options.masonry.columnWidth
    var colW = this.options.masonry && this.options.masonry.columnWidth ||
                  // or use the size of the first item
                  this.$filteredAtoms.outerWidth(true) ||
                  // if there's no items, use size of container
                  parentWidth;
    
    var cols = Math.floor( parentWidth / colW );
    cols = Math.max( cols, 1 );

    // i.e. this.masonry.cols = ....
    this.masonry.cols = cols;
    // i.e. this.masonry.columnWidth = ...
    this.masonry.columnWidth = colW;
  };

  $.Isotope.prototype._masonryReset = function() {
    // layout-specific props
    this.masonry = {};
    // FIXME shouldn't have to call this again
    this._getCenteredMasonryColumns();
    var i = this.masonry.cols;
    this.masonry.colYs = [];
    while (i--) {
      this.masonry.colYs.push( 0 );
    }
  };

  $.Isotope.prototype._masonryResizeChanged = function() {
    var prevColCount = this.masonry.cols;
    // get updated colCount
    this._getCenteredMasonryColumns();
    return ( this.masonry.cols !== prevColCount );
  };

  $.Isotope.prototype._masonryGetContainerSize = function() {
    var unusedCols = 0,
        i = this.masonry.cols;
    // count unused columns
    while ( --i ) {
      if ( this.masonry.colYs[i] !== 0 ) {
        break;
      }
      unusedCols++;
    }
    
    return {
          height : Math.max.apply( Math, this.masonry.colYs ),
          // fit container to columns that have been used;
          width : (this.masonry.cols - unusedCols) * this.masonry.columnWidth
        };
  };
}