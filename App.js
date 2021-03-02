// import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { mapping, light as theme } from "@eva-design/eva";
import {
  ApplicationProvider,
  IconRegistry,
  Button,
  Icon,
} from "@ui-kitten/components";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import Signup from "./src/screens/Signup.js";
import Signin from "./src/screens/Signin.js";
import Profile from "./src/screens/Profile";
import { createStackNavigator } from "@react-navigation/stack";
import { EvaIconsPack } from "@ui-kitten/eva-icons";

const Stack = createStackNavigator();

export function App() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Image source={require("./src/assets/app/logo.png")} />
      {/* <Text onPress={() => navigation.navigate("Signup")}>Sign up</Text> */}
      <Button appearance='ghost' onPress={() => navigation.navigate("Signup")}>
        Sign up
      </Button>
    </View>
  );
}

export default () => {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={theme}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name='App'
              component={App}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='Signup'
              component={Signup}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='Signin'
              component={Signin}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='Profile'
              component={Profile}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
