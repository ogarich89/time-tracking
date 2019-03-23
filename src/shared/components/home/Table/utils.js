import moment from 'moment';

const getCurrentMonth = () => `${moment(moment().month() + 1, 'M').format('MM')}.${moment().year()}`;

const getSettings = (monthAndYear = getCurrentMonth()) => {
  const days = moment(monthAndYear, 'MM.YYYY').daysInMonth();
  const dates = [];
  for(let i = 1; i <= days; ++i) {
    const date = `${moment(i, 'D').format('DD')}.${monthAndYear}`;
    const nameDay = moment(date, 'DD.MM.YYYY').format('dddd');
    const isWeekend = { 'Saturday': true, 'Sunday': true }[nameDay];
    dates.push({
      isCurrent: getCurrentDate() === date,
      isWeekend,
      date,
      _hours: isWeekend ? 0 : 9
    });
  }
  const [ month, year ] = monthAndYear.split('.');
  return {
    datesInMonth: dates,
    amountHours: getAmountOfHours(dates),
    currentHours: getCurrentMomentHours(dates),
    nameMonth: moment(monthAndYear, 'MM.YYYY').locale('ru').format('MMMM'),
    months: getMonths(),
    month,
    year
  };
};

const getAmountOfHours = (dates) => {
  let count = 0;
  dates.forEach(({ _hours }) => count += _hours);
  return count;
};

const getCurrentMomentHours = (dates) => {
  let count = 0;
  for(const { isCurrent, _hours } of dates) {
    if(isCurrent) break;
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

const getClone = (obj) => JSON.parse(JSON.stringify(obj));

const getCurrentDate = () => moment().format('DD.MM.YYYY');



export { getSettings, getClone };
