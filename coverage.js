Blocks = new Meteor.Collection("blocks");
Order = new Meteor.Collection("order");

//Meteor Client operates on the browser side
if (Meteor.isClient) {
  var container = {};

  //Reactive variable when the popup is triggered 
  Session.set('openPopup', false);
 
  //Container rendered is triggered when all the handlebars are rendered inside the Container Template
  //Here it will be initialized the datepicker on the filter bar on the top of the page
  Template.container.rendered = function () {     
    container = $(this.find("#container"));
    $("#datepicker").datepicker();
    $("#StartDate").datepicker({
        dateFormat: 'mm/dd/yy',
        changeMonth: true,
        changeYear: true,
        showOn: 'button',
        buttonImage: '../../calendar.jpg',
        onSelect: function (dateText, inst) {
            $('input#textfilter').val($("#StartDate").val());
            keypress();
            $('input#textfilter').trigger($.Event('keyup'));
        }
    });
	}

  //Helpers are used to get data on the template
  //When the 'openPopup' is set using 'Session.set('openPopup', true)' (or false) this function will be triggered ('this happens because session variables 
  //are reactive, in other words when a variable is set it triggers all the 'gets' for that variable)
  Template.page.helpers({    
    ShowPopup: function(){
      return Session.get('openPopup'); 
    }
  });     
  
  //This events used to hide the popup when we click outside of popup borders  
  //The Avgrund is a library used to show the popup, making the blur, the zoom out effect and the popup it self  
  Template.page.events = {
    'click .avgrund-cover': function (event) {
        $().Avgrund.hide();
        Session.set('openPopup', false);
    }
  }


  //Here is were magic happens, this function is triggered each time a block is built. 
  Template.block.rendered = function () {

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
                    cornerStampSelector: '.corner-stamp'
                },
                getSortData: {
                    name: function ($elem) {
                        return $elem.find('.title').text();
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

  //Event used to filter by text
  Template.filter.events = {
    'keypress  input#textfilter': function (event) {
         keypress();
    }  
  }

  //This function triggers when the page is reloaded or there are new, updated or deleted data on the mongo collection
  Template.container.blocks = function () {      
    return Blocks.find({},{sort : {num : 1}});
  };


  Template.block.helpers({
    //EditTextMode is triggered when the block is set for edit
    EditTextMode : function(id) {
      return id == Session.get("selectedToEditId");
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
        Session.set("selectedToEditId", this._id);
    },
    //Triggers when cancel is clicked in the edit text on a block
    'click .Fulltext .cancel': function (event) {
        Session.set("selectedToEditId", "");
    },
    //Triggers when add is clicked in the edit text on a block
    'click .Fulltext .add': function (event) {
        var blockname = event.currentTarget.parentElement.parentElement.id;
        var value = event.currentTarget.parentElement.children["fullTextEdit"].value;

        updateFullText(blockname, value);
        Session.set("selectedToEditId", "");
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
  
  //Triggers when a block is destroyed (is deleted in mongo)
  Template.block.destroyed = function () {
    console.log("Running destroy for block " + this.data.num);
    container.isotope({sortBy: "name"});
  }  

  //Triggers when close is clicked in the popup
  Template.Popup.events({
    'click .close': function (event) {
      $().Avgrund.hide();
      Session.set('openPopup', false);
      $(this.find("#container")).removeClass('avgrund-active' );
    }  
  }); 

  //Popup is renderd. The popup effect is triggered and the window is set in place with the distance from the top
  Template.Popup.rendered = function () {     
    var openPopup = Deps.nonreactive(function () { return Session.get('openPopup'); });
    if(openPopup) {
      $().Avgrund.show( "#default-popup" );
      
      var screenTop = $(window).scrollTop();
      $('.avgrund-popup').css('top', screenTop*1.1);
    }
    else
      $().Avgrund.hide();
  }

  //Get the popup data selected
  Template.Popup.values = function () {  
    return Session.get('selectedData');
  };
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

function keypress(){
    var searchtext =Session.get("SearchText");
    if (!searchtext) 
      searchtext="";

   $('input#textfilter').quicksearch('#container .item', {
        'show': function() {
            $(this).addClass('quicksearch-match');
        },
        'hide': function() {
            $(this).removeClass('quicksearch-match');
        },
        onAfter: function() {
          setTimeout( function() {
              container.isotope({ filter: '.quicksearch-match'+searchtext }).isotope(); 
          }, 100 );
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

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
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
