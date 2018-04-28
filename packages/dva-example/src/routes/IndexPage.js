import React from 'react';
import { connect } from 'dvajs';
import styles from './IndexPage.css';

class App extends React.Component {

  onButtonDown = () =>{
    this.props.dispatch({type: 'fetch/sendData',payload:[
      {
        target: 'example',
        url: 'movie',
      }
    ]})
  }

  
  render(){
    console.log('页面输出')
    return (
      <div className={styles.normal}>
      <li>{this.props.title}</li>
      <button onClick={this.onButtonDown}>
        按钮点击
      </button>
      </div>
    )
  }
}

// export default connect()(IndexPage);
export default connect(({example})=>({...example}))(App)