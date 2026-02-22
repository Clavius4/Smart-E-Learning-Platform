import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: false,
    loadingMessage: 'Loading...'
  }),
  actions: {
    startLoading(message = 'Loading...') {
      this.isLoading = true
      this.loadingMessage = message
    },
    stopLoading() {
      this.isLoading = false
    }
  }
})