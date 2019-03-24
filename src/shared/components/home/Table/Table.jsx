import React, { Component } from 'react';
import style from './Table.scss';
import { getSettings, getClone, updateSettings, getLateHours } from './utils';
import cx from 'classnames';
import IMask from 'imask';
import moment from 'moment';

class Table extends Component {
  constructor (props) {
    super(props);
    this.state = {
      ...getSettings()
    };
  }

  componentDidMount () {
    const inputs = document.getElementsByClassName('js-input');
    const DATE_FORMAT = 'HH:mm:ss';
    Array.from(inputs).forEach(input => {
      new IMask(input, {
        mask: Date,
        pattern: DATE_FORMAT,
        blocks: {
          HH: {
            mask: IMask.MaskedRange,
            from: 0,
            to: 23
          },
          mm: {
            mask: IMask.MaskedRange,
            from: 0,
            to: 59
          },
          ss: {
            mask: IMask.MaskedRange,
            from: 0,
            to: 59
          }
        },
        format: (date) => moment(date).format(DATE_FORMAT),
        parse: (str) => moment(str, DATE_FORMAT)
      });
    });
  }

  setMonth({ target: { value: month } = {} }) {
    const { year } = this.state;
    this.setState({
      ...getSettings(`${month}.${year}`)
    });
  }

  setYear({ target: { value: year } = {} }) {
    const { month } = this.state;
    this.setState({
      ...getSettings(`${month}.${year}`)
    });
  }

  setValue({ target }, index) {
    const { month, year, isFuture } = this.state;
    const dates = getClone(this.state.dates);
    dates[index][target.name] = target.type === 'text' ? target.value : target.checked;
    this.setState({
      ...updateSettings(dates, { id: `${month}.${year}`, isFuture })
    });
  }

  render () {
    const {
      dates,
      amountHours,
      currentHours,
      nameMonth,
      months,
      month,
      year,
      workedHours = '0.0'
    } = this.state;
    return (
      <section className={style.table}>
        <ul className={style.list}>
          <li>Месяц: <span>{ nameMonth }</span></li>
          <li>Должно быть за месяц: <span>{ amountHours } ч.</span></li>
          <li>Должно быть на текущий момент: <span>{ currentHours } ч.</span></li>
          <li>Отработано: <span className={cx(style.green, {
            [style.red]: workedHours < currentHours
          })}>{ workedHours } ч.</span></li>
        </ul>
        <div className={style.dashboard}>
          <div className={style.selectContainer}>
            <select value={month} onChange={::this.setMonth}>
              {
                months.map(({ name, value }) => (
                  <option key={`option-${value}`} value={value}>{name}</option>
                ))
              }
            </select>
            <select value={year} onChange={::this.setYear}>
              {
                ['2018', '2019'].map((value) => (
                  <option key={`option-${value}`} value={value}>{value}</option>
                ))
              }
            </select>
          </div>
          <button>Редактировать</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Праздничный день</th>
              <th>Прибытие</th>
              <th colSpan={2}>Обеденный перерыв</th>
              <th>Убытие</th>
              <th>Опаздание</th>
              <th>Отгул</th>
            </tr>
          </thead>
          <tbody>
            {
              dates.map((item, index) => {
                const {
                  date,
                  isCurrent,
                  isWeekend,
                  isHoliday = false,
                  isTimeOff = false,
                  lunch_to,
                  lunch_from
                } = item;
                const late = getLateHours({ lunch_to, lunch_from });
                return (
                  <tr key={date}
                    className={cx({
                      [style.currentDate]: isCurrent,
                      [style.weekend]: isWeekend,
                      [style.timeoff]: isTimeOff
                    })}>
                    <td><span>{date}</span></td>
                    <td>
                      {
                        !isWeekend ?
                          <label>
                            <input type="checkbox" name="isHoliday" checked={isHoliday} onChange={event => ::this.setValue(event, index)}/>
                          </label> : null
                      }
                    </td>
                    {
                      ['checkIn', 'lunch_from', 'lunch_to', 'checkOut'].map(name => (
                        <td key={name}>
                          <input
                            className="js-input"
                            type="text"
                            name={name}
                            value={item[name] || ''}
                            onInput={event => ::this.setValue(event, index)}
                            onChange={event => ::this.setValue(event, index)}
                            onPaste={event => ::this.setValue(event, index)}
                            maxLength={8}
                          />
                        </td>
                      ))
                    }
                    <td>
                      <input
                        type="text"
                        readOnly={true}
                        value={late ? (moment.duration(late, 'seconds').asHours()).toFixed(1) : ''}
                      />
                    </td>
                    <td>
                      {
                        !isWeekend ?
                          <label>
                            <input type="checkbox" name="isTimeOff" checked={isTimeOff} onChange={event => ::this.setValue(event, index)}/>
                          </label> : null
                      }
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </section>
    );
  }

}

export default Table;
