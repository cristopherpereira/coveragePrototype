Template.addNewNewsItemTemplate.events({
  'click .add': function (event) {
		Session.set("addingNewNewsItem",true);
  }
});

Template.addNewNewsItemFormTemplate.events({
  'click .save': function (event) {
	var numVal = $(".num",event.target.parentNode.parentElement).val();
	var imgVal = $(".img",event.target.parentNode.parentElement).val();
	var linkType = $("#linkType",event.target.parentNode.parentElement).val();
	var sex = $("#sex",event.target.parentNode.parentElement).val();
	if(linkType == "video"){	
		if(imgVal != undefined && imgVal != ''){
			var video_id = imgVal.split('v=')[1];
			var ampersandPosition = video_id.indexOf('&');
			if(ampersandPosition != -1) {
			  video_id = video_id.substring(0, ampersandPosition);
			}
			imgVal = video_id;
		}else{
			imgVal = "";
		}
	}

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
            linkType: linkType,
            sex: sex
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