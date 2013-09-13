Blocks = new Meteor.Collection("blocks");
Filters = new Meteor.Collection("filters");

if (Meteor.isClient) {
  var container = {};
  //Session.set("EditTextMode", false);
  Session.set("selectedToTextEditId", "");
  Session.set('openPopup', false);
 
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
  Template.page.helpers({    
    ShowPopup: function(){
      return Session.get('openPopup'); 
    }
  });     

  Template.page.events = {
    'click .avgrund-cover': function (event) {
        $().Avgrund.hide();
        Session.set('openPopup', false);
    }
  }

  Template.block.rendered = function () {
    var items = container.find(".item");

    var myStringArray = this.data.tags;
    if(myStringArray)
    {
      for (var i = 0; i < myStringArray.length; i++) {
          $(".avgrund-contents " + "#" + this.data._id).addClass(myStringArray[i]);
      }
    }
    
    if ((!container.hasClass("isotope")) && (items.length == Blocks.find().count())) {           
        container.imagesLoaded( function(){
        container.isotope({
          itemSelector : '.item',
           masonry: {
  		       columnWidth: 120,
             cornerStampSelector: '.corner-stamp'			
          },
          getSortData : {
            number : function( $elem ) {
              return $elem.find('.title').text();
            }
          }
        });
        });    
    
      container.isotope({sortBy: "number"}).isotope();
    } else if (container.hasClass("isotope")) {
      container.isotope('reloadItems').isotope(); 
      console.log("Updating isotope");
      container.imagesLoaded( function(){
      container.isotope('addItems', $(this.find(".item:not(.isotope-item)")), function() {
                container.isotope();
            });
      });

      var _id = this.data._id;

      var nonReactiveOpenPopup = Deps.nonreactive(function () { return Session.get('openPopup'); });

      if(!nonReactiveOpenPopup)
      {
        $(".avgrund-contents " + "#" + _id).addClass("glow");

        setTimeout( function() {
                $(".avgrund-contents " + "#" + _id).removeClass("glow");
        }, 3000 );
      }
    }  
  }

  Template.filter.events = {
    'keypress  input#textfilter': function (event) {
         keypress();
    },

    'click .filtertag': function (event) {
      var classname = event.currentTarget.value;
      classname = '.' + classname;

      classname = replaceAll(' ', '.', classname);

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
  	},
    Tags: function(url){
      var tags = [];
      var myStringArray = this.tags;
      if(myStringArray)
      {
        for (var i = 0; i < myStringArray.length; i++) {
            tags.push(" " + myStringArray[i]);
        }
        return tags;
      }
      return [];
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
  },
  'click .image' : function(event) {
      Session.set('selectedData', this);
      Session.set('openPopup', true);
  },
  'click .title' : function(event) {
      Session.set('selectedData', this);
      Session.set('openPopup', true);
  }
  
  }); 

  Template.block.destroyed = function () {
    console.log("Running destroy for block " + this.data.num);
    container.isotope({sortBy: "number"});
  }

  Template.filter.helpers({
    FiltersHelper: function() {
      return Filters.find({},{sort : {searchTag : 1}});
    }
  }); 

  Template.Popup.events({
  'click .close': function (event) {
    $().Avgrund.hide();
    Session.set('openPopup', false);
    $(this.find("#container")).removeClass('avgrund-active' );
  }  
  }); 

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

  Template.Popup.values = function () {  
    return Session.get('selectedData');
  };
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
       Blocks.update({ _id: blockname }, { $addToSet: { tags: value } });
       var tag = Filters.find({tag : value}).fetch();

       if(tag.length == 0){
          Filters.insert({tag : value, searchTag: value.toLowerCase() });
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
    if(Session.get('openPopup'))
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
function updateFullText(blockname,value){
   if(value != ""){   
       Meteor.call('updateBlockFullText', blockname, value , function(err,response) {
        if(err) {
          Session.set('serverDataResponse', "Error:" + err.reason);
          return;
        }
        Session.set('serverDataResponse', response);
      });
      if(Session.get('openPopup'))
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
