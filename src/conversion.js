/*!
 * Functions to Convert Between Ethiopic dates, Western (Julian/Gregorian) dates, and Islamic dates
 * By Augustine Dickinson
 *
 * Copyright (c) 2020 Ethiopicist.com and its contributors.
 *
 * @licence MIT License
 */

/**
 * To convert an Ethiopic date to a JDN.
 * @param {{year: number, month: number, date: number}} date 
 * @param {boolean} [isAmataAlam=false]
 */
function ethiopicToJdn(date, isAmataAlam){

  // Verify that the argument for date is a valid type

  if(typeof date !== 'object'){
      console.log('Parameter date expects an object.');
      return false;
  }
  else if(!('year' in date) || !('month' in date)){
      console.log('Parameter date must contain a year and a month.');
      return false;
  }
  else if(!('date' in date)) date.date = 1;

  if(
      (typeof date.year !== 'number' && typeof date.year !== 'string') ||
      (typeof date.month !== 'number' && typeof date.month !== 'string') ||
      (typeof date.date !== 'number' && typeof date.date !== 'string')
  ){
      console.log('Values for date must be numbers or strings.');
      return false;
  }
  else{
      date.year = parseInt(date.year);
      date.month = parseInt(date.month);
      date.date = parseInt(date.date);
  }

  // Verify that the argument for date is a valid date

  if(date.month < 1 || date.month > 13){
      console.log('date.month must be an integer from 1 (Mas) to 13 (Pag).');
      return false;
  }
  else if(date.date < 1 || date.date > 30){
      console.log('date.date must be an integer from 1 to 30.');
      return false;
  }
  else if(date.month == 13){
      if(
          date.year % 4 == 3 &&
          date.date > 6
      ){
          console.log('In leap years, if date.month == 13 then date.date must be <=6.');
          return false;
      }
      else if(
      date.year % 4 != 3 &&
      date.date > 5
      ){
          console.log('In non-leap years, if date.month == 13 then date.date must be <=5.');
          return false;
      }
  }

  // Verify that the argument for isAmataAlam is a valid type

  if(typeof isAmataAlam === 'undefined') var isAmataAlam = false;
  else if(typeof isAmataAlam !== 'boolean'){
      console.log('Parameter isAmataAlam expects a boolean value.');
      return false;
  }

  // For Amata Alam we need to subtract 5500

  if(isAmataAlam) date.year -= 5500;

  // If date < 1/1/1 then error

  if(date.year < 1){
      console.log('Dates before 1/1/1 AM are invalid.');
      return false;
  }

  const n = 30 * date.month + date.date - 31;
  const jdn = (1723856 + 365) + 365 * (date.year - 1) + Math.floor(date.year / 4) + n - 0.5;

  return jdn;

}

/**
 * To convert a Western date to a JDN,
 * where "Western" is defined as:
 * Gregorian for dates on or after October 15, 1582 or
 * Julian for dates on or before October 4, 1582.
 * @param {{year: number, month: number, date: number}} date 
 */
function westernToJdn(date){
  // Verify that the argument for date is a valid type
  
  if(typeof date !== 'object'){
      console.log('Parameter date expects an object.');
      return false;
  }
  else if(!('year' in date) || !('month' in date)){
      console.log('Parameter date must contain a year and a month.');
      return false;
  }
  else if(!('date' in date)) date.date = 1;
  
  if(
      (typeof date.year !== 'number' && typeof date.year !== 'string') ||
      (typeof date.month !== 'number' && typeof date.month !== 'string') ||
      (typeof date.date !== 'number' && typeof date.date !== 'string')
  ){
      console.log('Values for date must be numbers or strings.');
      return false;
  }
  else{
      date.year = parseInt(date.year);
      date.month = parseInt(date.month);
      date.date = parseInt(date.date);
  }
  
  // Verify that the argument for date is a valid date
  
  if(date.month < 1 || date.month > 12){
      console.log('date.month must be an integer from 1 (Jan) to 12 (Dec).');
      return false;
  }
  else if(date.date < 1 || date.date > 31){
      console.log('date.date must be an integer from 1 to 31.');
      return false;
  }
  else if(
      (date.month == 4 || date.month == 6 || date.month == 9 || date.month == 11) && date.date > 30
  ){
      console.log('For date.month in [4,6,9,11] date.date must be <= 30.');
      return false;
  }
  else if(date.month == 2){
      if(
          date.year % 4 == 0 &&
          (date.year <= 1582 ||
          date.year % 100 != 0 ||
          date.year % 400 == 0) &&
          date.date > 29
      ){
          console.log('In leap years, if date.month == 2 then date.date must be <=29.');
          return false;
      }
      else if(date.date > 28){
          console.log('In non-leap years, if date.month == 2 then date.date must be <=28.');
          return false;
      }
  }

  // First convert to JDN
  // This formula can be adjusted for both
  // Julian and Gregorian
  
  if(date.month < 3){
      date.year--;
      date.month += 12;
  }
  
  const a = Math.floor(date.year / 100);
  const b = Math.floor(a / 4);
  const c = 2 - a + b;
  const e = Math.floor(365.25 * (date.year + 4716));
  const f = Math.floor(30.6001 * (date.month + 1));
  
  // Use Gregorian conversion for dates >= 1582/10/15
  // Use Julian conversion for dates <= 1582/10/4
  // If 1582/10/4 < date > 1582/10/15 then error
  // Or if date < 8/8/29
  
  if(
      date.year < 8 ||
      (date.year == 8 && date.month < 8) ||
      (date.year == 8 && date.month == 8 && date.date < 29)
  ){
      console.log('Dates before 8/8/29 are invalid.');
      return false;
  }
  else if(
      date.year < 1582 ||
      (date.year == 1582 && date.month < 10) ||
      (date.year == 1582 && date.month == 10 && date.date <= 4)
  ){
      var jdn = date.date + e + f - 1524.5;
  }
  else if(
      date.year > 1582 ||
      (date.year == 1582 && date.month > 10) ||
      (date.year == 1582 && date.month == 10 && date.date >= 15)
  ){
      var jdn = c + date.date + e + f - 1524.5;
  }
  else{
      console.log('Dates from 1582/10/5 to 1582/10/14 are invalid.');
      return false;
  }

  return jdn;
  
}

/**
 * To convert a JDN date to an Ethiopic date,
 * @param {number} jdn A Julian Day Number 
 * @param {boolean} [useAmataAlam=false]
 */
function jdnToEthiopic(jdn, useAmataAlam){

  // Verify that the argument for useAmataAlam is a valid type
  
  if(typeof useAmataAlam === 'undefined') var useAmataAlam = false;
  else if(typeof useAmataAlam !== 'boolean'){
      console.log('Parameter useAmataAlam expects a boolean value.');
      return false;
  }

  const r = (jdn - 1723855.5) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);

  date = {};    
  date.year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  date.month = Math.floor(n / 30) + 1;
  date.date = (n % 30) + 1;
  date.day = dayOfWeek(jdn);

  // For Amata Alam we only need to add 5500

  if(useAmataAlam) date.year += 5500;

  return date;
}

/**
 * To convert a JDN to a Western date,
 * where "Western" is defined as:
 * Gregorian for dates on or after October 15, 1582 or
 * Julian for dates on or before October 4, 1582.
 * @param {number} jdn A Julian Day Number
 */
function jdnToWestern(jdn){
  
  // Use Gregorian conversion for dates >= 1575/2/8 (JDN 2299160.5)
  // Use Julian conversion for dates <= 1575/2/7 (JDN 2299159.5)
  
  const q = jdn + 0.5;
  const z = Math.floor(q);
  
  if(jdn < 2299160.5){
      var a = z;
  }
  else{
      const w = Math.floor((z - 1867216.25) / 36524.25);
      const x = Math.floor(w / 4);
      var a = z + 1 + w - x;
  }
  
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const f = Math.floor(30.6001 * e);
  
  date = {};
  date.date = b - d - f + (q - z);
  date.month = (e - 1 <= 12 ? e - 1: e - 13);  
  date.year = (date.month <= 2 ? c - 4715 : c - 4716);
  date.day = dayOfWeek(jdn);
  
  return date;

}

/**
 * To convert an Ethiopic date to a Western date,
 * where "Western" is defined as:
 * Gregorian for dates on or after October 15, 1582 or
 * Julian for dates on or before October 4, 1582.
 * @param {{year: number, month: number, date: number}} date An Ethiopic date
 * @param {boolean} [isAmataAlam=false]
 */
function toWestern(date, isAmataAlam){

  return jdnToWestern(ethiopicToJdn(date, isAmataAlam));

}

/**
 * To convert an Ethiopic date to a Western date,
 * where "Western" is defined as:
 * Gregorian for dates on or after October 15, 1582 or
 * Julian for dates on or before October 4, 1582.
 * @param {{year: number, month: number, date: number}} date An Ethiopic date
 * @param {boolean} [isAmataAlam=false]
 */
function toEthiopic(date, useAmataAlam){

  return jdnToEthiopic(westernToJdn(date), useAmataAlam);

}

/**
 * To convert a JDN to an Islamic date,
 * Approximated according to typical algorithms.
 * @param {number} jdn A Julian Day Number
 */
function jdnToIslamic(jdn){

  if(jdn < 1948439.5) return false;

  const k2 = 30 * (jdn + 0.5 - 1948440) + 15;
  const k1 = 11 * Math.floor((k2 % 10631) / 30) + 5;
  
  var date = {};
  date.year = Math.floor(k2 / 10631) + 1;
  date.month = Math.floor(k1 / 325) + 1;
  date.date = Math.floor((k1 % 325) / 11) + 1;
  date.day = dayOfWeek(jdn);
  
  return date;
  
}

/**
 * To convert an Islamic date to a JDN,
 * Approximated according to typical algorithms.
 * @param {{year: number, month: number, date: number}} date An Islamic date
 */
function islamicToJdn(date){
  
  return Math.floor((10631 * date.year - 10617) / 30) + Math.floor((325 * date.month - 320) / 11) + date.date + 1948439 -0.5;
  
}

/**
 * To convert an Ethiopic date to an approximate Islamic date,
 * @param {{year: number, month: number, date: number}} date An Ethiopic date
 * @param {boolean} [isAmataAlam=false]
 */
function toIslamic(date, isAmataAlam){

  return jdnToIslamic(ethiopicToJdn(date, isAmataAlam));

}

/**
 * Determines the day of the week of a given JDN.
 * @param {number} jdn A Julian Day Number
 */
function dayOfWeek(jdn){
  return (jdn + 1.5) % 7 + 1;
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
 * Calculates the abaqte of a given Ethiopic year.
 * @param {number} year An Ethiopic year
 */
function abaqte(year){
    return false;
}

/**
 * Calculates the matqe of a given Ethiopic year.
 * @param {number} year An Ethiopic year
 */
function matqe(year){
    return false;
}





/**
 * Converts an Arabic numeral to an Ethiopic numeral
 * @param {number} x
 * @param {boolean} [useNumerals]
 */
function toEthiopicNumeral(x, useNumerals, insertAnd){

  if(typeof useNumerals !== 'undefined' && useNumerals === false) return x;
  
  if(typeof insertAnd === 'undefined' || insertAnd === false) var wa = '';
  else if(typeof insertAnd !== 'undefined' && insertAnd === true) var wa = 'ወ';

  if(typeof x !== 'number') x = parseInt(x);

       if(x == 0) return '';
  else if(x == 1) return '፩';
  else if(x == 2) return '፪';
  else if(x == 3) return '፫';
  else if(x == 4) return '፬';
  else if(x == 5) return '፭';
  else if(x == 6) return '፮';
  else if(x == 7) return '፯';
  else if(x == 8) return '፰';
  else if(x == 9) return '፱';

  else if(x >= 10 && x < 20) return '፲' + wa + toEthiopicNumeral(x - 10);
  else if(x >= 20 && x < 30) return '፳' + wa + toEthiopicNumeral(x - 20);
  else if(x >= 30 && x < 40) return '፴' + wa + toEthiopicNumeral(x - 30);
  else if(x >= 40 && x < 50) return '፵' + wa + toEthiopicNumeral(x - 40);
  else if(x >= 50 && x < 60) return '፶' + wa + toEthiopicNumeral(x - 50);
  else if(x >= 60 && x < 70) return '፷' + wa + toEthiopicNumeral(x - 60);
  else if(x >= 70 && x < 80) return '፸' + wa + toEthiopicNumeral(x - 70);
  else if(x >= 80 && x < 90) return '፹' + wa + toEthiopicNumeral(x - 80);
  else if(x >= 90 && x < 100) return '፺' + wa + toEthiopicNumeral(x - 90);

  else if(x >= 100 && x < 200) return '፻' + toEthiopicNumeral(x - 100);
  else if(x >= 200 && x < 10000) return toEthiopicNumeral((x - (x % 100)) / 100) + '፻' + toEthiopicNumeral(x % 100);

  else if(x >= 10000 && x < 20000) return '፼' + toEthiopicNumeral(x - 10000);
  else if(x >= 20000 && x < 1000000) return toEthiopicNumeral((x - (x % 10000)) / 10000) + '፼' + toEthiopicNumeral(x % 10000);
}