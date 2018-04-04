import expect from 'expect';
import { create } from '../src/index';

describe('checkModel', () => {
  it('namespace should be defined', () => {
    const app = create();
    expect(() => {
      app.model({});
    }).toThrow(/\[app\.model\] namespace should be defined/);
  });

  it('namespace should be unique', () => {
    const app = create();
    expect(() => {
      app.model({
        namespace: 'repeat',
      });
      app.model({
        namespace: 'repeat',
      });
    }).toThrow(/\[app\.model\] namespace should be unique/);
  });

  it('reducers can be specified array', () => {
    const app = create();
    expect(() => {
      app.model({
        namespace: '_array',
        reducers: [{}, () => {}],
      });
    }).toNotThrow();
  });

  it('reducers can be object', () => {
    const app = create();
    expect(() => {
      app.model({
        namespace: '_object',
        reducers: {},
      });
    }).toNotThrow();
  });

  it('reducers can not be string', () => {
    const app = create();
    expect(() => {
      app.model({
        namespace: '_neither',
        reducers: '_',
      });
    }).toThrow(/\[app\.model\] reducers should be plain object or array/);
  });

  it('reducers in array should be [Object, Function]', () => {
    const app = create();
    expect(() => {
      app.model({
        namespace: '_none',
        reducers: [],
      });
    }).toThrow(
      /\[app\.model\] reducers with array should be \[Object, Function\]/
    );
  });

  it('subscriptions should be plain object', () => {
    const app = create();
    expect(() => {
      app.model({
        namespace: '_',
        subscriptions: [],
      });
    }).toThrow(/\[app\.model\] subscriptions should be plain object/);
    expect(() => {
      app.model({
        namespace: '_',
        subscriptions: '_',
      });
    }).toThrow(/\[app\.model\] subscriptions should be plain object/);
  });

  it('subscriptions can be undefined', () => {
    const app = create();
    expect(() => {
      app.model({
        namespace: '_',
      });
    }).toNotThrow();
  });

  it('effects should be plain object', () => {
    const app = create();
    expect(() => {
      app.model({
        namespace: '_',
        effects: [],
      });
    }).toThrow(/\[app\.model\] effects should be plain object/);
    expect(() => {
      app.model({
        namespace: '_',
        effects: '_',
      });
    }).toThrow(/\[app\.model\] effects should be plain object/);
    expect(() => {
      app.model({
        namespace: '_',
        effects: {},
      });
    }).toNotThrow();
  });
});
