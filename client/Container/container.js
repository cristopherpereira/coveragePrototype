if (Meteor.isClient) { 
  //Container rendered is triggered when all the handlebars are rendered inside the Container Template
  //Here it will be initialized the datepicker on the filter bar on the top of the page
  Template.container.rendered = function () {     
    $("#datepicker").datepicker();
    $("#StartDate").datepicker({
        dateFormat: 'mm/dd/yy',
        changeMonth: true,
        changeYear: true,
        showOn: 'button',
        buttonImage: '../../calendar.jpg',
        onSelect: function (dateText, inst) {
            $('input#textfilter').val($("#StartDate").val());
            jQuery.fn.keypressFilter();
        }
    });
  }   

  //This function triggers when the page is reloaded or there are new, updated or deleted data on the mongo collection
  Template.container.blocks = function () {      
    return Blocks.find({},{sort : {num : 1}});
  };
}