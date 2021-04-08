// import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
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
        return Toast.show({
          type: "error",
          text1: "Authentication failed!",
          text2: "You need to sign in to perform this action",
          position: "top",
        });
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
        return Toast.show({
          type: "error",
          text1: "Authentication failed!",
          text2: "You need to sign in to perform this action",
          visibilityTime: 2000,
          position: "top",
        });
      if (error.response && error.response.status === 404)
        return Toast.show({
          type: "error",
          text1: "User not found!",
          text2: error.response.data.error,
          visibilityTime: 2000,
          position: "top",
        });
      return Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
        position: "top",
      });
    }
  };

  const handleSignup = async (userData, isMatch, navigation) => {
    try {
      const { userEmail, userPassword } = userData;
      const isValid = validateEmail(userEmail);

      if (!isValid) {
        return Toast.show({
          type: "error",
          text1: "Invalid Email",
          text2: "Please make sure your email is valid",
          autoHide: true,
          visibilityTime: 2000,
          position: "top",
        });
      }
      // return Alert.alert(
      //   "Invalid email",
      //   "Please make sure your email is valid",
      //   [{ text: "OK", onPress: () => console.log("Thank you!") }]
      // );

      if (!isMatch)
        return Toast.show({
          type: "error",
          text1: "Password mismatch!",
          text2: "Make sure both passwords match",
          visibilityTime: 2000,
          position: "top",
        });

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
        return Toast.show({
          type: "error",
          text1: "User already exists",
          text2: error.response.data.error,
          visibilityTime: 2000,
          position: "top",
        });

      return Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
        position: "top",
      });
    }
  };

  const handleSetupProfile = async (userProfile, route) => {
    try {
      const { fullNames, username } = userProfile;
      if (!fullNames || !username)
        return Toast.show({
          type: "error",
          position: "top",
          text1: "Empty fields",
          text2: "Please make sure you fill all fields",
        });

      setLoading(true);
      Keyboard.dismiss();
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
      setLoading(false);
      if (error.response && error.response.status === 404)
        return Toast.show({
          type: "error",
          position: "top",
          text1: "User not found",
          text2: `User with email ${route.params.email} does not exist`,
        });
      return Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  const handleSignin = async (userData) => {
    try {
      const { userEmail, userPassword } = userData;
      const isValid = validateEmail(userEmail);

      if (!isValid)
        return Toast.show({
          type: "error",
          position: "top",
          text1: "Invalid email",
          text2: "Please make sure your email is valid",
        });

      if (!userPassword)
        return Toast.show({
          type: "error",
          position: "top",
          text1: "Missing password",
          text2: "Please make sure you input your password",
        });
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
        return Toast.show({
          type: "error",
          position: "top",
          text1: "User not found",
          text2: `User with email ${route.params.email} does not exist`,
        });
      if (error.response && error.response.status === 401) {
        return Toast.show({
          type: "error",
          position: "top",
          text1: "Incorrect credentials",
          text2: error.response.data.error,
        });
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
          <Toast ref={(ref) => Toast.setRef(ref)} />
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
