import expect from 'expect';
import { create as dva } from 'dva-core';
import createError from '../src/index';

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));
const reject = msg => Promise.reject(new Error(msg));

describe('dva-core', () => {
  describe('dva-error', () => {
    it('normal', done => {
      const app = dva();
      app.use(createError());
      app.model({
        namespace: 'count',
        state: 0,
        reducers: {
          add(state, { payload }) {
            return state + payload;
          },
        },
        effects: {
          *addRemote(action, { put }) {
            yield delay(100);
            if (typeof action.payload !== 'number') {
              yield reject('wrong_type');
            }
            yield put({ type: 'add', payload: action.payload });
          },
        },
      });
      app.start();

      expect(app._store.getState().error).toEqual({
        global: [],
        models: {},
        effects: {},
      });
      app._store.dispatch({ type: 'count/addRemote', payload: 'wrong_payload' });
      expect(app._store.getState().error).toEqual({
        global: [],
        models: { count: [] },
        effects: { 'count/addRemote': undefined },
      });
      setTimeout(() => {
        const error = new Error('wrong_type');
        expect(app._store.getState().error).toEqual({
          global: [error],
          models: { count: [error] },
          effects: { 'count/addRemote': error },
        });
        done();
      }, 200);
    });

    it('opts.namespace', () => {
      const app = dva();
      app.use(
        createError({
          namespace: 'fooError',
        }),
      );
      app.model({
        namespace: 'count',
        state: 0,
      });
      app.start();
      expect(app._store.getState().fooError).toEqual({
        global: [],
        models: {},
        effects: {},
      });
    });

    it('opts.only', () => {
      const app = dva();
      app.use(
        createError({
          only: ['count/a'],
        }),
      );
      app.model({
        namespace: 'count',
        state: 0,
        effects: {
          *a(action, { call }) {
            yield call(delay, 500);
            yield reject('effect_a_error');
          },
          *b(action, { call }) {
            yield call(delay, 500);
            yield reject('effect_b_error');
          },
        },
      });
      app.start();

      expect(app._store.getState().error).toEqual({
        global: [],
        models: {},
        effects: {},
      });
      app._store.dispatch({ type: 'count/a' });
      setTimeout(() => {
        expect(app._store.getState().error).toEqual({
          global: [],
          models: { count: [] },
          effects: { 'count/a': undefined },
        });
        app._store.dispatch({ type: 'count/b' });
        setTimeout(() => {
          const a_error = new Error('effect_a_error');
          const b_error = new Error('effect_b_error');
          expect(app._store.getState().error).toEqual({
            global: [a_error],
            models: { count: [a_error] },
            effects: { 'count/a': a_error },
          });
          setTimeout(() => {
            expect(app._store.getState().error).toEqual({
              global: [a_error],
              models: { count: [a_error] },
              effects: { 'count/a': a_error },
            });
          }, 300);
        }, 300);
      }, 300);
    });

    it('opts.except', () => {
      const app = dva();
      app.use(
        createError({
          except: ['count/a'],
        }),
      );
      app.model({
        namespace: 'count',
        state: 0,
        effects: {
          *a(action, { call }) {
            yield call(delay, 500);
            yield reject('effect_a_error');
          },
          *b(action, { call }) {
            yield call(delay, 500);
            yield reject('effect_b_error');
          },
        },
      });
      app.start();

      expect(app._store.getState().error).toEqual({
        global: [],
        models: {},
        effects: {},
      });
      app._store.dispatch({ type: 'count/a' });
      setTimeout(() => {
        expect(app._store.getState().error).toEqual({
          global: [],
          models: {},
          effects: {},
        });
        app._store.dispatch({ type: 'count/b' });
        setTimeout(() => {
          expect(app._store.getState().error).toEqual({
            global: [],
            models: { count: [] },
            effects: { 'count/b': undefined },
          });
          setTimeout(() => {
            const b_error = new Error('effect_b_error');
            expect(app._store.getState().error).toEqual({
              global: [b_error],
              models: { count: [b_error] },
              effects: { 'count/b': b_error },
            });
          }, 300);
        }, 300);
      }, 300);
    });

    it('opts.only and opts.except ambiguous', () => {
      expect(() => {
        const app = dva();
        app.use(
          createError({
            only: ['count/a'],
            except: ['count/b'],
          }),
        );
      }).toThrow('ambiguous');
    });

    it('multiple effects', done => {
      const app = dva();
      app.use(createError());
      app.model({
        namespace: 'count',
        state: 0,
        effects: {
          *a(action, { call }) {
            yield call(delay, 100);
            yield reject('effect_a_error');
          },
          *b(action, { call }) {
            yield call(delay, 500);
            yield reject('effect_b_error');
          },
        },
      });
      app.start();
      app._store.dispatch({ type: 'count/a' });
      app._store.dispatch({ type: 'count/b' });
      const a_error = new Error('effect_a_error');
      const b_error = new Error('effect_b_error');
      setTimeout(() => {
        expect(app._store.getState().error.models.count).toEqual([a_error]);
      }, 200);
      setTimeout(() => {
        expect(app._store.getState().error.models.count).toEqual([a_error, b_error]);
        done();
      }, 800);
    });
  });
});
