/*!
 * jQuery Ethiopic Calendar App
 * By Augustine Dickinson
 *
 * Copyright (c) 2020 Ethiopicist.com and its contributors.
 *
 * @licence MIT License
 */

// Register the app's service worker for offline caching
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
};

var today = {};
today.year = (new Date()).getFullYear();
today.month = (new Date()).getMonth()+1;
today.date = (new Date()).getDate();

today = toEthiopic(today);

$(document).ready(function(){

 /*
  * Initialize the calendar
  */

  $('#calendar').ethiopianCalendar(options(), initCallback);

 /*
  * Update the calendar: go-to buttons
  */

    $(document).on('click touchend', 'div[id^="go-to-buttons"] a[id^="go-to-"]', function(e){

    e.preventDefault(); // to prevent double tap to zoom and other unwanted behaviours
    
    if($(this).attr('id').startsWith('go-to-prev')){

      if(options('month').month == 1 && options('month').year > 1){
        
        options('month', {
          year: options('month').year - 1,
          month: 13
        });

      }
      else if(options('month').month > 1){
        
        options('month', {
          year: options('month').year,
          month: options('month').month - 1
        });

      }
      
    }
    else if($(this).attr('id').startsWith('go-to-today')){

      options('month', {
        year: today.year,
        month: today.month
      });

    }
    else if($(this).attr('id').startsWith('go-to-next')){

      if(options('month').month == 13){
        
        options('month', {
          year: options('month').year + 1,
          month: 1
        });

      }
      else{
        
        options('month', {
          year: options('month').year,
          month: options('month').month + 1
        });

      }
      
    }
    
    $('#calendar').ethiopianCalendar('update', options(), updateCallback);

  });

 /*
  * Update the calendar: go-to field
  */

  $(document).on('click', 'div#go-to-field a#go-to-submit', function(){

    var goToMonth = {};
    goToMonth.month = parseInt($('select#go-to-month').val());
    goToMonth.year = parseInt($('input#go-to-year').val());
    if(userPreferences('useAmataAlam')) goToMonth.year -= 5500;

    options('month', {
      year: goToMonth.year,
      month: goToMonth.month
    });

    $('div#go-to-field').hide();
    $('div#go-to-buttons').show();
    
    $('#calendar').ethiopianCalendar('update', options(), updateCallback);

  });

  /*
   * Show go-to-field
   */
   
  $(document).on('click', 'div#go-to-buttons a#go-to-field-button', function(){

    $('div#go-to-buttons').hide();
    $('div#go-to-field').show();

  });

  $(document).on('click', 'div#go-to-field a#go-to-cancel', function(){

    $('div#go-to-field').hide();
    $('div#go-to-buttons').show();

  });

 /*
  * Show and hide the locale selection modal
  */
  
  $(document).on('click', 'a[id^="open-locale-picker"]', function(){

    $('div#locale-picker').addClass('is-active');
    $('html').addClass('is-clipped');

  });

  $(document).on('click', 'div#locale-picker div.modal-background, div#locale-picker button', function(){

    $('div#locale-picker').removeClass('is-active');
    $('html').removeClass('is-clipped');

  });

 /*
  * Change the locale
  */

  $(document).on('click', 'div#locale-picker a.panel-block', function(){

    $('div#locale-picker').removeClass('is-active');
    $('html').removeClass('is-clipped');

    options('locale', $(this).data('value'));

    $('#calendar').ethiopianCalendar('update', options(), updateCallback);

  });

 /*
  * Show and hide the user preferences modal
  */
  
  $(document).on('click', 'a[id^="open-userPreferences"]', function(){

    $('div#userPreferences-window').addClass('is-active');
    $('html').addClass('is-clipped');

  });

  $(document).on('click', 'div#userPreferences-window div.modal-background, div#userPreferences-window button', function(){

    $('div#userPreferences-window').removeClass('is-active');
    $('html').removeClass('is-clipped');

  });

 /*
  * Change the user preferences
  */
 
  // Selects
  $(document).on('click', 'div#userPreferences-window .menu-list li ul a', function(){
    
    userPreferences($(this).parents('ul').attr('id'), $(this).data('value'));

    $('#calendar').ethiopianCalendar('update', options(), updateCallback);

  });

  // Toggles
  $(document).on('click', 'div#userPreferences-window a .toggle:not([disabled])', function(){
    
    userPreferences($(this).parents('a').attr('id'), !$(this).is('[data-is-true]'));
    
    if($(this).is('[data-is-true]')) $(this).removeAttr('data-is-true');
    else $(this).attr('data-is-true', '');

    $('#calendar').ethiopianCalendar('update', options(), updateCallback);

  });

  /*
   * Show and hide the calender converter modal
   */
   
  $(document).on('click', 'a[id^="open-converter"]', function(){

    $('div#converter-window').addClass('is-active');
    $('html').addClass('is-clipped');

  });

  $(document).on('click', 'div#converter-window div.modal-background, div#converter-window button', function(){

    $('div#converter-window').removeClass('is-active');
    $('html').removeClass('is-clipped');

  });

 /*
  * Switch calendar conversion
  */
  
  $(document).on('click', 'div#converter-window li[id^="convert-"] a', function(){

    $('div#converter-window li').removeClass('is-active');
    $(this).parent().addClass('is-active');

    $('div#converter-window form').hide();
    $('div#converter-window form#' + $(this).parent().attr('id') + '-form').show();

  });

 /*
  * Conversion buttons
  */
  
  $(document).on('click', 'div#converter-window a[id^="convert-"][id*="-submit"]', function(){

    if($(this).attr('id').includes('ethiopic')) var calendar = 'ethiopic';
    else if($(this).attr('id').includes('western')) var calendar = 'western';
    else if($(this).attr('id').includes('islamic')) var calendar = 'islamic';

    const date = {
      year: parseInt($('#convert-'+calendar+'-year').val()),
      month: parseInt($('#convert-'+calendar+'-month').val()),
      date: parseInt($('#convert-'+calendar+'-date').val()),
    }

    convertDate(date, calendar, userPreferences('useAmataAlam'));

  });

 /*
  * Show and hide the computus table modal
  */

  $(document).on('click', 'a[id^="open-computus"]', function(){

    $('div#computus-window').addClass('is-active');
    $('html').addClass('is-clipped');

  });

  $(document).on('click', 'div#computus-window div.modal-background, div#computus-window button', function(){

    $('div#computus-window').removeClass('is-active');
    $('html').removeClass('is-clipped');

  });

  $(document).on('click', 'table#computus-table tbody td', function(){

    if(typeof $(this).attr('data-year') !== 'undefined' && typeof $(this).attr('data-month') !== 'undefined'){

      $('div#computus-window').removeClass('is-active');
      $('html').removeClass('is-clipped');

      options('month', {
        year: parseInt($(this).attr('data-year')),
        month: parseInt($(this).attr('data-month'))
      });

      $('#calendar').ethiopianCalendar('update', options(), updateCallback);

      $('div[class^="calendar-cell"]' +
      '[data-ethiopic-year="' + $(this).attr('data-year') + '"]' +
      '[data-ethiopic-month="' + $(this).attr('data-month') + '"]' +
      '[data-ethiopic-date="' + $(this).attr('data-date') + '"]').addClass('is-highlighted');

    }

  });

 /*
  * Keyboard shortcuts to mimic buttons
  */

  $(document).keydown(function(e) {

    if($('input:focus').length < 1){

      switch(e.which) {
        case 37: $('a#go-to-prev').trigger('click'); // left
        break;

        case 38: $('a#go-to-prev').trigger('click'); // up
        break;

        case 39: $('a#go-to-next').trigger('click'); // right
        break;

        case 40: $('a#go-to-next').trigger('click'); // down
        break;

        case 84: $('a#go-to-today').trigger('click'); // t
        break;

        default: return;

      }

      e.preventDefault();
    
    }

  });

});

/**
 * Callback function after initializing the calendar
 */
function initCallback(){

  // Add classes to elements
  $("div[class^='calendar-']").addClass('tile');
  $("div.calendar-head, div.calendar-body").addClass('is-vertical');

  $("div.calendar-title-cell").addClass('is-parent is-3');
  $("div.calendar-title-cell-inner").addClass('is-child has-text-centered');

  $("div[class^='calendar-dow-cell']").addClass('is-parent is-1');
  $("div.calendar-dow-cell-inner").addClass('is-child has-text-centered').removeClass('is-parent is-1');
  
  $("div[class^='calendar-cell']").addClass('is-parent is-1');
  $("div.calendar-cell-inner").addClass('is-child').removeClass('is-parent is-1');

  // Move calendar controls
  $('#calendar-controls').prependTo('.calendar-title-row');
  $('#go-to-prev-mobile-control').prependTo('.calendar-title-row');
  $('#calendar-preferences').appendTo('.calendar-title-row');
  $('#go-to-next-mobile-control').appendTo('.calendar-title-row');

  // List of months for Go to... and converter fields
  for(i = 1; i <= 13; i++){

    $('select#go-to-month').append($('<option value="' + i + '" data-i18n="ethMonth' + i + 'long">'));

    $('select#convert-ethiopic-month').append($('<option value="' + i + '" data-i18n="ethMonth' + i + 'long">'));

    if(i < 13){

      $('select#convert-western-month').append($('<option value="' + i + '" data-i18n="greMonth' + i + 'long">'));
      $('select#convert-islamic-month').append($('<option value="' + i + '" data-i18n="islMonth' + i + 'long">'));

    }

  }

  // Prefill default values for converter fields and converted dates
  var defaultDate = today;
  if(userPreferences('useAmataAlam')) defaultDate.year += 5500;
  convertDate(defaultDate, 'ethiopic', userPreferences('useAmataAlam'));

  // Add necessary elements to modals
  $('#locale-picker .panel-block').append(
    $('<span class="octicon octicon-check is-pulled-right" />')
  );
  $('#userPreferences-window .menu .menu-list li ul a').append(
    $('<span class="octicon octicon-check is-pulled-right" />')
  );
  $('.toggle-control').each(function(){
    $(this).append($('<span class="toggle is-pulled-right" />'));
  });

  // Initialize the computus table
  $('#computus-table').seaOfComputation('init', options('month').year, options());

  if(options('month').year < 353){

    $('a[id^="open-computus"]').hide();
    $('div#computus-window').removeClass('is-active');
    $('html').removeClass('is-clipped');

  }
  else $('a[id^="open-computus"]').show();

  localize();
  fillForms();

  if(userPreferences('useDarkTheme')) $('body').addClass('dark-theme');
  else $('body').removeClass('dark-theme');
  $('body').show();

}

/**
 * Callback function after updating the calendar
 */
function updateCallback(){

  if(userPreferences('useDarkTheme')) $('body').addClass('dark-theme');
  else $('body').removeClass('dark-theme');

  // Un-highlight calendar cells
  $('.is-highlighted').removeClass('is-highlighted');

  // Update the computus table
  $('#computus-table tbody').html('');
  $('#computus-table').seaOfComputation('init', options('month').year, options());

  if(options('month').year < 353){

    $('a[id^="open-computus"]').hide();
    $('div#computus-window').removeClass('is-active');
    $('html').removeClass('is-clipped');

  }
  else $('a[id^="open-computus"]').show();

  localize();
  fillForms();
  
}

/**
 * Localizes elements with i18n localizations
 */
function localize(){

  $.i18n().locale = options('locale');

  $('html').attr('lang', options('locale'));
  
  $('*[data-i18n]').i18n();

  $('*[data-i18n-label]').each(function(){

    $(this).attr('aria-label', $.i18n($(this).attr('data-i18n-label')));
    $(this).attr('title', $.i18n($(this).attr('data-i18n-label')));

  });

  $('#converted-western-date, #converted-islamic-date').children().each(function(){

    if($(this).parent().attr('id') == 'converted-western-date') var calendar = 'gre';
    else if($(this).parent().attr('id') == 'converted-islamic-date') var calendar = 'isl';

    if($(this).attr('class') == 'converted-day'){

      if(typeof $(this).attr('data-day') !== 'undefined') $(this).text(
        $.i18n('day' + $(this).attr('data-day') + 'long')
      );

    }
    else if($(this).attr('class') == 'converted-date'){

      if(typeof $(this).attr('data-date') !== 'undefined') $(this).text(
        $(this).attr('data-date')
      );

    }
    else if($(this).attr('class') == 'converted-month'){

      if(typeof $(this).attr('data-month') !== 'undefined') $(this).text(
        $.i18n(calendar + 'Month' + $(this).attr('data-month') + 'long' + ($.i18n().locale == 'pl' ? '-gen' : ''))
      );

    }
    else if($(this).attr('class') == 'converted-year'){

      if(typeof $(this).attr('data-year') !== 'undefined') $(this).text(
        $(this).attr('data-year')
      );

    }

  });

  // Separate localization for Ethiopic elements

  if(userPreferences('language') == 'om') $.i18n().locale = 'om';
  else if(options('locale') == 'am-eth' || options('locale') == 'ti-eth'){
    $.i18n().locale = userPreferences('language') + '-eth';
  }
  else $.i18n().locale = (
    userPreferences('language') +
    (userPreferences('useScript') ? '-eth' : '-lat')
  );

  $('select#go-to-month option').i18n();
  $('select#convert-ethiopic-month').i18n();

  $('#converted-ethiopic-date .converted-day').text(
    ($.i18n().locale == 'gez-eth' ? 'ዕለተ፡ ' : '') +
    $.i18n('day' + $('#converted-ethiopic-date .converted-day').attr('data-day') + 'long')
  );

  $('#converted-ethiopic-date .converted-date').text(
    toEthiopicNumeral(parseInt($('#converted-ethiopic-date .converted-date').attr('data-date')), userPreferences('useNumerals'))
  );

  $('#converted-ethiopic-date .converted-month').text(
    ($.i18n().locale == 'gez-eth' ? 'ለ' : '') +
    $.i18n('ethMonth' + $('#converted-ethiopic-date .converted-month').attr('data-month') + 'long')
  );

  $('#converted-ethiopic-date .converted-year').text(
    toEthiopicNumeral(parseInt($('#converted-ethiopic-date .converted-year').attr('data-year')), userPreferences('useNumerals'))
  );

}

/**
 * For pre-filling forms with options/preferences
 */
function fillForms(){

  // Go to... field
  $('select#go-to-month option').removeAttr('selected');
  $('select#go-to-month option[value="' + options('month').month + '"]').attr('selected', '');
  $('input#go-to-year').val(
    (userPreferences('useAmataAlam') ? options('month').year + 5500 : options('month').year)
  );

  // Locale selection
  $('div#locale-picker a.panel-block').removeClass('is-active');
  $('div#locale-picker a.panel-block[data-value="' + options('locale') + '"]').addClass('is-active');

  // User preferences - select
  $('div#userPreferences-window li a[data-value]').removeClass('is-active');
  $('div#userPreferences-window ul#firstWeekday a[data-value="' + userPreferences('firstWeekday') + '"]').addClass('is-active');
  $('div#userPreferences-window ul#alternateCalendar a[data-value="' + userPreferences('alternateCalendar') + '"]').addClass('is-active');
  $('div#userPreferences-window ul#language a[data-value="' + userPreferences('language') + '"]').addClass('is-active');

  // User preferences - toggles
  $('.toggle-control').each(function(){

    $(this).children('.toggle').removeAttr('data-is-true').removeAttr('disabled');
    if(userPreferences($(this).attr('id'))) $(this).children('.toggle').attr('data-is-true', '');

  });

  // Special form changes based on language/locale
  if(userPreferences('language') == 'om'){

    $('#useScript .toggle').removeAttr('data-is-true').attr('disabled', '');
    $('#useNumerals .toggle').removeAttr('data-is-true').attr('disabled', '');
    if(options('locale') == 'om') $('#localeDayNames .toggle').attr('data-is-true', '').attr('disabled', '');

  }
  else if(options('locale') == 'am-eth'){

    $('#useScript .toggle').attr('data-is-true', '').attr('disabled', '');
    if(userPreferences('language') == 'am') $('#localeDayNames .toggle').attr('data-is-true', '').attr('disabled', '');

  }
  else if(options('locale') == 'ti-eth'){

    $('#useScript .toggle').attr('data-is-true', '').attr('disabled', '');
    if(userPreferences('language') == 'ti') $('#localeDayNames .toggle').attr('data-is-true', '').attr('disabled', '');

  }

}

/**
 * For converting dates and displaying the result
 * @param {{year: number, month: number, date: number}} date 
 * @param {string} calendar
 * @param {boolean} [isAmataAlam=false]
 */
function convertDate(date, calendar, isAmataAlam){

  if(calendar == 'ethiopic') jdn = ethiopicToJdn(date, isAmataAlam);
  else if(calendar == 'western') jdn = westernToJdn(date);
  else if(calendar == 'islamic') jdn = islamicToJdn(date);

  if(jdn === false) {
    alert('The date entered was invalid.');
    return false;
  }

  var ethiopicDate = jdnToEthiopic(jdn, isAmataAlam);

  $('#converted-ethiopic-date .converted-day').attr('data-day', ethiopicDate.day);

  $('#converted-ethiopic-date .converted-date').attr('data-date', ethiopicDate.date);
  $('input#convert-ethiopic-date').val(ethiopicDate.date);

  $('#converted-ethiopic-date .converted-month').attr('data-month', ethiopicDate.month);
  $('select#convert-ethiopic-month').val(ethiopicDate.month);

  $('#converted-ethiopic-date .converted-year').attr('data-year', ethiopicDate.year);
  $('input#convert-ethiopic-year').val(ethiopicDate.year);
  
  var westernDate = jdnToWestern(jdn);

  $('#converted-western-date .converted-day').attr('data-day', westernDate.day);

  $('#converted-western-date .converted-date').attr('data-date', westernDate.date);
  $('input#convert-western-date').val(westernDate.date);

  $('#converted-western-date .converted-month').attr('data-month', westernDate.month);
  $('select#convert-western-month').val(westernDate.month);

  $('#converted-western-date .converted-year').attr('data-year', westernDate.year);
  $('input#convert-western-year').val(westernDate.year);

  var islamicDate = jdnToIslamic(jdn);

  if(islamicDate){
    
    $('#converted-islamic-date .converted-day').attr('data-day', islamicDate.day);

    $('#converted-islamic-date .converted-date').attr('data-date', islamicDate.date);
    $('input#convert-islamic-date').val(islamicDate.date);

    $('#converted-islamic-date .converted-month').attr('data-month', islamicDate.month);
    $('select#convert-islamic-month').val(islamicDate.month);

    $('#converted-islamic-date .converted-year').attr('data-year', islamicDate.year);
    $('input#convert-islamic-year').val(islamicDate.year);

  }
  else{

    $('input#convert-islamic-year').val(1);
    $('select#convert-islamic-month').val(1);
    $('input#convert-islamic-date').val(1);

    $('#converted-islamic-date span').removeAttr('data-day data-date data-month data-year').text('');

  }

  localize();

}

/**
 * Retrieves and sets options.
 * @param {*} [option] 
 * @param {*} [value] 
 */
function options(option, value){

  const defaults = {
    month: {
      year: today.year,
      month: today.month
    },
    locale: 'en'
  };

  if(typeof value === 'undefined'){

    var options = {};

    // the month to be displayed in the calendar
    if(typeof option === 'undefined' || option == 'month'){

      if(localStorage.getItem('month') === null) localStorage.setItem('month', JSON.stringify(defaults.month));
    
      options.month = JSON.parse(localStorage.getItem('month'));
    
      if(!('month' in options.month)) options.month.month = today.month;
      else if(options.month.month < 1) options.month.month = 1;
      else if(options.month.month > 13) options.month.month = 13;


      if(!('year' in options.month)) options.month.year = today.year;
      else if(options.month.year < 1) options.month.year = 1;

    }

    // the locale
    if(typeof option === 'undefined' || option == 'locale'){

      if(localStorage.getItem('locale') === null) localStorage.setItem('locale', defaults.locale);
      
      options.locale = localStorage.getItem('locale');

    }

    // the user preferences
    options.userPreferences = userPreferences();

    if(option == 'month') return options.month;
    else if(option == 'locale') return options.locale;
    else if(option == 'userPreferences') return options.userPreferences;
    else return options;

  }
  else if(typeof option !== 'undefined' && typeof value !== 'undefined'){
    
    if(typeof value == 'string') localStorage.setItem(option, value);
    else if(typeof value == 'object') localStorage.setItem(option, JSON.stringify(value));

  }

}

/**
 * Retrieves and sets user preferences.
 * @param {*} [preference] 
 * @param {*} [value] 
 */
function userPreferences(preference, value){

  const defaults = {
    firstWeekday: 2,
    useAmataAlam: false,
    showAlternateDates: true,
    alternateCalendar: 'gre',
    language: 'gez',
    localeDayNames: true,
    useDarkTheme: false,
    useScript: true,
    useNumerals: true
  }

  var userPreferences = {};
    
  if(localStorage.getItem('userPreferences') === null){
    
    localStorage.setItem('userPreferences', JSON.stringify(defaults));
    userPreferences = defaults;

  }
  else{
    
    userPreferences = JSON.parse(localStorage.getItem('userPreferences'));

    var needToUpdate = false;
    for(const key in userPreferences){
      
      if(!(key in userPreferences)) {
        userPreferences[key] = defaults[key];
        needToUpdate = true;
      }

    }

    if(needToUpdate) localStorage.setItem('userPreferences', JSON.stringify(userPreferences));

  }

  if(typeof preference === 'undefined') return userPreferences;
  else if(typeof value === 'undefined') return  userPreferences[preference];
  else{

    userPreferences[preference] = value;
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));

  }

}