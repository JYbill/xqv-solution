<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  setTimeout(() => {
    if (document.startViewTransition) {
      // 1. API截取当前页面的屏幕截图
      /*
         该API构建的内容
         ::view-transition
          └─ ::view-transition-group(root)
             └─ ::view-transition-image-pair(root)
                ├─ ::view-transition-old(root)
                └─ ::view-transition-new(root)
         */
      // 2. 调用回调钩子
      const transition = document.startViewTransition(() => {
        console.log("记录快照");
        const root = document.documentElement;
        root.style.setProperty("--bg", "#000000");
        root.style.setProperty("--txt", "#ffffff");
      });

      // 3. startViewTransition钩子执行完毕后，Promise执行
      transition.updateCallbackDone.then((res) => {
        console.log(res);
      });
    }
  }, 1000);
});
</script>

<template>
  <div class="view-transition">测试</div>
</template>

<style lang="scss">
:root {
  --bg: #ffffff;
  --txt: #000000;
}
body {
  background-color: var(--bg);
  color: var(--txt);
}

.view-transition {
  width: 100%;
  height: 500px;
}
html::view-transition {
}

// group编写old、new之间的公共样式(一般定义动画相关，子伪类继承这些属性即可)
html::view-transition-group(*) {
  animation-duration: 5s;
  animation-timing-function: ease;
}

// old、new内容变换的容器
html::view-transition-image-pair(*) {
  border: 5px solid red;
}

@keyframes old-animate {
  from {
    opacity: 1;
    border-color: rgba(104, 60, 241, 1);
  }
  to {
    opacity: 0;
    border-color: rgba(248, 45, 45, 0.5);
  }
}
html::view-transition-old(*) {
  width: 500px;
  animation-name: old-animate;
  border: 5px solid;
  right: 0;
}

@keyframes new-animate {
  from {
    opacity: 0;
    border-color: rgba(248, 45, 45, 0.5);
  }
  to {
    opacity: 1;
    border-color: rgba(104, 60, 241, 1);
  }
}
::view-transition-new(*) {
  width: 500px;
  animation-name: new-animate;
  border: 5px solid;
  left: 0;
}
</style>
