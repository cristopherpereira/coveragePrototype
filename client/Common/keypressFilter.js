(function ($) {
  $.fn.keypressFilter = function keypress(){

    var searchtext =Session.get("SearchText");
    if (!searchtext) 
      searchtext="";

    $('input#textfilter').quicksearch('#container .item', {
        'show': function() {
            $(this).addClass('quicksearch-match');
        },
        'hide': function() {
            $(this).removeClass('quicksearch-match');
        },
        onAfter: function() {
          setTimeout( function() {
              $(document).find("#container").isotope({ filter: '.quicksearch-match'+searchtext }).isotope(); 
          }, 100 );
        }
    });
  }
})(jQuery);