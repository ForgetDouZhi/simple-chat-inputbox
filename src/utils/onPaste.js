// 定义粘贴函数
const onPaste = (event) => {
  // 剪贴板没数据，则直接返回
  if (!event.clipboardData || !event.clipboardData.items) {
    return;
  }
  // 封装Promise
  return new Promise((resovle, reject) => {
    for(let i = 0, len = event.clipboardData.items.length; i < len; i++) {
      const item = event.clipboardData.items[i];
      if (item.kind === 'string') {
        // let str = event.clipboardData.getData('text');
        // resovle({
        //   data: str
        // });
        let reg = /<\/?.+?\/?>/g; // 匹配粘贴文本中的html标签
        item.getAsString(str => {
          resovle({
            data: str.replace(reg, '').replace(/(\r\n)|(\n)/g, '') // 去掉换行符
          })
        })
      } else if (item.kind === 'file') {
        const file = item.getAsFile();
        if (item.type.match('^image/')) {
          // 处理图片
          handleImage(file, (data) => {
            resovle(data)
          })
        } else {
          // 其他文件直接返回
          resovle({
            data: file,
            type: 'file'
          })
        }
      } else {
        reject(new Error('不支持粘贴该类型'));
      }
    }
  })
}
/**
 * 图片处理
 * @param {*} file 图片
 * @param {*} callback 回调
 * @param {*} maxWidth 
 * @returns 
 */
function handleImage(file, callback, maxWidth = 200) {
  console.log('粘贴的图片', file);
  if (!file || !/\/(?:png|jpg|jpeg|gif)/i.test(file.type)) {
    console.log('图片格式不支持');
    return;
  }
  const reader = new FileReader();
  reader.onload = function () {
    const result = this.result;
    console.log('compressedDataUrl', result);
    let img = new Image();
    img.onload = function() {
      let compressedDataUrl = compress(img, file.type, maxWidth, true);
      let url = compress(img, file.type, maxWidth, false);
      img = null;
      callback({
        data: file,
        compressedDataUrl,
        url,
        type: 'image'
      })
    }
    img.src = result;
  };
  reader.readAsDataURL(file);
}
/**
 * 图片压缩
 * @param {*} img 图片对象
 * @param {*} type 图片类型
 * @param {*} maxWidth 图片最大宽度
 * @param {*} flag 
 */
function compress(img, type, maxWidth, flag) {
  let canvas = document.createElement('canvas');
  let ctx2 = canvas.getContext('2d');

  let ratio = img.width / img.height;
  let width = img.width, height = img.height;
  // 根据flag判断是否压缩图片
  if (flag) {
    // 压缩后的图片展示在输入框
    width  = maxWidth;
    height = maxWidth / ratio; // 维持图片宽高比
  }
  canvas.width = width;
  canvas.height = height;

  ctx2.fillStyle = '#fff';
  ctx2.fillRect(0, 0, canvas.width, canvas.height);
  ctx2.drawImage(img, 0, 0, width, height);

  let base64Data = canvas.toDataURL(type, 0.75);

  if (type === 'image/gif') {
    let regx = /(?<=data:image).*?(?=;base64)/; // 正则表示时在用于replace时，根据浏览器的不同，有的需要为字符串
    base64Data = base64Data.replace(regx, '/gif');
  }
  canvas = null;
  ctx2 = null;
  return base64Data;
}
export default onPaste;