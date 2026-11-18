import { expect } from 'chai';
import { spy, useFakeTimers } from 'sinon';
import debounce from './debounce';

describe('debounce', () => {
  let clock;

  beforeEach(() => {
    clock = useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('should debounce', () => {
    const handler = spy();
    const expectedContext = { foo: 'bar' };
    let actualContext;
    function collectContext(...args) {
      // eslint-disable-next-line consistent-this
      actualContext = this;
      handler(...args);
    }
    const debounced = debounce(collectContext);
    debounced.apply(expectedContext, ['a', 'b']);
    expect(handler.callCount).to.equal(0);
    clock.tick(166);
    expect(handler.callCount).to.equal(1);
    expect(handler.args).to.deep.equal([['a', 'b']]);
    expect(actualContext).to.equal(expectedContext);
  });

  it('should clear a pending task', () => {
    const handler = spy();
    const debounced = debounce(handler);

    debounced();
    expect(handler.callCount).to.equal(0);
    debounced.clear();
    clock.tick(166);
    expect(handler.callCount).to.equal(0);
  });

  it('should flush the latest task with its arguments and context only once', () => {
    const handler = spy();
    const debounced = debounce(handler, 100);
    const context = { value: 'latest' };

    debounced('first');
    debounced.call(context, 'second', 'third');
    debounced.flush();

    expect(handler.callCount).to.equal(1);
    expect(handler.firstCall.args).to.deep.equal(['second', 'third']);
    expect(handler.firstCall.thisValue).to.equal(context);
    debounced.flush();
    clock.tick(100);
    expect(handler.callCount).to.equal(1);
  });

  it('should not flush an absent, cleared, or completed task', () => {
    const handler = spy();
    const debounced = debounce(handler);

    debounced.flush();
    debounced();
    debounced.clear();
    debounced.flush();
    expect(handler.callCount).to.equal(0);

    debounced();
    clock.tick(166);
    debounced.flush();
    expect(handler.callCount).to.equal(1);
  });

  it('should preserve a new task scheduled by a flushed callback', () => {
    let debounced;
    const handler = spy(() => {
      if (handler.callCount === 1) {
        debounced('next');
      }
    });
    debounced = debounce(handler);

    debounced('first');
    debounced.flush();
    clock.tick(166);
    expect(handler.args).to.deep.equal([['first'], ['next']]);
  });

  it('should discard a flushed task even when its callback throws', () => {
    const error = new Error('callback failed');
    const handler = spy(() => {
      throw error;
    });
    const debounced = debounce(handler);

    debounced();
    expect(() => debounced.flush()).to.throw(error);
    debounced.flush();
    clock.tick(166);
    expect(handler.callCount).to.equal(1);
  });
});
