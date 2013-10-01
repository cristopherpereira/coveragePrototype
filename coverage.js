Blocks = new Meteor.Collection("blocks");
Order = new Meteor.Collection("order");

//Meteor Client operates on the browser side
if (Meteor.isClient) { 
  
  //Reactive variable when the popup is triggered 
  Session.set('openPopup', false);
}