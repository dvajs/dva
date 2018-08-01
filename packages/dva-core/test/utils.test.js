import expect from 'expect';
import { findIndex } from '../src/utils';

describe('utils', () => {
  describe('#findIndex', () => {
    it('should return -1 when no item matches', () => {
      const array = [1, 2, 3];
      const action = i => i === 4;

      expect(findIndex(array, action)).toEqual(-1);
    });

    it('should return index of the match item in array', () => {
      const array = ['a', 'b', 'c'];
      const action = i => i === 'b';

      const actualValue = findIndex(array, action);
      const expectedValue = 1;

      expect(actualValue).toEqual(expectedValue);
    });

    it('should return the first match if more than one items match', () => {
      const target = {
        id: 1,
      };

      const array = [target, { id: 1 }];
      const action = i => i.id === 1;

      expect(findIndex(array, action)).toEqual(0);
    });
  });
});
