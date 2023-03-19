<template>
  <div>
    <DivEditable v-model="inputContent" ref="inputBox" @inputFunc="inputFunc" @blurFunc="blurFunc" />
    <input type="text" v-model="inputContent">
    <div @click="changeValue">父组件修改子组件的值</div>
    <at-pop :listData="listData" @onSelect="onSelect" v-if="isShowAt"></at-pop>
  </div>
</template>
<script>
import DivEditable from '@/components/DivEditable'
import AtPop from '@/components/AtPop.vue'
export default {
  name: 'inputBox',
  data() {
    return {
      inputContent: '',
      model1: '',
      isShowAt: false, // 是否显示@弹窗
      listData: [
        {name: '张三', userName: 'zhangs'},
        {name: '李四', userName: 'lis'},
        {name: '王五', userName: 'wangw'},
        {name: '周六', userName: 'zhoul'},
      ],
      items: [
        {msg:1},
        {msg:2}
      ],
      atIndex: 0, // 每次@成员，atIndex递增
    }
  },
  watch: {
    inputContent(val) {
      console.log('父组件接收到的输入框的值', val);
    }
  },
  components: {
    DivEditable,
    AtPop
  },
  methods: {
    changeValue() {
      this.inputContent = this.model1;
    },
    // 选择成员时插入数据，并关闭弹窗
    onSelect(item) {
      this.atIndex++;
      // 使用a标签表示@的成员
      let at = `<a name="at" value="${item.userName}" tabindex="-1" id="${this.atIndex}" contenteditable="false" href="javascript:void(0)">@${item.name}</a>&#x200B;`;
      console.log(at)
      this.$refs.inputBox.insertContent(at, this.atIndex);
      console.log('onSelect', item);
      // this.$refs.inputBox.insertContent(`${item.name} `); // 有空格
      this.isShowAt = false;
    },
    // 输入框输入时回调函数
    inputFunc(data, event) {
      console.log('inputFunc', data, event);
      if (event.data === '@') {
        this.isShowAt = true; // 显示弹窗
        this.$nextTick(() => {
          let dom = document.getElementsByClassName('at-pop-index')[0]; // 获取成员列表弹窗，需要放在nextTick中
          // 设置位置
          dom.style.position = 'fixed';
          dom.style.left = Math.floor(data.left + 10) + 'px';
          dom.style.top = Math.floor(data.top) + 'px';
          dom.style.zIndex = 9999;
        })
      } else {
        this.isShowAt = false;
      }
    },
    blurFunc(event) {
      // 失焦时延时关闭弹窗，避免还未拿到数据
      if (this.isShowAt) {
        setTimeout(() => {
          this.isShowAt = false;
        }, 500);
      }
      console.log('blurFunc', event);
    },
  }
}
</script>
<style scoped>
</style>