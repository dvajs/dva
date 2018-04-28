
function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

// 如果你在fetchOption.config 中定义了netTool的话 所有接口的定义了method都会直接指向对应暴露出来的函数
// 如export const get 那么你在method:'get' 默认就是走netTool中的这个函数 post也是一样
export const get = function (url, options) {
  console.log('asdad',url,options)
  return new Promise((resolve, reject) => {
    fetch (url,options)
    .then((e)=>e.json())
    .then((e)=>{
      resolve(e)
    })
    .catch((e)=>{
      reject(e)
    })
  });
}