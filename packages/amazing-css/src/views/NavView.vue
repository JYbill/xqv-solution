<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="nav">
    <div>view-transition相关：</div>
    <RouterLink to="/view-transition1">
      <el-link type="success">::view-transition1(演示过渡)</el-link>
    </RouterLink>
    <RouterLink to="/view-transition2">
      <el-link type="success">::view-transition2(切换主题实战)</el-link>
    </RouterLink>
  </div>
</template>
