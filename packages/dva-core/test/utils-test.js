import expect from 'expect';
import { deepClone } from '../src/utils';

const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

describe('utils', () => {
  it('deepClone', () => {
    let model = {
      state: {
        count: 1
      },
      effects: {
        *asyncAdd({ payload }, { call, put }) {
          yield call(delay, 100);
          yield put({
            type: 'add',
            payload
          });
        }
      },
      reduers: {
        add(state, { payload }) {
          return { ...state, count: state.count + payload };
        }
      }
    };
    let clonemodel = deepClone(model);
    expect(clonemodel).toBeA('object');
    expect(model === clonemodel).toEqual(false);
    expect(model).toEqual(clonemodel);
  });
});