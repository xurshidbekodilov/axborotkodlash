<template>
  <div class="menu-bar">
    <router-link to="/" class="menu-link">Shennon-Fano</router-link>
    <router-link to="/xaffman" class="menu-link">Xaffman</router-link>
  </div>
</template>

<script>
export default {
  name: "MenuBar"
}
</script>

<style scoped>
.menu-bar {
  text-align: center;
  margin: 20px 0;
}

.menu-link {
  margin: 0 15px;
  text-decoration: none;
  color: #4a148c;
  font-size: 20px;
  font-weight: 500;
  position: relative;
  display: inline-block;
  padding-bottom: 6px;
  transition: all 0.3s ease;
}

.menu-link.router-link-exact-active {
  color: #7b1fa2;
  transform: scale(1.1);
}

/* Pastdan chiziq animatsiyasi */
.menu-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #7b1fa2;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.menu-link.router-link-exact-active::after {
  width: 100%;
}
</style>