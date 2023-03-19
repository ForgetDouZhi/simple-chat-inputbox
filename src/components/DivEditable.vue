<template>
  <div 
    ref="editor" 
    class="input-box" 
    contenteditable="true" 
    @input="inputText" 
    @blur="inputBlur" 
    @keyup.enter.exact="submit"
    @keydown.enter.exact="handleKeydown"
    @paste.prevent="onPaste"
    @focus="inputFocus">
  </div>
</template>
<script>
/* eslint-disable no-debugger */
import onPaste from '@/utils/onPaste.js';
export default {
  name: 'inputBox',
  props: ['value'],
  data() {
    return {
      isBlur: true, // 解决赋值时光标自动定位到起始位置
      selection: null, // 记录光标位置
    }
  },
  watch: {
    value(val) {
      if (this.isBlur) {
        this.$refs.editor.innerHTML = val;
      }
    }
  },
  methods: {
    // 监听输入框内容
    inputText(event) {
      console.log('子组件输入框的输入内容', this.$refs.editor.innerHTML);
      this.$emit('input', this.$refs.editor.innerHTML);
      let range = window.getSelection().getRangeAt(0); // 获取当前光标
      let position = range.getBoundingClientRect(); // 获取当前光标的位置
      this.$emit('inputFunc', position, event);
    },
    // 聚焦
    inputFocus() {
      this.isBlur = false;
    },
    // 失焦
    inputBlur(event) {
      this.isBlur = true;
      this.selection = this.saveSelection();
      this.$emit('blurFunc', event);
    },
    // 按键处理
    // 实现enter发送，alt+enter换行
    inputKeydown(event) {
      console.log('inputKeydown', event);
    },
    submit() {
      console.log('submit');
    },
    handleKeydown(event) {
      event.preventDefault();
      return false;
    },
    async onPaste(event) {
      const result = await onPaste(event);
      console.log('处理后的粘贴数据', result);
      const imgRegx = /^data:image\/png|jpg|jpeg|gif|svg|bmp|tif/; // 支持的图片格式
      if (imgRegx.test(result.compressedDataUrl)) {
        // document.execCommand('insertImage', false, result.compressedDataUrl);
        const sel = window.getSelection(); // 获取当前光标位置
        if (sel && sel.rangeCount === 1 && sel.isCollapsed) {
          const range = sel.getRangeAt(0);
          const img = new Image();
          img.src = result.compressedDataUrl;
          range.insertNode(img);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        // 插入文本
        document.execCommand('insertText', false, result.data);
      }
    },
    insertContent(value, id = '') {
      this.$refs.editor.focus();
      let range, node;
      this.restoreSelection(this.selection); // 还原失焦前的光标位置
      range = window.getSelection().getRangeAt(0);
      range.collapse(false); // 光标移动到最后

      node = range.createContextualFragment(value);
      let child = node.lastChild;
      range.insertNode(node);

      console.log('child', node, child);

      // 将光标的起始位置设置在当前插入的元素后面
      if (child) {
        range.setEndAfter(child);
        range.setStartAfter(child);
      }

      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      console.log('this.$refs.editor.innerHTM', this.$refs.editor.innerHTML, id);
      this.$nextTick(() => {
        if (/@<a name="at"/.test(this.$refs.editor.innerHTML)) {
          // 使用正则替换，将已经输入的@替换掉
          // 如果直接赋值修改innerHTML，则光标默认会回到开头。因此需要额外处理光标
          this.$refs.editor.innerHTML = this.$refs.editor.innerHTML.replace(/@<a name="at"/, '<a name="at"');

          let el = document.getElementById(id);
          range = document.createRange();
          sel = window.getSelection();
          // 将光标重新定位到自定义的a标签后面
          range.setStartAfter(el);
          range.setEndAfter(el);

          sel.removeAllRanges();
          sel.addRange(range);
        }
      })
      this.$emit('input', this.$refs.editor.innerHTML);
    },
    // 失焦时保存光标
    saveSelection() {
      if (!window.getSelection) {
        return null;
      }
      let sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        return sel.getRangeAt(0);
      }
    },
    // 恢复光标
    restoreSelection(range) {
      if (range) {
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}
</script>
<style scoped>
.input-box {
  width: 400px;
  height: 250px;
  border: 1px solid #6e6e6e;
  outline: none; /* 隐藏聚焦时外边框 */
  /* padding: 10px; */
  white-space: pre-wrap;
  overflow: hidden;
  overflow-y: auto;
  word-break: break-all;
}
</style>
<style>
a {
  color: #6878f3;
  text-decoration: none;
  background: transparent;
  outline: none;
  cursor: pointer;
  transition: color 0.2s ease;
}
</style>