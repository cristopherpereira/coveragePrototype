Template.addNewNewsItemTemplate.events({
  'click .add': function (event) {
		Session.set("addingNewNewsItem",true);
  }
});

Template.addNewNewsItemFormTemplate.events({
  'click .save': function (event) {
	var numVal = $(".num",event.target.parentNode.parentElement).val();
	var imgVal = $(".img",event.target.parentNode.parentElement).val();
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth()+1;
	var year = date.getFullYear();
	debugger;
	Blocks.insert({
            
            num: numVal,
            img: imgVal,
			dateAdded: month+"/"+day+"/"+year
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