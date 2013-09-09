Blocks = new Meteor.Collection("blocks");

if (Meteor.isClient) {
  var container = {};

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
    
      container.isotope({sortBy: "number"});
    } else if (container.hasClass("isotope")) {
      console.log("Updating isotope");
      container.isotope('addItems', $(this.find(".item:not(.isotope-item)")), function() {
                container.isotope();
            });
    }

    
  }

  Template.filter.events = {
    'keypress  input#text': function (event) {
      /*var text = $("#text")[0].value;
        Session.set("search", text);*/

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
  
  Template.block.events({
  'click .add': function (event) {
    var blockname = event.currentTarget.parentElement.parentElement.parentElement.children["value"].innerText;
    var value = event.currentTarget.parentElement.children["textTag"].value;

    
    if(text != ""){   
     Meteor.call('updateblock', blockname, value , function(err,response) {
      if(err) {
        Session.set('serverDataResponse', "Error:" + err.reason);
        return;
      }
      Session.set('serverDataResponse', response);
    });
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
       Blocks.update({ num: blockname }, { $push: { tags: value } });
      }
    });
  });
}

function keypress(){
   $('input#text').quicksearch('#container .item', {
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
  
