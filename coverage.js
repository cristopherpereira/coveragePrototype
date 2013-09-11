Blocks = new Meteor.Collection("blocks");
Filters = new Meteor.Collection("filters");

if (Meteor.isClient) {
  var container = {};
  //Session.set("EditTextMode", false);
  Session.set("selectedToTextEditId", "");

  Template.container.rendered = function () {     
    container = $(this.find("#container"));   
  }
  Template.container.rendered = function () {
     
    container = $(this.find("#container"));
		$("#datepicker" ).datepicker();
		$("#StartDate").datepicker({
            dateFormat: 'mm/dd/yy',
            changeMonth: true,
            changeYear: true,
            showOn: 'button',
            buttonImage: '../../calendar.jpg',
            onSelect: function(dateText, inst) { 
					$('input#textfilter').val($("#StartDate").val());
					keypress();
					$('input#textfilter').trigger($.Event('keyup'));
				}
        });
}

  Template.container.blocks = function () {    
    return Blocks.find();
  }; 

  Template.block.rendered = function () {
    var items = container.find(".item");

    var myStringArray = this.data.tags;
    if(myStringArray)
    {
      for (var i = 0; i < myStringArray.length; i++) {
          $("#" + this.data._id).addClass(myStringArray[i]);
      }
    }
    // console.log("Running rendered for container with " + items.length + " blocks");
    if ((!container.hasClass("isotope")) && (items.length == Blocks.find().count())) {
      // This seems to run once per block. Wasteful.
      // console.log("Initialize isotope");
      // Initialize isotope
     
        container.imagesLoaded( function(){
        container.isotope({
          itemSelector : '.item',
           masonry: {
		   columnWidth: 120,
           cornerStampSelector: '.corner-stamp'
			
          },
          getSortData : {
            number : function( $elem ) {
              return $elem.find('#value').text();
            }
          }
        });
        });
     
    
      container.isotope({sortBy: "number"});
    } else if (container.hasClass("isotope")) {
      console.log("Updating isotope");
      container.imagesLoaded( function(){
      container.isotope('addItems', $(this.find(".item:not(.isotope-item)")), function() {
                container.isotope();
            });
      });

    }

    
  }

  Template.filter.events = {
    'keypress  input#textfilter': function (event) {
         keypress();
    },

    'click .filtertag': function (event) {
      var classname = event.currentTarget.value;
      classname = '.' + classname.replace(" ", ".");
      $(".filtertag").removeClass("selected");
      $(event.currentTarget).addClass("selected");
      Session.set("SearchText", classname);
      keypress();
    }

  }


  Template.container.blocks = function () {  
    return Blocks.find({},{sort : {num : 1}});
  };

  Template.block.helpers({
    EditTextMode : function(id) {
      return id == Session.get("selectedToEditId");
    },
    IsEdit: function(id){
      return id == Session.get("selectedToEditId");
    },
    AddClass: function() {      
      var myStringArray = this.tags;
      for (var i = 0; i < myStringArray.length; i++) {
          $("#" + this._id).addClass(myStringArray[i]);
      }
    },
    IsImage: function(type, img){
      if(type == 'image' && img != undefined && img != '')
        return true;
      else
        return false;
    },
    IsVideo: function(type, img){
      if(type == 'video'&& img != undefined && img != '')
        return true;
      else
        return false;
    },
	IsTweet: function(type, url){
		if(type == 'tweet'&& url != undefined && url != '')
			return true;
		else
			return false;
	},
	LoadTweet: function(url){
		checkTwitter(this.img,this._id);		
	}
  });    
  
  Template.block.events({
  'click .addnewtag .add': function (event) {
    var blockname = event.currentTarget.parentElement.parentElement.parentElement.id;//children["value"].innerText;
    var value = event.currentTarget.parentElement.children["textTag"].value;

    updateTag(blockname,value);
  },
  'click .editText': function (event) {
    //Template.block.EditTextMode = !Template.block.EditTextMode;
    //Session.set("EditTextMode", true);
    Session.set("selectedToEditId", this._id);
  },
  'click .Fulltext .cancel': function (event) {
    //Template.block.EditTextMode = !Template.block.EditTextMode;
    //Session.set("EditTextMode", true);
    Session.set("selectedToEditId", "");
  },
  'click .Fulltext .add': function (event) {
    var blockname = event.currentTarget.parentElement.parentElement.id;
    var value = event.currentTarget.parentElement.children["fullTextEdit"].value;

    updateFullText(blockname,value);
    Session.set("selectedToEditId", "");
  },
  

  'keypress input': function(event) {
      if (event.charCode == 13) {
          var blockname = event.currentTarget.parentElement.parentElement.parentElement.children["value"].innerText;
          var value = event.currentTarget.parentElement.children["textTag"].value;

          updateTag(blockname,value);
      }
  }
  
  }); 

  Template.block.destroyed = function () {
    console.log("Running destroy for block " + this.data.num);
    container.isotope({sortBy: "number"});
  }

   Template.filter.helpers({
    FiltersHelper: function() {
      return Filters.find({},{sort : {tag : 1}});
    }
  }); 
 }

if (Meteor.isServer) { 



   Meteor.startup(function () {
    Meteor.methods({
		checkTwitter: function (url) {
				this.unblock();
				console.log(url);
				return Meteor.http.call('GET', 'https://api.twitter.com/1/statuses/oembed.xml?url='+url);
			},
      updateblock: function (blockname, value) {
       Blocks.update({ _id: blockname }, { $push: { tags: value } });
       var tag = Filters.find({tag : value}).fetch();

       if(tag.length == 0){
          Filters.insert({tag : value});
       }
      },
      updateBlockFullText: function (blockname, value) {
       Blocks.update({ _id: blockname }, { $set: { text: value } });
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
	  $("#" + id + " #tweet").html($html);
      Session.set('serverDataResponse', response);
    });
    }

}
  
