$(document).ready(function(){
  buildCalendar();

  // calendar onclick events
  $(document).on("click", "a#today", function(){
    var newDate = new Date();
    setTheDate(eDate(newDate).year, eDate(newDate).month, eDate(newDate).day);
  });

  $(document).on("click", "a#prev-month", function(){
    var newDate = firstOfMonth();
    newDate.setDate(newDate.getDate()-1);
    setTheDate(eDate(newDate).year, eDate(newDate).month, eDate(newDate).day);
  });

  $(document).on("click", "a#next-month", function(){
    var newDate = lastOfMonth();
    newDate.setDate(newDate.getDate()+1);
    setTheDate(eDate(newDate).year, eDate(newDate).month, eDate(newDate).day);
  });

  // set up prefs
  var preferences = JSON.parse(localStorage.getItem('preferences'));
  for(var pref in preferences){
    if(preferences.hasOwnProperty(pref)){
      if(typeof preferences[pref] === 'boolean'){
        if(preferences[pref]) $('#'+pref).attr('checked', true);
        else $('#'+pref).attr('checked', false);
      }
      else $('#'+pref).val(preferences[pref]);
    }
  }

  // prefs onclick and onchange events
  $(document).on("click", "a#open-preferences", function(){
    $('#preferences-overlay').show();
  });

  $(document).on("click", "a#close-preferences", function(){
    $('#preferences-overlay').hide();
  });


  $(document).on("change", "select", function(){
    setPref($(this).attr('id'), $(this).val());
  });

  $(document).on("change", "input[type=checkbox]", function(){
    setPref($(this).attr('id'), $(this).is(':checked'));
  });
});

///////////////////////
// Calendar Builder //
/////////////////////
function buildCalendar(){
  // calendar header
  // since text() will remove child elements, save them as a var
  var titleChildren = $('.calendar-title').children();
  $('.calendar-title').text(printTitle());
  $('.calendar-title').append(titleChildren);

  for(j = 0; j < 7; j++){
    $(".calendar-dow").append($('<th/>').text(printDayName(j)));
  }

  // calendar cells
  var iDate = firstOfCalendar();
  var i = 1;

  while(iDate <= lastOfMonth()){
    $("tbody").append('<tr id="calendar-row-'+i+'"></tr>');
    
    for(j = 0; j < 7; j++){
      var theCell = $('<td/>');

      if(getPref('showgDates')) theCell.append($('<span class="gdate"/>').text(iDate.getDate()));
      theCell.append($('<span class="edate"/>').text(printDayInt(eDate(iDate).day)));

      // highlight today
      if(iDate.toLocaleDateString() == new Date().toLocaleDateString()){
        theCell.addClass('today');
      }

      // if date belongs to prev/next month
      if(eDate(iDate).month != theDate('em')){
        theCell.addClass('outside');

        if(i == 1 && j == 0){
          theCell.append($('<span class="emonth"/>').text(printMonthName(eDate(iDate).month)));
        }

        else if(eDate(dayBefore(iDate)).month == theDate('em')){
          theCell.append($('<span class="emonth"/>').text(printMonthName(eDate(iDate).month)));
        }
      }

      // if date belongs to prev/next gregorian month
      if(dayBefore(iDate).getMonth() !== iDate.getMonth() || (i == 1 && j == 0)){
        if(getPref('showgDates')) theCell.append($('<span class="gmonth"/>').text(iDate.toLocaleString('en-us', {month: (getPref('longNames') ? "long" : "short")})));
      }

      $("#calendar-row-"+i).append(theCell);
      
      iDate.setDate(iDate.getDate()+1);
    }
    i++;
  }

  // filler rows, mainly for Pagumen
  while(i <= 5){
    $("tbody").append('<tr id="calendar-row-'+i+'"><td colspan="7"/></tr>');
    i++;
  }
}

function rebuildCalendar(){
  // reset calendar header
  var titleChildren = $('.calendar-title').children();
  $('.calendar-title').text('');
  $('.calendar-title').append(titleChildren);

  $(".calendar-dow").html('');

  // reset calendar
  $("tbody").html('');

  //build calendar again
  buildCalendar();

  return;
}

////////////////////////////
// Application Functions //
//////////////////////////

function getPref(pref){
  // the default prefs
  var defaults = {
    'ethletters': true,
    'ethnumbers': true,
    'monthNames': 'gez',
    'dowNames': 'gez',
    'longNames': true,
    'showgDates': true
  };

  // if prefs have not been set, set them to the defaults
  if(localStorage.getItem('preferences') === null) localStorage.setItem('preferences', JSON.stringify(defaults));

  // retrieve and parse prefs
  var preferences = JSON.parse(localStorage.getItem('preferences'));
  if(typeof preferences !== 'object') localStorage.setItem('preferences', JSON.stringify(defaults));

  // check if pref is valid
  if(!defaults.hasOwnProperty(pref)) return false;
  // if pref is missing, set it to the default
  else if(!preferences.hasOwnProperty(pref)){
    preferences[pref] = defaults[pref];
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }

  return preferences[pref];
}

function setPref(pref, val){
  // validate val
  var types = {
    'ethletters': 'boolean',
    'ethnumbers': 'boolean',
    'monthNames': ['gez', 'amh', 'tig'],
    'dowNames': ['gez', 'amh', 'tig', 'eng'],
    'longNames': 'boolean',
    'showgDates': 'boolean'
  }
  if(!types.hasOwnProperty(pref)) return false; // not a valid pref
  else if(typeof types[pref] == 'object'){
    if(!types[pref].includes(val)) return false; // not a valid value for val
  }
  else if(typeof val !== types[pref]) return false; // not a valid value for val
  
  // get old prefs
  var preferences = JSON.parse(localStorage.getItem('preferences'));
  
  // update prefs
  preferences[pref] = val;
  localStorage.setItem('preferences', JSON.stringify(preferences));

  rebuildCalendar();

  return;
}

function theDate(t){
  // retrieve currentDate from local storage
  var date = JSON.parse(localStorage.getItem("currentDate"));

  if(date !== null && typeof date === 'object' && date.hasOwnProperty('year') && date.hasOwnProperty('month') && date.hasOwnProperty('day')){
    if(t == 'ey') return date.year;
    else if(t == 'em') return date.month;
    else if(t == 'ed') return date.day;
    
    else if(t == 'gy' || t == 'gm' || t == 'gd'){
      date = ethiopicToGregorian(date.year, date.month, date.day);

      if(t == 'gy') return date.year;
      else if(t == 'gm') return date.month;
      else if(t == 'gd') return date.day;
    }
    
    else return false;
  }
  
  // if there is no saved date in localstorage, use today's date
  else{
    var today = new Date();
    today = gregorianToEthiopic(today.getFullYear(), today.getMonth()+1, today.getDate());

    localStorage.setItem('currentDate', JSON.stringify({
      'year': today.year,
      'month': today.month,
      'day': today.day
    }));

    return theDate(t);
  }
}

function setTheDate(y, m, d){
  localStorage.setItem('currentDate', JSON.stringify({
    'year': y,
    'month': m,
    'day': d
  }));

  rebuildCalendar();

  return;
}

////////////////////////////////////
// Calendar Calcuation Functions //
//////////////////////////////////

// return a Date object for the first day of the Ethiopian month
function firstOfMonth(){
  var firstDay = ethiopicToGregorian(theDate('ey'), theDate('em'), 1);
  return new Date(firstDay.year, firstDay.month-1, firstDay.day);
}

// return a Date object for the first day displayed on the calendar
function firstOfCalendar(){
  var firstDay = firstOfMonth();
  var offset = firstOfMonth().getDay()-1;

  if(firstOfMonth().getDay() == 0) offset = 6;
  
  firstDay.setDate(firstDay.getDate()-offset);
  return firstDay;
}

// return a Date object for the last day of the Ethiopian month
function lastOfMonth(){
  if(theDate('em') == 13){
    if(theDate('ey') % 4 == 3) var lastDay = ethiopicToGregorian(theDate('ey'), theDate('em'), 6);
    else var lastDay = ethiopicToGregorian(theDate('ey'), theDate('em'), 5);
  }
  else var lastDay = ethiopicToGregorian(theDate('ey'), theDate('em'), 30);
  
  return new Date(lastDay.year, lastDay.month-1, lastDay.day);
}

function dayBefore(d){
  var dayBefore = new Date(d);
  dayBefore.setDate(dayBefore.getDate()-1);
  return dayBefore;
}

function dayAfter(d){
  var dayAfter = new Date(d);
  dayAfter.setDate(dayAfter.getDate()+1);
  return dayAfter;
}

// given a Date object, return the Ethiopian date
function eDate(d){
  return gregorianToEthiopic(d.getFullYear(), d.getMonth()+1, d.getDate());
}

//////////////////////////////
// Text Printing Functions //
////////////////////////////

function printMonthName(m){
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

  var gezMonthNamest = [
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
  tigMonthNames[5] = 'ለካቲት'; tigMonthNames[4] = 'ጥሪ';

  var tigMonthNamest = gezMonthNamest.slice();
  tigMonthNamest[5] = 'Lakkātit'; tigMonthNamest[4] = 'Ṭərri';

  var monthName= '';
  if(getPref('monthNames') == 'tig' && getPref('ethletters')) monthName = tigMonthNames[m-1];
  else if(getPref('monthNames') == 'tig') monthName = tigMonthNamest[m-1];
  else if(getPref('ethletters')) monthName = gezMonthNames[m-1];
  else monthName = gezMonthNamest[m-1];

  if(getPref('longNames')) return monthName;
  else return monthName.substr(0, 3);
}

function printDayName(d){
  var gezDayNames = [
    'ሰኑይ',
    'ሠሉስ',
    'ረቡዕ',
    'ኀሙስ',
    'ዐርብ',
    'ቀዳም',
    'እሑድ'
  ];

  var gezDayNamest = [
    'Sanuy',
    'Śalus',
    'Rabuʿ',
    'Ḫamus',
    'ʿArb',
    'Qadām',
    'ʾƎḥud'
  ];

  var amhDayNames = [
    'ሰኞ',
    'መክሰኞ',
    'ረቡዕ',
    'ኀሙስ',
    'ዓርብ',
    'ቅዳሜ',
    'እሑድ'
  ];

  var amhDayNamest = [
    'Saño',
    'Maksaño',
    'Rabuʿ',
    'Ḫamus',
    'ʿĀrb',
    'Qədāme',
    'ʾƎḥud'
  ];

  var engDayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];
  
  var dayName = '';
  if(getPref('dowNames') == 'eng') dayName = engDayNames[d];
  else if(getPref('dowNames') == 'eng') dayName = engDayNames[d];
  else if(getPref('dowNames') == 'amh' && getPref('ethletters')) dayName = amhDayNames[d];
  else if(getPref('dowNames') == 'amh') dayName = amhDayNamest[d];
  else if(getPref('ethletters')) dayName = gezDayNames[d];
  else dayName = gezDayNamest[d];

  if(getPref('longNames')) return dayName;
  // account for short names for days beginning with alf/ayn
  else if(d == 4 && getPref('dowNames') == 'amh' && !getPref('ethletters')) return 'ʿ'+dayName.substr(1, 3);
  else if(d == 6 && getPref('dowNames') == 'amh' && !getPref('ethletters')) return 'ʾ'+dayName.substr(1, 3);
  else return dayName.substr(0, 3);
}

function printDayInt(d){
  if(getPref('ethnumbers')) return ethiopicNumber(d);
  else return d;
}

function printTitle(){
  var theTitle = printMonthName(theDate('em'))+' ';

  if(getPref('ethnumbers')) theTitle = theTitle+ethiopicNumber(theDate('ey'));
  else theTitle = theTitle+theDate('ey');

  return theTitle;
}

function ethiopicNumber(x){
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

	else if(x >= 10 && x < 20) return '፲' + ethiopicNumber(x - 10);
	else if(x >= 20 && x < 30) return '፳' + ethiopicNumber(x - 20);
	else if(x >= 30 && x < 40) return '፴' + ethiopicNumber(x - 30);
	else if(x >= 40 && x < 50) return '፵' + ethiopicNumber(x - 40);
	else if(x >= 50 && x < 60) return '፶' + ethiopicNumber(x - 50);
	else if(x >= 60 && x < 70) return '፷' + ethiopicNumber(x - 60);
	else if(x >= 70 && x < 80) return '፸' + ethiopicNumber(x - 70);
	else if(x >= 80 && x < 90) return '፹' + ethiopicNumber(x - 80);
	else if(x >= 90 && x < 100) return '፺' + ethiopicNumber(x - 90);

	else if(x >= 100 && x < 200) return '፻' + ethiopicNumber(x - 100);
	else if(x >= 200 && x < 10000) return ethiopicNumber((x - (x % 100)) / 100) + '፻' + ethiopicNumber(x % 100);

	else if(x >= 10000 && x < 20000) return '፼' + ethiopicNumber(x - 10000);
	else if(x >= 20000 && x < 1000000) return ethiopicNumber((x - (x % 10000)) / 10000) + '፼' + ethiopicNumber(x % 10000);
}