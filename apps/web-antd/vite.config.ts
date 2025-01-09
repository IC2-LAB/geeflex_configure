export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:10009',
        changeOrigin: true,
      },
    },
  },
})
