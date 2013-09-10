Template.addNewNewsItemTemplate.events({
  'click .add': function (event) {
		Session.set("addingNewNewsItem",true);
  }
});

Template.addNewNewsItemFormTemplate.events({
  'click .save': function (event) {
	var numVal = $(".num",event.target.parentNode.parentElement).val();
	var imgVal = $(".img",event.target.parentNode.parentElement).val();
	var fullVal = $(".fulltext",event.target.parentNode.parentElement).val();

	Blocks.insert({
            
            num: numVal,
            img: imgVal,
            text: fullVal
          });

		Session.set("addingNewNewsItem",false);
	},
	  'click .cancel' : function (event) {
  		Session.set("addingNewNewsItem",false);	
  	}
  });

Template.addNewsItemContentPanel.helpers({
  AddingNewNewsItem: function() {
	    if(Session.get("addingNewNewsItem")==null){
			Session.set("addingNewNewsItem",false);
	    }
	    if (!Session.get("addingNewNewsItem")){
	    	return false;
	    }
	    else
	    {
	    	return true;
	    }
	}
});