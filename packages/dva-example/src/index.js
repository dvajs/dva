import dva from 'dvajs';
import './index.css';
import * as request from './utils/request'
import * as netaApi from './utils/netaApi';
// 1. Initialize
const app = dva({
    fetchConfig:{
            // 这里填写你封装好的request文件 
            // 如get post delete等得 之后的method将会直接读取你这里暴露的名字
            netTool:request,
            // url传递有两种模式
            // 1.如果netApi为空的话 url:'/book'
            // 2.如果netApi不为空的话 需要传netApi暴露出来的函数名字 url:'book'
            netApi:netaApi,
            // 全局的网络开始处理
            // 每个人对于网络请求的处理规格都是不同的 
            // 在这里 你就可以直接编写你对应的处理逻辑 对于符合要求的直接返回true 不符合直接返回fasle
            //然后就会走到onNetError中去处理这个网络请求
            onGLNetStart:(data)=>{
                debugger
                // 不要在这里做除了逻辑判断以外的多余操作
                console.log('sadad',data)
                return true
            },
            // 全局错误处理
            // 如果上面的条件不符合的话 你可以在这里 直接中断下面的数据请求
            // 然后会进入到数据合并阶段
            onGLNetError:({retData})=>{
                // 如果数据走到这里的话 会继续数据合并 但是因为那条数据出现了错误 所以
                // 出错的那条网络请求是不会合并到model中 也就不会刷新数据
                // 避免因为接口出错 导致页面重新刷新 奔溃的问题
                // 你也可以在每个接口的fetch/sendData中截获单条请求的onError
                // 出错的onError在fetch这个model中将会被记录下来 你可以直接通过fetch.isNetError(接口名字来重放)
            },
            // 上面的网络错误仅仅只是不符合netStart的条件的一种错误 还有一种是直接catch抛出的 这种就比较严重了
            onGLNetCatch:()=>{
                
            },
            // 统一单条网络结束事件
            // 即使之前的网络请求已经进入到了onNetError中 依旧会继续执行
            // 除非你这个网络请求已经直接需要抛出异常了
            onGLNetFinall:()=>{

            },
            // 扩展属性
            // 如果你想让某个数据统一传递到所有的事件的话 你可以放到这里 
            // 在这里将会帮你在所有的fetch函数中 都统一放入 通过这样的方式避免 每次使用一个功能 都需要先引入一遍的尴尬
            extendAttr:()=>({a:'1'}),
            // 全局的params
            // 在这里你可以全局传递对应的model数据 让你的fetch请求更加的干净
            // 比如你不在需要每次get 或者 post的时候 传递一个token等数据过去了
            GLParams:()=>({}),
            // 全局网络请求延迟处理 默认10秒
            GLTimeOut:10000,
            // 全局超时请求
            // onGLTimeOut
    }
});

// 2. Plugins
// app.use({});

// 3. Model
app.model(require('./models/example'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
