import { connect } from 'dva';
import { Button } from 'antd-mobile';

function App({ count, dispatch }) {
  return (
    <div>
      <h1>Count: {count}</h1>
      <Button
        onClick={() => {
          dispatch({
            type: 'count/add',
          });
        }}
      >
        Add
      </Button>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    count: state.count.a.b.c.count,
  };
}

export default connect(mapStateToProps)(App);
