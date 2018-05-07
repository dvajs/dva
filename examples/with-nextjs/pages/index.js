
import Link from 'next/link';
import React from 'react';
import WithDva from '../utils/store';

// mock get data
const getDelta = new Promise((resolve) => {
  setTimeout(resolve, 100, 1);
});

class Page extends React.Component {
  static async getInitialProps(props) {
    // first time run in server side
    // other times run in client side ( client side init with default props,
    // so it will cause data status conflict in sever and client)
    console.log('get init props');
    const {
      pathname, query, isServer, store,
    } = props;
    // get data by api
    const delta = await getDelta;
    // sava data in redux
    await props.store.dispatch({ type: 'index/initData', delta });
    return {
      // dont use store as property name, it will confilct with initial store

      // transport delta (async data) to component,
      // so it redux can save it when it's initialized in client side
      pathname, query, isServer, dvaStore: store, delta,
    };
  }
  componentDidMount() {
    // get delta (async data), save it to redux, to sync data between client side adn server side
    const { delta } = this.props;
    this.props.dispatch({
      type: 'index/initData',
      delta,
    });
  }

  render() {
    const { index } = this.props;
    const { name, count } = index;
    console.log('rendered!!');
    return (
      <div>
      Hi,{name}!! &nbsp;
        <p>count:&nbsp; {count}</p>
        <p>
          <button onClick={() => { this.props.dispatch({ type: 'index/caculate', delta: 1 }); }} >
        plus
          </button>
        </p>
        <p>
          <button onClick={() => { this.props.dispatch({ type: 'index/caculate', delta: -1 }); }} >
          minus
          </button>
        </p>
        <p>
          <Link href="/users">
            <a>Go to /users</a>
          </Link>
        </p>
      </div>
    );
  }
}

export default WithDva((state) => { return { index: state.index }; })(Page);
