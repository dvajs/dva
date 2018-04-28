
// 延迟处理
export const delay = time =>
  new Promise (resolve => setTimeout (resolve, time))
  

// url转换
const tranUrlFun = function(urlAddress = '',params){
    let url = urlAddress
    Object.keys(params).forEach((e)=>{
        let text = url.replace(`{${e}}`,(data)=>{
            let text = params[e]
            delete params[e]
            return text
        })
        url = text == urlAddress ? url : text
    })
    return url
}

export const generalState = function generalState (state, {payload}) {
    return ({...state, ...payload})
}

export default function getFetchData(fetchConfig){
    const {
        netTool,netApi,
        onGLNetStart,onGLNetFinall,
        onGLNetError,onGLNetCatch,onGLTimeOut,
        extendAttr,GLParams,
        GLTimeOut
    } = fetchConfig
    return {
            namespace:'fetch',
            state:{
                isShow:true,//true显示loading
                isNetError:false, // 是否网络出错
                isNetData:{} // 出错的单条网络数据
            },
            reducers: {
                generalState (state, {payload}) {
                    return ({...state, ...payload})
                },
            },
            effects:{
                *sendData({payload},{call,select,race,take}){
                    try {
                        // 这里保存最后需要合并的数据
                        let ret = {}
                        const keys = payload
                        for (let i = 0; i < keys.length; i ++) {
                            const obj = keys[i]
                            const keyName = obj.target
                            const url = obj.url
                            const params = GLParams?{...obj.params,...GLParams}:obj.params
                            const timeOut = obj.timeOut || (GLTimeOut || 100000)
                            const tranData = obj.transData
                            const tranUrl = obj.transUrl
                            const method = obj.method || 'get'
                            const isOnlyNet = obj.isOnlyNet || false
                            const onError = obj.onError 
                            const onCallBack = obj.onCallBack
                            if (url){
                                let urlAddress = netApi?netApi[url]:url
                                urlAddress = tranUrl?tranUrlFun(url,params):urlAddress
                                // const retData = yield call(netTool[method],urlAddress,params)
                                const {retData,timeout,cancel} = yield race({
                                    retData:call(netTool[method],urlAddress,params),
                                    timeout:call(delay,timeOut || 10000),
                                    cancel:take('CANCEL_FETCH')
                                })
                                if (cancel){
                                    break;
                                }
                                if (!timeout){
                                    const netData = onGLNetStart && onGLNetStart({retData,...extendAttr})
                                    if (netData){
                                        if (!isOnlyNet){
                                            const oldState = yield select((state)=>({...state[keyName]}))
                                            ret[keyName] = {...oldState,...ret[keyName],...(tranData?tranData(netData):netData)}  
                                            onCallBack && onCallBack({...obj,...extendAttr,params,timeOut,urlAddress}) 
                                            yield put({type:`${retKeyName}/generalState`,payload:{isShow:true}})
                                        }
                                    }else {
                                        yield put({type:'generalState',payload:{isShow:true,isNetError:true,isNetErrorData:obj}})
                                        onGLNetError && onGLNetError({...obj,...extendAttr,params,timeOut,urlAddress})
                                        onError && onError({...obj,...extendAttr,params,timeOut,urlAddress})
                                    }
                                    onGLNetFinall && onGLNetFinall({...obj,...extendAttr,params,timeOut,urlAddress})
                                }else {
                                    onGLTimeOut && onGLTimeOut({...obj,...extendAttr,params,timeOut,urlAddress})
                                }
                            }
                        }
                        const retKeys = Object.keys(ret)
                        if (retKeys.length > 0){
                            yield put({type:'generalState',payload:{isShow:true,netError:false}})
                            for(let i = 0; i < retKeys.length;i++){
                                const retKeyName = retKeys[i]
                                const retObj = ret[retKeyName]
                                yield put({type:`${retKeyName}/generalState`,payload:{...retObj,isShow:false}})
                            }
                            yield put({type:'generalState',payload:{isShow:false}})
                        }
                    } catch (error) {
                        onGLNetCatch && onGLNetCatch({error,...extendAttr})
                    }
                }
            }
        }
}