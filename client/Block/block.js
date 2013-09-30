var container = {};

if (Meteor.isClient) { 
	//This function is triggered each time a block is built. 
	Template.block.rendered = function () {
		container = $(document).find("#container");

		//Each block has the the class 'item'    
		var items = container.find(".item");

		//Checks if the block is new
		//If it is, it will assign it as an isotope block
		if ((!container.hasClass("isotope")) && (items.length == Blocks.find().count())) {

		    //Waits for the images to be loaded
		    container.imagesLoaded(function () {

		        //Assign all the blocks that has 'item' class as an isotope
		        container.isotope({
		            itemSelector: '.item',
		            masonry: {
		                columnWidth: 120,
		                gutterWidth: 20,
		                cornerStampSelector: '.corner-stamp'
		            },
		            getSortData: {
		                name: function ($elem) {
		                    return $elem.find('.title')[0].innerText;
		                }
		            }
		        });
		    });

		    //And sort by name 
		    container.isotope({
		        sortBy: "name"
		    }).isotope();
		} else if (container.hasClass("isotope")) {
		    //if there are no new blocks, then the block was updated, it will need to be updated by isotope also

		    container.isotope('reloadItems').isotope();
		    console.log("Updating isotope");
		    container.imagesLoaded(function () {
		        container.isotope('addItems', $(this.find(".item:not(.isotope-item)")), function () {
		            container.isotope();
		        });
		    });

		    var _id = this.data._id;

		    //the nonreactive function, assigns the Session.get not to react when a set is done, for instance if the popup is opened the 
		    //'Template.block.rendered' is triggered as the block was updated, and we don't want that
		    var nonReactiveOpenPopup = Deps.nonreactive(function () {
		        return Session.get('openPopup');
		    });

		    //if the Popup is not opened, we want the block to glow green for 3 seconds 
		    if (!nonReactiveOpenPopup) {
		        $(".avgrund-contents " + "#" + _id).addClass("glow");

		        setTimeout(function () {
		            $(".avgrund-contents " + "#" + _id).removeClass("glow");
		        }, 3000);
		    }
		}

		//filtrify is library used to filter all the blocks that has data-tags assigned to it. It will get all the data from the DOM and build 
		//the filters with the number of tags it finds
		//The callback function will trigger the isotope filter with the matching tags
		$.filtrify("container", "placeHolder", {
		    hide: false,
		    callback: function (query, match, mismatch) {
		        container.isotope({
		            filter: $(match)
		        });
		    }
		});

		//changes the filter label name
		$(".ft-label")[0].innerText = "Click to filter by Tags";

		//Sorts the filter by the number of block found with the same tag
		$(".ft-tags li").sort(function (a, b) {
		    var emA = parseInt($(b)[0].attributes['data-count'].value);
		    var emB = parseInt($(a)[0].attributes['data-count'].value);
		    if (emA == emB) {
		        return $(b)[0].textContent.toLowerCase() > $(a)[0].textContent.toLowerCase() ? -1 : 1;
		    }
		    return emA > emB ? 1 : -1;
		}).appendTo('ul.ft-tags');
	}

	//Triggers when a block is destroyed (is deleted in mongo)
	Template.block.destroyed = function () {
		console.log("Running destroy for block " + this.data.num);
		container.isotope({sortBy: "name"});
	}

	Template.block.events({  
		'click .remove':function (event){
			var blockname = event.currentTarget.parentElement.parentElement.id;
			removeBlock(blockname);
		},
		//Triggers when the add tag is clicked on a block
		'click .addnewtag .add': function (event) {
		    var blockname = event.currentTarget.parentElement.parentElement.parentElement.id;
		    var value = event.currentTarget.parentElement.children["textTag"].value;

		    updateTag(blockname, value);
		},
		'click .addneworder .addOrder': function (event) {
		    var blockname = event.currentTarget.parentElement.parentElement.parentElement.id;
		    var value = event.currentTarget.parentElement.children["textOrder"].value;

		    updateOrder(blockname, value);
		},
		//Triggers when edit text is clicked on a block
		'click .editText': function (event) {
		    Session.set(this._id, this._id);
		},
		//Triggers when cancel is clicked in the edit text on a block
		'click .Fulltext .cancel': function (event) {
			var blockname = event.currentTarget.parentElement.parentElement.id;
		    Session.set(blockname, "");
		},
		//Triggers when add is clicked in the edit text on a block
		'click .Fulltext .add': function (event) {
		    var blockname = event.currentTarget.parentElement.parentElement.id;
		    var value = event.currentTarget.parentElement.children["fullTextEdit"].value;

		    updateFullText(blockname, value);
		    Session.set(blockname, "");
		},
		//Triggers when any key is pressed, updates the tag when Enter is pressed in the edit text on a block
		'keypress input': function (event) {
		    if (event.charCode == 13) {
		        var blockname = event.currentTarget.parentElement.parentElement.parentElement.children["value"].innerText;
		        var value = event.currentTarget.parentElement.children["textTag"].value;

		        updateTag(blockname, value);
		    }
		},
		//set OpenPopup to true when the image is clicked
		'click .image': function (event) {
		    Session.set('selectedData', this);
		    Session.set('openPopup', true);
		},
		//set OpenPopup to true when the title is clicked
		'click .title': function (event) {
		    Session.set('selectedData', this);
		    Session.set('openPopup', true);
		}
	});

	Template.block.helpers({
		//EditTextMode is triggered when the block is set for edit
		EditTextMode : function(id) {
		  return id == Session.get(id);
		},   
		//checkes if the block rendered has an image
		IsImage: function(type, img){
		  if(type == 'image' && img != undefined && img != '')
		    return true;
		  else
		    return false;
		},
		//checkes if the block rendered has a video
		IsVideo: function(type, img){
		  if(type == 'video'&& img != undefined && img != '')
		    return true;
		  else
		    return false;
		},
		//checkes if the block rendered has a tweet
			IsTweet: function(type, url){
				if(type == 'tweet'&& url != undefined && url != '')
					return true;
				else
					return false;
			},
		//Loads the tweet and injects the twitter html reponse
			LoadTweet: function(url){
				checkTwitter(this.img,this._id);		
			},
		//Gets all the tags assigned to a block
		Tags: function(url){
		  var tags = [];
		  var myStringArray = this.tags;
		  if(myStringArray)
		  {
		    for (var i = 0; i < myStringArray.length; i++) {
		      if(i == 0)
		        tags.push(myStringArray[i]);
		      else
		        tags.push(" " + myStringArray[i]);
		    }
		    return tags;
		  }
		  return [];
		},
		//Gets all the Orders from Orders collections that match the block ID
		GetOrder: function(id){
		  var order = [];
		  var myStringArray =  Order.findOne({ id : id});
		  if(myStringArray)
		  {
		    for (var i = 0; i < myStringArray.Order.length; i++) {
		      if(i == 0)
		        order.push(myStringArray.Order[i]);
		      else
		        order.push(" " + myStringArray.Order[i]);
		    }
		    return order;
		  }
		  return [];
		}
	});
}

function updateTag(blockname,value){
   if(value != ""){   
     Meteor.call('updateblock', blockname, value , function(err,response) {
      if(err) {
        Session.set('serverDataResponse', "Error:" + err.reason);
        return;
      }
      Session.set('serverDataResponse', response);
    });
    }

    container.find('input#textTag').each(function() {
        $(this).val('');
    });
    var nonReactiveOpenPopup = Deps.nonreactive(function () { return Session.get('openPopup'); });
    if(nonReactiveOpenPopup)
    {
      $("#default-popup").find('input#textTag').each(function() {
        var values = Deps.nonreactive(function () { return Session.get('selectedData'); });
        if(!values.tags)
        {
          values.tags=[];
        } 
        if (values.tags.indexOf($(this).val())==-1)
        {
          values.tags.push($(this).val());
          Session.set('selectedData',values);
        }
        $(this).val('');
      });
    }
}

function updateOrder(blockname,value){
   if(value != ""){   
     Meteor.call('updateOrder', blockname, value , function(err,response) {
      if(err) {
        Session.set('serverDataResponse', "Error:" + err.reason);
        return;
      }
      Session.set('serverDataResponse', response);
    });
    }

    container.find('input#textOrder').each(function() {
        $(this).val('');
    });
    /*var nonReactiveOpenPopup = Deps.nonreactive(function () { return Session.get('openPopup'); });
    if(nonReactiveOpenPopup)
    {
      $("#default-popup").find('input#textTag').each(function() {
        var values = Deps.nonreactive(function () { return Session.get('selectedData'); });
        if(!values.tags)
        {
          values.tags=[];
        } 
        if (values.tags.indexOf($(this).val())==-1)
        {
          values.tags.push($(this).val());
          Session.set('selectedData',values);
        }
        $(this).val('');
      });
    }*/
}
function updateFullText(blockname,value){
   if(value != ""){   
       Meteor.call('updateBlockFullText', blockname, value , function(err,response) {
        if(err) {
          Session.set('serverDataResponse', "Error:" + err.reason);
          return;
        }
        Session.set('serverDataResponse', response);
      });
      var nonReactiveOpenPopup = Deps.nonreactive(function () { return Session.get('openPopup'); });
      if(nonReactiveOpenPopup)
      {
        var values = Deps.nonreactive(function () { return Session.get('selectedData'); });
        if(values.text != value)
        {
          values.text=value;
          Session.set('selectedData',values);
        }
      }
    }

}

function checkTwitter(url, id){
   if(url != ""){     
      Meteor.call('checkTwitter', url , function(err,response) {
        if(err) {
          Session.set('serverDataResponse', "Error:" + err.reason);
          return;
        }
    	  var xml = response.content;
    	  var xmlDoc = $.parseXML( xml );
    	  var $xml = $( xmlDoc );
    	  var $html = $xml.find("html").text();    	  
        Session.set('serverDataResponse', response);

        var nonReactiveOpenPopup = Deps.nonreactive(function () { return Session.get('openPopup'); });

        if(!nonReactiveOpenPopup){
          $("#" + id + " #tweet").html($html);
          setTimeout( function() {
            container.isotope('reloadItems').isotope(); 
          }, 10000 );    
        }
        else
        {
          $("#default-popup #" + id + " #tweet").html($html);
        }
      });  
    }
}

function removeBlock(blockname){
	if(blockname != ""){   
		   Meteor.call('removeBlock', blockname, function(err,response) {
			if(err) {
			  Session.set('serverDataResponse', "Error:" + err.reason);
			  return;
			}
			Session.set('serverDataResponse', response);
		  });

	}
}