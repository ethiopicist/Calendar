(function($){

  var methods = {
    init: function(options, callback){

      buildCalendar(this, options);

      if(callback) callback();

    },
    update: function(options, callback){

      this.html('');

      buildCalendar(this, options);

      if(callback) callback();

    }
  };

  $.fn.ethiopianCalendar = function(method){
    // Method calling logic
    if(methods[method]){
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if(typeof method === 'object' || !method){
      return methods.init.apply(this, arguments);
    }
    else{
      $.error('Method ' +  method + ' does not exist in jQuery.ethiopiancalendar');
    }    

  };

  // Function to build calendar
  // creates <table> subelements
  function buildCalendar(element, options){
    var settings = {
      'savePrefs': false,
      'useSavedPrefs': false,
      'startDay': 1,
      'useLetters': true,
      'useNumbers' : true,
      'monthNames': 'gez',
      'dayNames': 'gez',
      'gregorianDates': true,
      'calendarMonth': (new Date())
    };

    if(options) { 
      if(options['useSavedPrefs'] && localStorage.getItem('calendar-prefs') !== null){        
        var prefs = JSON.parse(localStorage.getItem('calendar-prefs'));
        prefs['calendarMonth'] = new Date(prefs['calendarMonth']);

        if(options['savePrefs']){
          $.extend(prefs, options);
          $.extend(settings, prefs);

          localStorage.setItem('calendar-prefs', JSON.stringify(settings));
        }
        else{
          $.extend(options, prefs);
          $.extend(settings, options);
        }
      }
      else if(options['savePrefs']){
        $.extend(settings, options);
        localStorage.setItem('calendar-prefs', JSON.stringify(settings));
      }
      else $.extend(settings, options);
    }
    
    // THEAD ELEMENTS //

    // Month & Year
    var titleRow = $('<tr class="calendar-title-row" />').append($('<th colspan="7" />').html(
      '<h1 class="calendar-title">' +
      printMonthName(settings['calendarMonth'].toLocaleDateString('en-US-u-ca-ethiopic', {month: 'numeric'}), settings['monthNames'], settings['useLetters']) +
      ' ' +
      (settings['useNumbers'] ? toEthiopicNumber(settings['calendarMonth'].toLocaleDateString('en-US-u-ca-ethiopic', {year: 'numeric'})) : settings['calendarMonth'].toLocaleDateString('en-US-u-ca-ethiopic', {year: 'numeric'})) +
      '</h1>'
    ));

    // Days of the Week
    var dowRow = $('<tr class="calendar-days-of-week" />');

    for(i = 0; i < 7; i++){
      var d = (i + settings['startDay']) % 7;
      dowRow.append($('<th class="calendar-day-of-week" />').append(
        $('<span class="day-of-week-long" />').text(printDayName(d, settings['dayNames'], settings['useLetters'])),
        $('<span class="day-of-week-short" />').text(printDayName(d, settings['dayNames'], settings['useLetters']).substr(0, 3))
      ));
    }

    // Append all thead rows
    var thead = $('<thead/>').append(titleRow, dowRow);

    // TBODY ELEMENTS //
    
    // Calendar rows
    var tbodyRows = [];
    var iDate = firstOfCalendar(settings['calendarMonth'], settings['startDay']);

    for(i = 0; i < 6; i++){
      tbodyRows[i] = $('<tr class="calendar-row-'+i+'" />');

      for(j = 0; j < 7; j++){
        var theCell = $('<td />');
        
        theCell.addClass('calendar-cell-'+i+'-'+j);
        theCell.attr('data-ethiopian-date', iDate.toLocaleDateString('en-US-u-ca-ethiopic', {day: 'numeric', month: 'numeric', year: 'numeric'}));
        theCell.attr('data-gregorian-date', iDate.toLocaleDateString('en-US', {day: 'numeric', month: 'numeric', year: 'numeric'}));

        theCell.append($('<span class="ethiopian-date" />').text(
          (settings['useNumbers'] ? toEthiopicNumber(iDate.toLocaleDateString('en-US-u-ca-ethiopic', {day: 'numeric'})) : iDate.toLocaleDateString('en-US-u-ca-ethiopic', {day: 'numeric'}))
        ));

        // if the current cell is in a different Ethiopian month
        if(iDate.toLocaleDateString('en-US-u-ca-ethiopic', {month: 'numeric'}) != settings['calendarMonth'].toLocaleDateString('en-US-u-ca-ethiopic', {month: 'numeric'})){
          theCell.addClass('different-month');
          
          // if the current cell is the first shown date
          // in a different Ethiopian month
          if(i == 0 && j == 0 || iDate.toLocaleDateString('en-US-u-ca-ethiopic', {day: 'numeric'}) == 1){
            theCell.append($('<span class="ethiopian-month" />').text(
              printMonthName(iDate.toLocaleDateString('en-US-u-ca-ethiopic', {month: 'numeric'}), settings['monthNames'], settings['useLetters'])
            ));
          }
        }

        // if the current cell matches today's date
        if(iDate.toLocaleDateString() == (new Date()).toLocaleDateString()){
          theCell.addClass('todays-date');
        }

        // if Gregorian dates are to be displayed
        if(settings['gregorianDates']){
          theCell.append($('<span class="gregorian-date" />').text(iDate.getDate()));

          // if the current cell is the
          // first shown date of a Gregorian month
          if(i == 0 && j == 0 || iDate.getDate() == 1){
            theCell.append($('<span class="gregorian-month" />').text(
              iDate.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
            ));
          }
        }

        // append all cells to the row
        tbodyRows[i].append(theCell);

        // increment iDate
        iDate.setDate(iDate.getDate()+1);
      }
    }

    // Append all tbody elements
    var tbody = $('<tbody/>').append(tbodyRows);

    var tfoot = $('<tfoot/>');

    element.append(thead, tbody, tfoot);
  }

  // Function to determine first date
  // to be displayed on calendar
  // Returns a date object
  function firstOfCalendar(dateObj, startDay){
    // duplicate dateObj
    var date = new Date(dateObj.getTime());
    
    // set date to first day of Ethiopian calendar
    date.setDate(date.getDate() - date.toLocaleDateString('en-US-u-ca-ethiopic', {day: 'numeric'}) + 1);
  
    var offset = date.getDay() - startDay;
    if(date.getDay() == 0 && startDay == 1) offset = 6; // adjustment for Sunday
    if(date.toLocaleDateString('en-US-u-ca-ethiopic', {month: 'numeric'}) == 13) offset += 14; // for Pagumen
    
    date.setDate(date.getDate() - offset);
    
    return date;
  }

  // Function to print names of month
  // depending on preferred language and characters
  function printMonthName(m, lang, translit){
    var gezMonthNames = [
      'መስከረም',
      'ጥቅምት',
      'ኅዳር',
      'ታኅሣሥ',
      'ጥር',
      'የካቲት',
      'መጋቢት',
      'ሚያዝያ',
      'ግንቦት',
      'ሰኔ',
      'ሐምሌ',
      'ነሐሴ',
      'ጳጕሜን'
    ];
  
    var gezMonthNamesTranslit = [
      'Maskaram',
      'Ṭəqəmt',
      'Ḫədār',
      'Tāḫśāś',
      'Ṭərr',
      'Yakkātit',
      'Maggābit',
      'Miyāzyā',
      'Gənbot',
      'Sane',
      'Ḥamle',
      'Naḥase',
      'Ṗāgʷəmen'
    ];
  
    var tigMonthNames = gezMonthNames.slice();
    tigMonthNames[5] = 'ለካቲት'; tigMonthNames[4] = 'ጥሪ'; tigMonthNames[1] = 'ጥቅምቲ';
  
    var tigMonthNamesTranslit = gezMonthNamesTranslit.slice();
    tigMonthNamesTranslit[5] = 'Lakkātit'; tigMonthNamesTranslit[4] = 'Ṭərri'; tigMonthNamesTranslit[1] = 'Ṭəqəmti';

    var oroMonthNames = [];

    if(lang == 'tig'){
      if(!translit) return tigMonthNamesTranslit[m-1];
      else return tigMonthNames[m-1];
    }
    else{
      if(!translit) return gezMonthNamesTranslit[m-1];
      else return gezMonthNames[m-1];
    }
  }

  // Function to print names of days of week
  // depending on preferred language and characters
  function printDayName(d, lang, translit){
    var gezDayNames = [
      'እሑድ',
      'ሰኑይ',
      'ሠሉስ',
      'ረቡዕ',
      'ኀሙስ',
      'ዐርብ',
      'ቀዳም'
    ];
  
    var gezDayNamesTranslit = [
      'ʾƎḥud',
      'Sanuy',
      'Śalus',
      'Rabuʿ',
      'Ḫamus',
      'ʿArb',
      'Qadām'
    ];
  
    var amhDayNames = [
      'እሑድ',
      'ሰኞ',
      'መክሰኞ',
      'ረቡዕ',
      'ኀሙስ',
      'ዓርብ',
      'ቅዳሜ'
    ];
  
    var amhDayNamesTranslit = [
      'ʾƎḥud',
      'Saño',
      'Maksaño',
      'Rabuʿ',
      'Ḫamus',
      'ʿĀrb',
      'Qədāme'
    ];
  
    var tigDayNames = [
      'እሑድ',
      'ሶኑይ',
      'ሦሉስ',
      'ሮቡዕ',
      'ሓሙስ',
      'ዓርቢ',
      'ቐዳም'
    ];
  
    var tigDayNamesTranslit = [
      'ʾƎḥud',
      'Sonuy',
      'Śolus',
      'Robuʿ',
      'Ḥāmus',
      'ʿĀrbi',
      'Q̱adām'
    ];

    var oroDayNames = [];

    var engDayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    
    if(lang == 'amh'){
      if(!translit) return amhDayNamesTranslit[d];
      else return amhDayNames[d];
    }
    else if(lang == 'tig'){
      if(!translit) return tigDayNamesTranslit[d];
      else return tigDayNames[d];
    }
    else if(lang == 'eng'){
      return engDayNames[d];
    }
    else{
      if(!translit) return gezDayNamesTranslit[d];
      else return gezDayNames[d];
    }
  }

  // Function to print Ethiopic number
  function toEthiopicNumber(x){
    if(typeof x !== 'number') x = parseInt(x);
  
          if(x == 0) return  '';
    else if(x == 1) return '፩';
    else if(x == 2) return '፪';
    else if(x == 3) return '፫';
    else if(x == 4) return '፬';
    else if(x == 5) return '፭';
    else if(x == 6) return '፮';
    else if(x == 7) return '፯';
    else if(x == 8) return '፰';
    else if(x == 9) return '፱';
  
    else if(x >= 10 && x < 20) return '፲' + toEthiopicNumber(x - 10);
    else if(x >= 20 && x < 30) return '፳' + toEthiopicNumber(x - 20);
    else if(x >= 30 && x < 40) return '፴' + toEthiopicNumber(x - 30);
    else if(x >= 40 && x < 50) return '፵' + toEthiopicNumber(x - 40);
    else if(x >= 50 && x < 60) return '፶' + toEthiopicNumber(x - 50);
    else if(x >= 60 && x < 70) return '፷' + toEthiopicNumber(x - 60);
    else if(x >= 70 && x < 80) return '፸' + toEthiopicNumber(x - 70);
    else if(x >= 80 && x < 90) return '፹' + toEthiopicNumber(x - 80);
    else if(x >= 90 && x < 100) return '፺' + toEthiopicNumber(x - 90);
  
    else if(x >= 100 && x < 200) return '፻' + toEthiopicNumber(x - 100);
    else if(x >= 200 && x < 10000) return toEthiopicNumber((x - (x % 100)) / 100) + '፻' + toEthiopicNumber(x % 100);
  
    else if(x >= 10000 && x < 20000) return '፼' + toEthiopicNumber(x - 10000);
    else if(x >= 20000 && x < 1000000) return toEthiopicNumber((x - (x % 10000)) / 10000) + '፼' + toEthiopicNumber(x % 10000);
  }

})(jQuery);