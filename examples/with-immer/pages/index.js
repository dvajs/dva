import { connect } from 'dva';
import { Button } from 'antd-mobile';

function App({ count, newProp, dispatch }) {
  return (
    <div>
      <h1>Count: {count}</h1>
      <h1>state.newProp: {newProp || 'not setted'}</h1>
      <Button
        onClick={() => {
          dispatch({
            type: 'count/add',
          });
        }}
      >
        Add
      </Button>
      <Button
        onClick={() => {
          dispatch({
            type: 'count/setNewProp',
          });
        }}
      >
        Set New Prop
      </Button>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    count: state.count.a.b.c.count,
    newProp: state.count.newProp,
  };
}

export default connect(mapStateToProps)(App);
