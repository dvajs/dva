import React from 'react';
import { connect } from 'dvajs';
import styles from './IndexPage.css';

class App extends React.Component {

  onButtonDown = () =>{
    this.props.dispatch({type: 'fetch/sendData',payload:[
      {
        target: 'example',
        url: 'book',
      }
    ]})
  }

  
  render(){
    return (
      <div className={styles.normal}>
      <li>{this.props.a}</li>
      <button onClick={this.onButtonDown}>
        按钮点击
      </button>
      </div>
    )
  }
}

// export default connect()(IndexPage);
export default connect(({example})=>({...example}))(App)