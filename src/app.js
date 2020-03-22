/*!
 * jQuery Ethiopic Calendar App
 * By Augustine Dickinson
 *
 * Copyright (c) 2020 Ethiopicist.com and its contributors.
 *
 * @licence MIT License
 */

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

  $(document).on('click', 'div[id^="go-to-buttons"] a[id^="go-to-"]', function(){
    
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
  * Arrow keys function like go-to buttons
  */

  $(document).keydown(function(e) {

    switch(e.which) {
      case 37: $('a#go-to-prev').trigger('click');// left
      break;

      case 38: $('a#go-to-prev').trigger('click');// up
      break;

      case 39: $('a#go-to-next').trigger('click');// right
      break;

      case 40: $('a#go-to-next').trigger('click');// down
      break;

      default: return;

    }

    e.preventDefault();

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

  // List of Ethiopian months for Go to...
  for(i = 1; i <= 13; i++){

    $('select#go-to-month').append(
      $('<option value="' + i + '" data-i18n="ethMonth' + i + 'long">')
    );

  }

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

  localize();
  fillForms();

  $('body').show();

}

/**
 * Callback function after updating the calendar
 */
function updateCallback(){

  localize();
  fillForms();
  
}

/**
 * Localizes elements with i18n localizations
 */
function localize(){

  $('html').attr('lang', options('locale'));
  
  $('*[data-i18n]').i18n();

  $('*[data-i18n-label]').each(function(){
    $(this).attr('aria-label', $.i18n($(this).attr('data-i18n-label')));
    $(this).attr('title', $.i18n($(this).attr('data-i18n-label')));
  });

  // Change locale for the Go to... month list
  if(userPreferences('language') == 'om') $.i18n().locale = 'om';
  else $.i18n().locale = (
    userPreferences('language') +
    (userPreferences('useScript') ? '-eth' : '-lat')
  );

  $('select#go-to-month option').i18n();

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