import Vue from 'vue'
import Router from 'vue-router'
import Player from 'components/MusicPlayer/MusicPlayer'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'musicPlayer',
      component: Player
    }
  ]
})
