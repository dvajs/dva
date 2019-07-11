import { createActionCreatorFactory } from '../';
describe('dva-action', () => {
  let factory: ReturnType<typeof createActionCreatorFactory>;
  beforeAll(() => {
    factory = createActionCreatorFactory('foo');
  });

  it('should create the normal action', () => {
  
    const normalActionCreator = factory<{ id: string }>('bar');
    const action = normalActionCreator({ id: 'barId' });
    expect(action).toEqual({ id: 'barId', type: 'foo/bar' });
    expect(normalActionCreator.type).toEqual('foo/bar');
    expect(normalActionCreator.toString()).toEqual('foo/bar');
  });

  it('should throw when not satisfying constraint', () => {
    expect(() => factory<{ id: string }>('bar')).toThrow(/Duplicate/);
    const normalActionCreator = factory<{ type: string }>('bar2');
    expect(() => {
      normalActionCreator({ type: 'bar2Type' });
    }).toThrow('`type` prop');
  });

  it('should create the poll action', () => {
    const pollActionCreator = factory.poll<{ id: string }>('bar');
    expect(pollActionCreator.start.type).toEqual('foo/bar-start');
    expect(pollActionCreator.start.toString()).toEqual('foo/bar-start');
    expect(pollActionCreator.stop.type).toEqual('foo/bar-stop');
    expect(pollActionCreator.stop.toString()).toEqual('foo/bar-stop');
    const startAction = pollActionCreator.start({ id: 'barId' });
    const stopAction = pollActionCreator.stop();
    expect(startAction).toEqual({ id: 'barId', type: 'foo/bar-start' });
    expect(stopAction).toEqual({ type: 'foo/bar-stop' });

  });
});