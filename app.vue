<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import { withSSRContext, graphqlOperation } from "aws-amplify";
import { listTodos } from "./src/graphql/queries";

const { data } = await useAsyncData("todos", async (ctx) => {
  const {
    node: { req }
  } = useRequestEvent();
  const SSR = withSSRContext({ req });
  const { data } = await SSR.API.graphql(graphqlOperation(listTodos));

  return data;
});
</script>
<template>
  <Authenticator>
    <template v-slot="{ user, signOut }">
      {{ data.listTodos?.items }}
      <h1>Hello {{ user.username }}!</h1>
      <button @click="signOut">Sign Out</button>
    </template>
  </Authenticator>
  <div></div>
</template>
