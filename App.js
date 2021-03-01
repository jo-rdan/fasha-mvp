// import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Platform, StatusBar } from "react-native";
import { mapping, light as theme } from "@eva-design/eva";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApplicationProvider, Layout } from "@ui-kitten/components";
import { HASURA_SECRET, API_URL } from "dotenv";
import Signup from "./src/screens/Signup.js";

export function App() {
  return (
    <View style={styles.container}>
      <Signup />
    </View>
  );
}

export default () => {
  const client = new ApolloClient({
    uri: `${API_URL}`,
    headers: {
      "x-hasura-admin-secret": `${HASURA_SECRET}`,
    },
    cache: new InMemoryCache(),
  });

  if (!client) return <Text>Loading...</Text>;

  return (
    <ApolloProvider client={client}>
      <ApplicationProvider mapping={mapping} theme={theme}>
        <App />
      </ApplicationProvider>
    </ApolloProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
