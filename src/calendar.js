/*!
 * jQuery Ethiopic Calendar
 * By Augustine Dickinson
 *
 * Copyright (c) 2020 Ethiopicist.com and its contributors.
 *
 * @licence MIT License
 */

(function($){

  var methods = {
    init: function(options, callback){
      
      var element = this;

      $.i18n({locale: options.locale}).load({
        'en': '/i18n/languages/en.json',

        'gez-eth': '/i18n/languages/gez-eth.json',
        'gez-lat': '/i18n/languages/gez-lat.json',

        'am-eth': '/i18n/languages/am-eth.json',
        'am-lat': '/i18n/languages/am-lat.json',

        'ti-eth': '/i18n/languages/ti-eth.json',
        'ti-lat': '/i18n/languages/ti-lat.json',

        'om': '/i18n/languages/om.json',
        
        'pl': '/i18n/languages/pl.json',
        'fr': '/i18n/languages/fr.json',
        'de': '/i18n/languages/de.json'
      }).done(function(){

        buildCalendar(element);

        populateCalendar(element, options);

        if(callback) callback();

      });

    },
    update: function(options, callback){

      populateCalendar(this, options);

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

  /**
   * Puts in place the required HTML elements for the calendar.
   * @param {jQuery} element 
   */
  function buildCalendar(element){
    element.html('');
    
    // Head Elements //
    var calendarHead = $('<div class="calendar-head" />').appendTo(element);

    // Title Row
    $('<div class="calendar-title-row" />').append(
      $('<div class="calendar-title-cell" />').append(
        $('<div class="calendar-title-cell-inner" />').append(
          $('<h1 class="calendar-title" />').text(' ').prepend(
            $('<span class="month-name" />'),
          ).append(
            $('<span class="year-number" />')
          )
        )
      )
    ).appendTo(calendarHead);
    
    // Days of the Week
    var dowRow = $('<div class="calendar-dow-row" />').appendTo(calendarHead);

    for(i = 0; i < 7; i++){
      dowRow.append($('<div />').addClass('calendar-dow-cell-'+i).append(
        $('<div class="calendar-dow-cell-inner">').append(
          $('<span class="dow-name-long" />'),
          $('<span class="dow-name-short" />')
        )
      ));
    }
    

    // Body elements //
    var calendarBody = $('<div class="calendar-body" />').appendTo(element);
    
    // Calendar rows

    for(i = 0; i < 6; i++){
      var calendarRow = $('<div class="calendar-row-'+i+'" />').appendTo(calendarBody);

      for(j = 0; j < 7; j++){
        var calendarCell = $('<div class="calendar-cell-'+i+'-'+j+'" />').appendTo(calendarRow);
        
        $('<div class="calendar-cell-inner" />').append(
          $('<span class="label-ethiopian-date" />'),
          $('<span class="label-ethiopian-month-long" />'),
          $('<span class="label-ethiopian-month-short" />'),
          $('<span class="label-ethiopian-month-narrow" />'),
          
          $('<span class="label-alternate-date" />'),
          $('<span class="label-alternate-month-long" />'),
          $('<span class="label-alternate-month-short" />'),
          $('<span class="label-alternate-month-narrow" />')
        ).appendTo(calendarCell);

      }
    }

  }

  /**
   * Updates the .text() of the HTML elements 
   * with the relevant, formatted info.
   * @param {jQuery} element 
   * @param {{}} settings 
   */
  function populateCalendar(element, options){

    const userPreferences = options.userPreferences;

    // handling for incorrect months
    if(options.month.year < 1) options.month.year = 1;
    if(options.month.month < 1) options.month.month = 1;
    else if(options.month.month > 13) options.month.month = 13;

    // implement disabled options based on language/locale
    if(userPreferences.language == 'om') userPreferences.useNumerals = false;
    else if(options.locale == 'am-eth' || options.locale == 'ti-eth') userPreferences.useScript = true;

    // set the i18n locale for most of the calendar elements
    // based on the language + whether to use the script
    if(userPreferences.language == 'om') $.i18n().locale = 'om';
    else $.i18n().locale = (
      userPreferences.language +
      (userPreferences.useScript ? '-eth' : '-lat')
    );

    // the titular month & year
    const titleCellInner = $(element).find('.calendar-head .calendar-title-row .calendar-title-cell .calendar-title-cell-inner .calendar-title');
    
    titleCellInner.children('.month-name').text(
      $.i18n('ethMonth' + options.month.month + 'long')
    );

    titleCellInner.children('.year-number').text(
      toEthiopicNumeral((userPreferences.useAmataAlam ? parseInt(options.month.year) + 5500 : options.month.year), userPreferences.useNumerals)
    );

    // the calendar cells
    const calendarBody = $(element).children('.calendar-body');
    var iDate = firstOfCalendar(options.month, userPreferences.firstWeekday);

    for(i = 0; i < 6; i++){
      const calendarRow = calendarBody.children('.calendar-row-'+i);

      for(j = 0; j < 7; j++){
        const calendarCell = calendarRow.children('.calendar-cell-'+i+'-'+j);

        if(iDate.year > 0){

          calendarCell.attr('data-ethiopic-year', iDate.year);
          calendarCell.attr('data-ethiopic-month', iDate.month);
          calendarCell.attr('data-ethiopic-date', iDate.date);
          calendarCell.attr('data-alternate-year', toWestern(iDate).year);
          calendarCell.attr('data-alternate-month', toWestern(iDate).month);
          calendarCell.attr('data-alternate-date', toWestern(iDate).date);

        }
        else{

          calendarCell.removeAttr('data-ethiopic-year data-ethiopic-month data-ethiopic-date');
          calendarCell.removeAttr('data-alternate-year data-alternate-month data-alternate-date');

        }

        calendarCell.removeClass('is-different-month is-today');
        
        const today = toEthiopic({
          year: (new Date()).getFullYear(),
          month: (new Date()).getMonth()+1,
          date: (new Date()).getDate()
        });

        if(iDate.month != options.month.month) calendarCell.addClass('is-different-month');
        else if(
          iDate.year == today.year &&
          iDate.month == today.month &&
          iDate.date == today.date
        ) calendarCell.addClass('is-today');

        const calendarCellInner = calendarCell.children('.calendar-cell-inner');

        calendarCellInner.children().text('');

        if(iDate.year > 0){

          calendarCellInner.children('.label-ethiopian-date').text(
            toEthiopicNumeral(iDate.date, userPreferences.useNumerals)
          );

          if(iDate.date == 1 || (i == 0 && j == 0)){
            
            calendarCellInner.children('.label-ethiopian-month-long').text(
              $.i18n('ethMonth' + iDate.month + 'long')
            );

            calendarCellInner.children('.label-ethiopian-month-short, .label-ethiopian-month-narrow').text(
              $.i18n('ethMonth' + iDate.month + 'short')
            );

          }

          if(userPreferences.showAlternateDates) calendarCellInner.children('.label-alternate-date').text(
            toWestern(iDate).date
          );

        }

        iDate = addOneDay(iDate);
      
      }

    }

    if(userPreferences.localeDayNames) $.i18n().locale = options.locale;

    const dowRow = $(element).find('.calendar-head .calendar-dow-row');

    for(i = 0; i < 7; i++){

      var dayNumber = (i + userPreferences.firstWeekday) % 7;
      if(dayNumber == 0) dayNumber = 7;

      const dowCellInner = dowRow.find('.calendar-dow-cell-'+i+' .calendar-dow-cell-inner');
      
      dowCellInner.children('.dow-name-long').text(
        $.i18n('day' + dayNumber + 'long')
      );

      dowCellInner.children('.dow-name-short').text(
        $.i18n('day' + dayNumber + 'short')
      );

    }

    if(!userPreferences.localeDayNames) $.i18n().locale = options.locale;

    if(userPreferences.showAlternateDates){
      
      const firstCellInner = $('.calendar-cell-0-0, div[data-alternate-date="1"]');

      firstCellInner.each(function(){

        if($(this).is('[data-alternate-year]')){

          var altMonth = {
            month: $(this).attr('data-alternate-month'),
            year: $(this).attr('data-alternate-year')
          };

          $(this).find('.label-alternate-month-long').text(
            $.i18n('greMonth' + altMonth.month + 'long') +
            " " +
            altMonth.year
          );

          $(this).find('.label-alternate-month-short').text(
            $.i18n('greMonth' + altMonth.month + 'short') +
            $.i18n('shortSeparator') +
            altMonth.year//.substr(2, 2)
          );

        }

      });

    }

  }

  /**
   * Determines the first day to be displayed in the calendar.
   * @param {{year: number, month: number}} month An Ethiopic month and year
   * @param {number} firstWeekday The day that the week starts on
   */
  function firstOfCalendar(month, firstWeekday){
    
    const offset = (firstOfMonth(month).day - firstWeekday + 7) % 7;

    var firstOfCalendar = firstOfMonth(month);

    for(i = 0; i < offset; i++){
      firstOfCalendar = subOneDay(firstOfCalendar);
    }

    return firstOfCalendar;

  }

  /**
   * Returns the day before a given Ethiopic date
   * @param {{year: number, month: number, date: number}} date An Ethiopic date
   */
  function subOneDay(date){

    if(date.month == 1 && date.date == 1){
      
      date.year -= 1;
      date.month = 13;

      if(date.year % 4 == 3) date.date = 6;
      else date.date = 5;

    }
    else if(date.date == 1){

      date.month -= 1;
      date.date = 30;

    }
    else date.date -= 1;

    if(date.day == 1) date.day = 7;
    else date.day -= 1;

    return date;

  }

  /**
   * Returns the day after a given Ethiopic date
   * @param {{year: number, month: number, date: number}} date An Ethiopic date
   */
  function addOneDay(date){
  
    if(
      (date.month == 13 && date.date == 6) ||
      (date.month == 13 && date.date == 5 && date.year % 4 != 3)
      ){

      date.year += 1;
      date.month = 1;
      date.date = 1;

    }
    else if(date.date == 30){

      date.month += 1;
      date.date = 1;

    }
    else date.date += 1;

    if(date.day == 7) date.day = 1;
    else date.day += 1;

    return date;

  }

})(jQuery);