Template.addNewNewsItemTemplate.events({
  'click .add': function (event) {
		Session.set("addingNewNewsItem",true);
  }
});

Template.addNewNewsItemFormTemplate.events({
  'click .save': function (event) {
	debugger;
	var numVal = $(".num",event.target.parentNode.parentElement).val();
	var imgVal = $(".img",event.target.parentNode.parentElement).val();
	var linkType = $("#linkType",event.target.parentNode.parentElement).val();

	var date = new Date();
	var day = date.getDate();
	var month = ("0" + (date.getMonth() + 1)).slice(-2)
	var year = date.getFullYear();

	var fullVal = $(".fulltext",event.target.parentNode.parentElement).val();

	Blocks.insert({            
            num: numVal,
            img: imgVal,
			dateAdded: month+"/"+day+"/"+year,
            text: fullVal,
            linkType: linkType
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