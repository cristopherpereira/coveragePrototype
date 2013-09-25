if (Meteor.isClient) { 
	//Get the popup data selected
	Template.Popup.values = function () {  
		return Session.get('selectedData');
	};

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
}