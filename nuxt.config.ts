// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  alias: {
    "./runtimeConfig": "./runtimeConfig.browser"
  },
  nitro: {
    preset: "aws-lambda"
  },
  app: {
    cdnURL: process.env.CF_CDN || "https://example.com"
  },
  vite: {
    define: {
      "window.global": {}
    }
  }
});
