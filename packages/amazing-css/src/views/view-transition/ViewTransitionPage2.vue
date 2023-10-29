<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

// 当前主题
const isDark = ref(false);

// Switch组件的x、y坐标（避免重复计算）
const themeSwitchPos = { x: 0, y: 0 };
onMounted(() => {
  const themeSwitchEl = document.querySelector(".themeSwitch") as HTMLElement;
  const themeSwitchClient = themeSwitchEl.getBoundingClientRect();
  const x = themeSwitchClient.left + themeSwitchClient.width / 2;
  const y = themeSwitchClient.top + themeSwitchClient.height / 2;
  themeSwitchPos.x = x;
  themeSwitchPos.y = y;
});

// 监听主题色被Switch切换
watch(isDark, () => {
  if (!document.startViewTransition) {
    return;
  }

  const root = document.documentElement;

  const transition = document.startViewTransition(() => {
    if (isDark.value) {
      root.style.setProperty("--bg", "#000000");
      root.style.setProperty("--txt", "#ffffff");
    } else {
      root.style.setProperty("--bg", "#ffffff");
      root.style.setProperty("--txt", "#000000");
    }
  });
  transition.ready.then(() => {
    // 创建动画帧

    // 裁剪元素根据半径裁剪
    // 切换为黑色主题：circle(100%) -> circle(Switch组件中心位置)
    // 切换为白色主题：circle(Switch组件中心位置) -> circle(100%) 顺序要反转
    const clipPathList = [
      "circle(100%)",
      `circle(10px at ${themeSwitchPos.x}px ${themeSwitchPos.y}px)`,
    ];
    document.documentElement.animate(
      {
        clipPath: isDark.value ? clipPathList : clipPathList.reverse(),
      },
      {
        duration: 400,
        easing: "ease-out",
        pseudoElement: isDark.value
          ? "::view-transition-old(isDark)"
          : "::view-transition-new(isDark)",
      }
    );
  });
  transition.finished.then(() => {
    if (isDark.value) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  });
});
</script>

<template>
  <div class="view-transition2">
    <div>切换主题演示过渡</div>
    <el-switch class="themeSwitch" v-model="isDark" />
  </div>
</template>

<style lang="scss">
:root {
  --bg: #ffffff;
  --txt: #000000;
}

.view-transition2 {
  width: 100%;
  height: 500px;
  background-color: var(--bg);
  color: var(--txt);

  // 如果没有这个属性，改变默认受"root"影响
  view-transition-name: isDark; // .view-transition2 内部发生变化时，将生成名为"isDark" + "root"(默认)的伪类
}

html::view-transition-old(isDark),
html::view-transition-new(isDark) {
  animation: none;
}

// 截图旧视图做动画缩小
html::view-transition-old(isDark) {
  z-index: 2147483647; // 置于最上
}

// 截图新视图置于最后，且不做任何动画
html::view-transition-new(isDark) {
  z-index: 8;
}

// .dark类表示此时为黑色主题，所以截图z-index应该与白色主题相反
html.dark::view-transition-old(isDark) {
  z-index: 8;
}
html.dark::view-transition-new(isDark) {
  z-index: 2147483647;
}
</style>
