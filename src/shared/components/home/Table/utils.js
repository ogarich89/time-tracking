import moment from 'moment';

const DATE_FORMAT = 'DD.MM.YYYY';

const getSettings = (monthAndYear = getCurrentMonth()) => {
  const momentMonthAndYear = moment(monthAndYear, 'MM.YYYY');
  const isFuture = momentMonthAndYear > moment();
  const days = momentMonthAndYear.daysInMonth();
  const dates = [];
  for(let i = 1; i <= days; ++i) {
    const date = `${moment(i, 'D').format('DD')}.${monthAndYear}`;
    const nameDay = moment(date, DATE_FORMAT).format('dddd');
    const isWeekend = { 'Saturday': true, 'Sunday': true }[nameDay];
    dates.push({
      isCurrent: getCurrentDate() === date,
      isWeekend,
      date,
      _hours: isWeekend ? 0 : 9
    });
  }
  let data = [];
  try {
    data = JSON.parse(localStorage.getItem(monthAndYear));
  } catch (e) {
    console.error(e);
  }
  dates.forEach((date, index, arr) => {
    arr[index] = { ...date, ...data[index] };
  });
  const [ month, year ] = monthAndYear.split('.');
  return {
    dates,
    amountHours: getAmountOfHours(dates),
    workedHours: getWorkedHours(dates),
    currentHours: isFuture ? 0 : getCurrentMomentHours(dates),
    nameMonth: moment(monthAndYear, 'MM.YYYY').locale('ru').format('MMMM'),
    months: getMonths(),
    month,
    year,
    isFuture
  };
};

const getAmountOfHours = (dates) => {
  let count = 0;
  for(const { _hours, isHoliday = false } of dates) {
    if(isHoliday) continue;
    count += _hours;
  }
  return count;
};

const getCurrentMomentHours = (dates) => {
  let count = 0;
  for(const { isCurrent, _hours, isHoliday } of dates) {
    if(isCurrent) break;
    if(isHoliday) continue;
    count += _hours;
  }
  return count;
};

const getMonths = () => {
  const arr = [];
  for(let i = 1; i <= 12; ++i) {
    const month = moment(i, 'M');
    arr.push({
      name: month.locale('ru').format('MMMM'),
      value: month.format('MM')
    });
  }
  return arr;
};

const getClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error(e);
    return [];
  }
};

const getCurrentDate = () => moment().format(DATE_FORMAT);

const getCurrentMonth = () => `${moment(moment().month() + 1, 'M').format('MM')}.${moment().year()}`;

const getWorkedHours = (dates) => {
  let count = 0;
  for(const date of dates) {
    const { checkIn, checkOut, lunch_from, lunch_to } = date;
    const _checkIn = moment.duration(checkIn, DATE_FORMAT).asSeconds();
    const _checkOut = moment.duration(checkOut, DATE_FORMAT).asSeconds();

    if(_checkIn && _checkOut && _checkIn < _checkOut) {
      const workTime = _checkOut - _checkIn;
      const late = getLateHours({ lunch_from, lunch_to });
      count += workTime - late;
    }
  }
  return (moment.duration(count, 'seconds').asHours()).toFixed(1);
};

const getLateHours = ({ lunch_from, lunch_to }) => {
  const _lunch_from = moment.duration(lunch_from, DATE_FORMAT).asSeconds();
  const _lunch_to = moment.duration(lunch_to, DATE_FORMAT).asSeconds();
  let late = 0;
  if(_lunch_from && _lunch_to && _lunch_from < _lunch_to) {
    const lunchTime = _lunch_to - _lunch_from;
    if(lunchTime > 3600) {
      late = lunchTime - 3600;
    }
  }
  return late;
};

const updateSettings = (dates, options) => {
  const { id, isFuture = false } = options;
  const data = dates.map(({ checkIn, checkOut, isTimeOff, isHoliday, lunch_to, lunch_from }) => {
    return { checkIn, checkOut, isTimeOff, isHoliday, lunch_to, lunch_from };
  });
  try {
    localStorage.setItem(id, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }

  return {
    amountHours: getAmountOfHours(dates),
    currentHours: isFuture ? 0 : getCurrentMomentHours(dates),
    dates,
    workedHours: getWorkedHours(dates)
  };
};

export { getSettings, getClone, updateSettings, getLateHours };
