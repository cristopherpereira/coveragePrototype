if (Meteor.isClient) { 
  //Event used to filter by text
  Template.filter.events = {
  	'keypress  input#textfilter': function (event) {
  	     jQuery.fn.keypressFilter();
  	}  
  }   
}