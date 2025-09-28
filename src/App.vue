<template>
  <div id="app">
    <h3>Axborot kodlash nazariyasi</h3>
    <MenuBar />
    <router-view />
  </div>
</template>

<script>
import MenuBar from './components/menuBar.vue';

export default {
  components: { MenuBar }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #F3E8FF;
  font-family: 'Advent Pro', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

router-view {
  flex: 1;
}

h3 {
  text-align: center;
  margin-top: 20px;
  font-size: 20px;
  margin-bottom: 20px;
}

p {
  text-align: center;
  margin: 10px 0;
}
</style>
