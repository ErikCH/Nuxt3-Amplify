import { defineNuxtPlugin } from "#app";
import { Amplify, Auth } from "aws-amplify";
import aws_exports from "../src/aws-exports";
import "@aws-amplify/ui-vue/styles.css";

export default defineNuxtPlugin((nuxtApp) => {
  Amplify.configure({ ssr: true, ...aws_exports });

  return {
    provide: {
      auth: Auth
    }
  };
});
