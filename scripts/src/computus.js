/*!
 * Functions to generate an Ethiopic computus table
 * By Augustine Dickinson
 *
 * Copyright (c) 2020 Ethiopicist.com and its contributors.
 *
 * @licence MIT License
 */

(function($){

  var methods = {
    init: function(year, options){

      computusTable(this, year, options);

    }
  };

  $.fn.seaOfComputation = function(method){
    // Method calling logic
    if(methods[method]){
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if(typeof method === 'object' || !method){
      return methods.init.apply(this, arguments);
    }
    else{
      $.error('Method ' +  method + ' does not exist in jQuery.seaOfComputation');
    }    

  };

  function computusTable(element, year, options){
    
    var tableBody = element.children('tbody');
    const userPreferences = options.userPreferences;

    if(userPreferences.language == 'om') $.i18n().locale = 'om';
    else if(options.locale == 'am-eth' || options.locale == 'ti-eth'){
      $.i18n().locale = options.locale;
    }
    else $.i18n().locale = (
      userPreferences.language +
      (userPreferences.useScript ? '-eth' : '-lat')
    );

    for(
        y = (year < 362 ? 353 : year - 9);
        y <= (year < 362 ? 371 : year + 9);
        y++
      ){

      var row = $('<tr />');

      $('<td class="has-text-right" />').text(
        toEthiopicNumeral((userPreferences.useAmataAlam ? y + 5500 : y), userPreferences.useNumerals)
      ).appendTo(row);

      if($.i18n().locale == 'gez-lat' || $.i18n().locale == 'am-lat' || $.i18n().locale == 'ti-lat'){
        $('<td class="has-text-centered" />').attr('data-i18n', 'evangelist' + (y % 4)).appendTo(row);
      }
      else{
        $('<td class="has-text-centered" />').text(
          $.i18n('evangelist' + (y % 4))
        ).appendTo(row);
      }

      $('<td class="has-text-centered" />').text(
        toEthiopicNumeral(toAmataQamar(y), userPreferences.useNumerals)
      ).appendTo(row);

      $('<td class="has-text-centered" />').text(
        toEthiopicNumeral(manbar(y), userPreferences.useNumerals)
      ).appendTo(row);

      $('<td class="has-text-centered" />').text(
        toEthiopicNumeral(tentyon(y), userPreferences.useNumerals)
      ).appendTo(row);

      $('<td class="has-text-centered" />').text(
        (abaqte(y) ? toEthiopicNumeral(abaqte(y), userPreferences.useNumerals) : (userPreferences.useNumerals ? 'አልቦ' : '0'))
      ).appendTo(row);

      $('<td class="has-text-centered" />').text(
        toEthiopicNumeral(matqe(y), userPreferences.useNumerals)
      ).appendTo(row);

      $.each(
        ['nineveh', 'lent', 'mountOfOlives', 'palmSunday', 'goodFriday', 'easter', 'synod', 'ascension', 'pentecost', 'apostles', 'salvation'],
        function(key, event){

          $('<td class="has-text-centered" />').text(
            $.i18n('ethMonth' + moveable(event, y).month + 'short') +
            " " +
            toEthiopicNumeral(moveable(event, y).date, userPreferences.useNumerals)
          ).attr(
            'data-month', moveable(event, y).month
          ).attr(
            'data-year', y
          ).attr(
            'data-date', moveable(event, y).date
          ).appendTo(row);

        }
      );

      if(y == year) row.addClass('is-selected');

      row.appendTo(tableBody);

    }

  }

  /**
   * Calculates the tentyon of a given Ethiopic year.
   * @param {number} year An Ethiopic year
   */
  function tentyon(year){

    const dow = dayOfWeek(ethiopicToJdn({
      year: year,
      month: 1,
      date: 1
    }));

    if((dow + 4) % 7 == 0) return 7;
    else return (dow + 4) % 7;

  }

  /**
  * Calculates the manbar of a given Ethiopic year.
  * This is the number in the 19-year cycle.
  * @param {number} year An Ethiopic year
  */
  function manbar(year){

    var w = year % 19;
    
    if(w < 11) w += 9;
    else w -= 10;

    return w;

  }

  /**
  * Converts a given Ethiopic year to Amata Qamar.
  * This is the number in the 532-year cycle.
  * @param {number} year An Ethiopic year
  */
  function toAmataQamar(year, withCycle){
    
    var cycle = Math.floor(((year + 5500) / 532) - 10);
    year = (year + 5500) % 532;
    if(year == 0) year = 532;

    if(typeof withCycle === 'boolean' && withCycle){
      return {
        cycle: cycle,
        year: year
      };
    }
    else return year;
  }

  /**
  * Calculates the abaqte of a given Ethiopic year.
  * @param {number} year An Ethiopic year
  */
  function abaqte(year){

    return ((manbar(year) - 1) * 11) % 30;

  }

  /**
  * Calculates the matqe of a given Ethiopic year.
  * @param {number} year An Ethiopic year
  */
  function matqe(year){

    var m = ((manbar(year) - 1) * 19) % 30;
    if(m == 0) m = 30;

    return m;
  }

  /**
  * Calculates the JDN of Easter for a given Ethiopic year.
  * @param {number} year An Ethiopic year
  */
  function computus(year){

    const m = matqe(year);
    var jdn;

    jdn = ethiopicToJdn({
      year: year,
      month: (m > 14 ? 1 : 2),
      date: m
    });

    jdn += 190;

    jdn += 7 - ((jdn + 1.5) % 7);

    return jdn;

  }

  function moveable(event, year){

    const offsets = {
      'nineveh': -69,
      'lent': -55,
      'mountOfOlives': -28,
      'palmSunday': -7,
      'goodFriday': -2,
      'easter': 0,
      'synod': 24,
      'ascension': 39,
      'pentecost': 49,
      'apostles': 50,
      'salvation': 52
    }

    var jdn = computus(year);

    jdn += offsets[event];

    return jdnToEthiopic(jdn);

  }

})(jQuery);