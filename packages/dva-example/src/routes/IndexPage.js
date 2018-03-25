import React from 'react';
import { connect } from 'dvajs';
import styles from './IndexPage.css';

// function IndexPage({ dispatch }) {
//   console.log('输出dispatch',dispatch)
//   return (
//     <div className={styles.normal}>
//       <h1 className={styles.title}>Yay! Welcome to dva!</h1>
//       <div className={styles.welcome} />
//       <ul className={styles.list}>
//         <li>To get started, edit <code>src/index.js</code> and save to reload.</li>
//         <li><a href="https://github.com/dvajs/dva-docs/blob/master/v1/en-us/getting-started.md">Getting Started</a></li>
//       </ul>
//       <button onClick={() => dispatch({ type: 'example/getapp' })}>按钮被点击</button>
//     </div>
//   );
// }

// IndexPage.propTypes = {
// };

class App extends React.Component {

  onButtonDown = () =>{
    console.log('输出点击',this.props.dispatch({type:'example/getapp',payload:{a:'asda'}}))
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