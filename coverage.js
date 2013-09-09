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

  Template.block.destroyed = function () {
    console.log("Running destroy for block " + this.data.num);
    container.isotope({sortBy: "number"});
  }
}

if (Meteor.isServer) {
  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function rejigger() {
    var count = Blocks.find().count();
    var i = getRandomInt(0, count-1);
    var num = getRandomInt(0,100);
    var item = Blocks.find().fetch()[i];
    var c = getRandomInt(0,2);

    if (count > 30) c++;

    if (c==0) {
      // Add
      console.log("Add");
      Blocks.insert({num: num});
    } else if (c==1) {
      // Remove
      console.log("Remove");
      if (item) {
        Blocks.remove(item._id);
      }
    } else if (c>=2) {
      // Fiddle
      console.log("Fiddle");
      if (item) {
        Blocks.update(item._id, {num: num});
      }
    }
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
  
}