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
  Keyboard,
  Alert,
} from "react-native";
import { mapping, light as theme } from "@eva-design/eva";
import {
  ApplicationProvider,
  IconRegistry,
  Button,
  Icon,
  Spinner,
  Toggle,
} from "@ui-kitten/components";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import Signup from "./src/screens/Signup.js";
import Signin from "./src/screens/Signin.js";
import Profile from "./src/screens/Profile";
import { createStackNavigator } from "@react-navigation/stack";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import SetupProfile from "./src/screens/SetupProfile.js";
import axios from "axios";
import { API_URL } from "dotenv";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { validateEmail } from "./src/helpers/emailValidation";
import { isLoading } from "expo-font";
import EditProfile from "./src/screens/EditProfile.js";
import AddPost from "./src/screens/AddPost.js";
import Comments from "./src/screens/Post.js";
import Post from "./src/screens/Post.js";
import EditComment from "./src/screens/shared/EditComment.js";
import EditPost from "./src/screens/EditPost.js";
const Stack = createStackNavigator();

export function App({ loading }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require("./src/assets/app/logo.png")} />
      {/* <Text onPress={() => navigation.navigate("Signup")}>Sign up</Text> */}
      {console.log(loading)}
      {loading ? (
        <View>
          <Spinner size='medium' />
        </View>
      ) : (
        <View>
          <Button
            appearance='ghost'
            onPress={() => {
              navigation.navigate("Signin");
            }}
          >
            Continue
          </Button>
        </View>
      )}
    </View>
  );
}

export default () => {
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  let token;
  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      token = await AsyncStorage.getItem("token");
      // setIsLoading(true);
      if (!token) {
        setIsLoading(false);
        return <App loading={isLoading} />;
      }
      setIsLoading(false);
      console.log("isLoading", loading);
      return setIsAuth(true);
    };
    fetchToken();
  }, [isAuth]);

  const handleLogout = async (setVisible) => {
    setVisible(false);
    setLoading(true);
    await AsyncStorage.removeItem("token");
    setLoading(false);
    setIsAuth(false);
    return;
  };

  const handleDeleteUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return Alert.alert(
          "Sign in",
          "You need to sign in to perform this action"
          // [{ text: `Sign in`, onPress: () => navigation.navigate("Signin") }]
        );
      }
      setLoading(true);
      const response = await axios.delete(`${API_URL}/users/user/delete`, {
        headers: { token },
      });
      if (response.status === 200) {
        setLoading(false);
        console.log("ride", response.data);
        await AsyncStorage.removeItem("token");
        return setIsAuth(false);
        // return navigation.navigate("Signup");
      }
    } catch (error) {
      if (error.response && error.response.status === 401)
        return Alert.alert(
          "Authentication failed!",
          "You need to sign in to perform this action",
          [{ text: `Sign in`, onPress: () => setIsAuth(false) }]
        );
      if (error.response && error.response.status === 404)
        return Alert.alert("User not found!", error.response.data.error, [
          { text: `Ok`, onPress: () => setIsAuth(false) },
        ]);
    }
  };

  const handleSignup = async (userData, isMatch, navigation) => {
    try {
      const { userEmail, userPassword } = userData;
      const isValid = validateEmail(userEmail);

      if (!isValid)
        return Alert.alert(
          "Invalid email",
          "Please make sure your email is valid",
          [{ text: "OK", onPress: () => console.log("Thank you!") }]
        );

      if (!isMatch)
        return Alert.alert(
          "Password mismatch!",
          "Make sure both passwords match",
          [{ text: "OK", onPress: () => console.log("Thank you!") }]
        );
      setLoading(true);
      Keyboard.dismiss();
      const response = await axios.post(`${API_URL}/users/signup`, {
        email: userEmail,
        password: userPassword,
      });

      if (response.status === 201) {
        setLoading(false);
        return navigation.navigate("SetupProfile", {
          email: userEmail,
          token: response.data.data,
        });
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 409)
        return Alert.alert("User already exists", error.response.data.error, [
          {
            text: "Yes, sign me in",
            onPress: () => console.log("thanks"),
          },
        ]);
      return error;
    }
  };

  const handleSetupProfile = async (userProfile, route) => {
    try {
      const { fullNames, username } = userProfile;
      if (!fullNames || !username)
        return Alert.alert(
          "Empty fields",
          "Please make sure you fill all fields",
          [{ text: "OK", onPress: () => console.log("Thank you!") }]
        );

      setLoading(true);
      Keyboard.dismiss();
      console.log("ressssssssssss", route.params);
      const response = await axios.patch(
        `${API_URL}/users/edit-profile?email=${route.params.email}`,
        {
          fullnames: fullNames,
          username,
        },
        { headers: { token: route.params.token } }
      );
      if (response.status === 200) {
        setLoading(false);
        await AsyncStorage.setItem("token", route.params.token);
        setIsAuth(true);
        return;
      }
    } catch (error) {
      console.log("errrrrrrrrrrr", error);

      setLoading(false);
      if (error.response && error.response.status === 404)
        return Alert.alert(
          "User not found",
          `User with email ${route.params.email} does not exist`,
          [
            {
              text: "Sign up",
              onPress: () => navigation.navigate("Signup"),
            },
          ]
        );
      return error;
    }
  };

  const handleSignin = async (userData) => {
    try {
      const { userEmail, userPassword } = userData;
      const isValid = validateEmail(userEmail);

      if (!isValid)
        return Alert.alert(
          "Invalid email",
          "Please make sure your email is valid",
          [{ text: "OK", onPress: () => console.log("Thank you!") }]
        );

      if (!userPassword)
        return Alert.alert(
          "Missing password",
          "Please make sure you input your password",
          [{ text: "OK", onPress: () => console.log("Thank you!") }]
        );
      setLoading(true);
      Keyboard.dismiss();
      const response = await axios.post(`${API_URL}/users/signin`, {
        email: userEmail,
        password: userPassword,
      });
      if (response.status === 200) {
        await AsyncStorage.setItem("token", response.data.data);
        setIsAuth(true);
        return setLoading(false);
        // return navigation.navigate("Profile");
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 404)
        return Alert.alert("User not found", error.response.data.error, [
          {
            text: "sign me up",
            onPress: () => console.log("thanks"),
          },
        ]);
      if (error.response && error.response.status === 401) {
        // setUserData({ ...userData, userPassword: "" });
        return Alert.alert("Incorrect credentials", error.response.data.error, [
          {
            text: "Try again",
            onPress: () => console.log("here"),
          },
        ]);
      }
    }
  };
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={theme}>
        <NavigationContainer>
          <Stack.Navigator>
            {isAuth ? (
              <>
                <Stack.Screen name='Profile' options={{ headerShown: false }}>
                  {(props) => (
                    <Profile
                      {...props}
                      onLogout={handleLogout}
                      onDelete={handleDeleteUser}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name='Edit Profile'
                  component={EditProfile}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='Add Post'
                  component={AddPost}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='Post'
                  component={Post}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='Edit Comment'
                  component={EditComment}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='Edit Post'
                  component={EditPost}
                  options={{ headerShown: false }}
                />
              </>
            ) : (
              <>
                <Stack.Screen name='App' options={{ headerShown: false }}>
                  {(props) => <App {...props} loading={isLoading} />}
                </Stack.Screen>
                <Stack.Screen name='Signin' options={{ headerShown: false }}>
                  {(props) => (
                    <Signin
                      {...props}
                      onSignin={handleSignin}
                      loading={loading}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name='Signup' options={{ headerShown: false }}>
                  {(props) => (
                    <Signup
                      {...props}
                      onSignup={handleSignup}
                      loading={loading}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name='SetupProfile'
                  options={{ headerShown: false }}
                >
                  {(props) => (
                    <SetupProfile
                      {...props}
                      onSetup={handleSetupProfile}
                      loading={loading}
                    />
                  )}
                </Stack.Screen>
              </>
            )}
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
