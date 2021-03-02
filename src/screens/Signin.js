import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Keyboard,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import axios from "axios";
import { Button, Text as Texts, Spinner } from "@ui-kitten/components";
import { validateEmail } from "../helpers/emailValidation";
import { API_URL } from "dotenv";
import { useNavigation } from "@react-navigation/native";

function Signin(props) {
  const [userData, setUserData] = useState({
    userEmail: "",
    userPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
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
      if (response.status === 200) return navigation.navigate("App");
    } catch (error) {
      setLoading(false);
      if (error.response.status === 404)
        return Alert.alert("User not found", error.response.data.error, [
          {
            text: "sign me up",
            onPress: () => navigation.navigate("Signup"),
          },
        ]);
      if (error.response.status === 401)
        return Alert.alert("Incorrect credentials", error.response.data.error, [
          {
            text: "Try again",
            onPress: () => setUserData({ ...userData, userPassword: "" }),
          },
        ]);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image
          resizeMode='cover'
          source={require("../assets/app/logo.png")}
          style={styles.logo}
        />
      </View>
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text>Log into your account to continue</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.innerForm}>
          <TextInput
            underlineColorAndroid='rgba(0,0,0,0)'
            placeholder='Email or Phone'
            style={styles.input}
            autoCompleteType='email'
            autoCapitalize='none'
            value={userData.userEmail}
            onChangeText={(userEmail) =>
              setUserData({ ...userData, userEmail })
            }
          />
          <TextInput
            underlineColorAndroid='rgba(0,0,0,0)'
            placeholder='Password'
            style={styles.input}
            secureTextEntry={true}
            autoCapitalize='none'
            value={userData.userPassword}
            onChangeText={(userPassword) =>
              setUserData({ ...userData, userPassword })
            }
          />
        </View>
      </View>
      <View style={styles.btnParent}>
        <Button style={styles.btn} onPress={handleSubmit}>
          {!loading ? "Log in" : <Spinner status='basic' size='small' />}
        </Button>
        <Text>
          Don't have an account?{" "}
          <Texts
            status='primary'
            style={styles.span}
            onPress={() => navigation.navigate("Signup")}
          >
            Sign up
          </Texts>
        </Text>
      </View>
      <View>
        <Texts appearance='hint' style={styles.footer}>
          All rights reserved &copy; 2021, Fasha
        </Texts>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { width: "100%", borderRadius: 30 },
  btnParent: { width: "92%", alignSelf: "center", alignItems: "center" },
  container: {
    flex: 1,
    justifyContent: "space-between",
    width: "100%",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  form: {
    width: "92%",
    alignSelf: "center",
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
  },
  innerForm: {
    alignItems: "center",
  },
  input: {
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    padding: 10,
    margin: 5,
    width: "90%",
  },
  logoBox: {
    alignItems: "flex-start",
    margin: 7,
    width: 100,
  },
  logo: { width: "100%", height: 70 },
  span: { fontSize: 15, fontWeight: "bold" },
  welcome: { alignItems: "center" },
  welcomeText: { fontSize: 24, fontWeight: "bold" },
});

export default Signin;