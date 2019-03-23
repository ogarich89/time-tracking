import { IMaskInput } from 'react-imask';
import IMask from 'imask';
import moment from 'moment';
import React from 'react';

export default ({ pattern = 'HH:mm:ss', onChange = undefined, name }) => (
  <IMaskInput
    type="text"
    mask={Date}
    onChange={onChange}
    pattern={pattern}
    name={name}
    { ...{
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
      format: (date) => moment(date).format(pattern),
      parse: (str) => moment(str, pattern)
    } }
  />
);
