import React from 'react';
import { connect } from 'dvajs';
import styles from './IndexPage.css';

class App extends React.Component {

  onButtonDown = () =>{
    this.props.dispatch({type: 'fetch/sendData',payload:[
      {
        // 要修改的model名字 需要跟model中的namespace字段名字保持一致
        target: 'example',
        // 要请求的url地址名字 这里有两种写法
        // 如果在dva初始化时的fetchConfig中传入了netApi的话 则这里的名字需要跟netApi暴露出来的函数名字保持一致
        // 否则这里就等于直接传递url
        url: 'movie',

        // 需要传递过去的参数
        // params:{}, object
        
        // 单条网络请求的延迟时间
        // timeOut: number
        // 优先级 timeout > fetchConfig > 默认10秒

        // tranData:function
        // ts:转换网络请求以后数据的接口
        // 可以通过这种方式对网络请求返回的数据进行格式转换
        // tranData:(data)=>({list:data.list})

        // tranUrl : false | true
        // 如果你的url是这样的{specId}/id 只要tranUrl为true
        // 就会自动帮你从params中找到对应的specId进行转换

        // method 这个参数会跟fetchConfig中的netTool进行绑定
        // 如method:'get' 实际上就是读取netTool中的get函数来进行网络请求
        // 这里的名字可以你自己自定义 只要你netTool中有暴露出来就可以

        // isOnlyNet : bool 
        // 是否只是进行网络请求而不刷新页面 默认为false
        // 如果你只是想进行网络请求的话 设为true就可以

        // onError : function
        // 如果你相对单条接口进行错误管理的话 可以在这里进行
        // 这里并不会阻塞全局的错误管理 全局依旧可以收到
        // 错误管理的条件是fetchConfig.onNetStart不符合自定义要求的才会进入这里

        // onCallBack ：function
        // tranData是用来做数据转换的 如果你想在数据正常获取的情况下 执行一些操作 
        // 比如this.setState的话 可以在这里进行 如果网络出现错误 是不会走到这里的

        // 小计
        // 因为这个payload是一个数组结构 所以你的多次网络请求会进行合并 只会在最后刷新一次
        // 并不会因为你有多个网络请求就会导致刷新多次
        // 其次 如果你想在发起一个网络请求以后取消这个请求的话 你只需要在重新发送一个
        // this.props.dispatch({type:'CANCEL_FETCH'}) 就可以取消那个队列的所有网络请求

        // 你也可以在fetchConfig.onNetStart中对当前的状态做出判断 只需要返回false 
        // 比如当前的token等不符合条件的时候 放弃所有请求 直到token符合要求
        // 就会走到对应的onError 而不会进行数据合并 也不会导致页面重新刷新
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