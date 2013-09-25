if (Meteor.isClient) { 
  //Helpers are used to get data on the template
  //When the 'openPopup' is set using 'Session.set('openPopup', true)' (or false) this function will be triggered ('this happens because session variables 
  //are reactive, in other words when a variable is set it triggers all the 'gets' for that variable)
  Template.page.helpers({    
    ShowPopup: function(){
      return Session.get('openPopup'); 
    }
  });     

  //This events used to hide the popup when we click outside of popup borders  
  //The Avgrund is a library used to show the popup, making the blur, the zoom out effect and the popup it self  
  Template.page.events = {
    'click .avgrund-cover': function (event) {
        $().Avgrund.hide();
        Session.set('openPopup', false);
    }
  }
}