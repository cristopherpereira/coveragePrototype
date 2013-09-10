Blocks = new Meteor.Collection("blocks");
if (Meteor.isClient) {
  var container = {};
  //Session.set("EditTextMode", false);
  Session.set("selectedToTextEditId", "");

  Template.container.rendered = function () {
     
    container = $(this.find("#container"));

  }

  Template.block.rendered = function () {
    var items = container.find(".item");
    // console.log("Running rendered for container with " + items.length + " blocks");
    if ((!container.hasClass("isotope")) && (items.length == Blocks.find().count())) {
      // This seems to run once per block. Wasteful.
      // console.log("Initialize isotope");
      // Initialize isotope
      container.imagesLoaded( function(){
      container.isotope({
        itemSelector : '.item',
         masonry: {
          cornerStampSelector: '.corner-stamp'
        },
        getSortData : {
          number : function( $elem ) {
            return $elem.text();
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
    }
  }

  Template.container.blocks = function () {
    /*var text = Session.get("search");
    if(text != null && text != ""){
      
        return Blocks.find({num: new RegExp(text,"i")});
    }*/
    return Blocks.find();
  };

  //Template.block.EditTextMode = false;

  Template.block.helpers({
    EditTextMode : function(id) {
      return id == Session.get("selectedToEditId");
    },
    IsEdit: function(id){
      return id == Session.get("selectedToEditId");
    }
  });
  
  Template.block.events({
  'click .addnewtag .add': function (event) {
    debugger;
    var blockname = event.currentTarget.parentElement.parentElement.parentElement.id;//children["value"].innerText;
    var value = event.currentTarget.parentElement.children["textTag"].value;

    updateTag(blockname,value);
   
 
  },
  'click .editText': function (event) {
    debugger;
    //Template.block.EditTextMode = !Template.block.EditTextMode;
    //Session.set("EditTextMode", true);
    Session.set("selectedToEditId", this._id);
  },
  'click .Fulltext .cancel': function (event) {
    debugger;
    //Template.block.EditTextMode = !Template.block.EditTextMode;
    //Session.set("EditTextMode", true);
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
}

if (Meteor.isServer) {
   Meteor.startup(function () {
    Meteor.methods({
      updateblock: function (blockname, value) {
       Blocks.update({ _id: blockname }, { $push: { tags: value } });
      },
      updateBlockFullText: function (blockname, value) {
       Blocks.update({ _id: blockname }, { text: value });
      }
    });
  });
}

function keypress(){
   $('input#textfilter').quicksearch('#container .item', {
        'show': function() {
            $(this).addClass('quicksearch-match');
        },
        'hide': function() {
            $(this).removeClass('quicksearch-match');
        }
    }).keyup(function(){
        setTimeout( function() {
            container.isotope({ filter: '.quicksearch-match' }).isotope(); 
        }, 100 );
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

    /*container.find('input#textTag').each(function() {
        $(this).val('');
    });*/

}
  
