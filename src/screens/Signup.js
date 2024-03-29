import React, { useState } from "react";
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Button, Text, Spinner, Input } from "@ui-kitten/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import { API_URL } from "dotenv";
import { validateEmail } from "../helpers/emailValidation";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default Signup = ({ onSignup, loading }) => {
  const [userData, setUserData] = useState({
    userEmail: "",
    userPassword: "",
  });
  // const [loading, setLoading] = useState(false);
  const [isMatch, setIsMatch] = useState(false);

  const navigation = useNavigation();

  // const handleSubmit = async () => {
  //   try {
  //     const { userEmail, userPassword } = userData;
  //     const isValid = validateEmail(userEmail);

  //     if (!isValid)
  //       return Alert.alert(
  //         "Invalid email",
  //         "Please make sure your email is valid",
  //         [{ text: "OK", onPress: () => console.log("Thank you!") }]
  //       );

  //     if (!isMatch)
  //       return Alert.alert(
  //         "Password mismatch!",
  //         "Make sure both passwords match",
  //         [{ text: "OK", onPress: () => console.log("Thank you!") }]
  //       );
  //     setLoading(true);
  //     Keyboard.dismiss();
  //     const response = await axios.post(`${API_URL}/users/signup`, {
  //       email: userEmail,
  //       password: userPassword,
  //     });
  //     if (response.status === 201) {
  //       setLoading(false);
  //       await AsyncStorage.setItem("token", response.data.data);
  //       return navigation.navigate("SetupProfile", {
  //         email: userData.userEmail,
  //       });
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     if (error.response && error.response.status === 409)
  //       return Alert.alert("User already exists", error.response.data.error, [
  //         {
  //           text: "Yes, sign me in",
  //           onPress: () => navigation.navigate("Signin"),
  //         },
  //       ]);
  //     return null;
  //   }
  // };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps='handled'
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
        <View style={styles.container}>
          <View style={styles.logoBox}>
            <Image
              resizeMode='cover'
              source={require("../assets/app/logo.png")}
              style={styles.logo}
            />
          </View>
          <View style={styles.welcome}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text>Create an account to get started!</Text>
          </View>
          <View style={styles.form}>
            <View style={styles.innerForm}>
              <Input
                placeholder='Email'
                keyboardType='email-address'
                autoCapitalize='none'
                value={userData.userEmail}
                onChangeText={(userEmail) =>
                  setUserData({ ...userData, userEmail })
                }
              />
              <Input
                placeholder='Password'
                secureTextEntry={true}
                autoCapitalize='none'
                value={userData.userPassword}
                onChangeText={(userPassword) =>
                  setUserData({ ...userData, userPassword })
                }
              />
              <Input
                placeholder='Confirm password'
                secureTextEntry={true}
                autoCapitalize='none'
                onChangeText={(confirmPass) =>
                  userData.userPassword === confirmPass
                    ? setIsMatch(true)
                    : setIsMatch(false)
                }
              />
            </View>
          </View>
          <View style={styles.btnParent}>
            <Button
              style={styles.btn}
              onPress={() => onSignup(userData, isMatch, navigation)}
            >
              {!loading ? "Next" : <Spinner status='basic' size='small' />}
            </Button>
            <Text>
              Already have an account?{" "}
              <Text
                status='primary'
                style={styles.span}
                onPress={() => navigation.navigate("Signin")}
              >
                Sign in
              </Text>
            </Text>
          </View>
          <Text appearance='hint' style={styles.footer}>
            All rights reserved &copy; 2021 Fasha
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  btn: { width: "100%", borderRadius: 30 },
  btnParent: { width: "92%", alignSelf: "center", alignItems: "center" },
  container: {
    flexGrow: 1,
    justifyContent: "space-around",
    width: "100%",
    paddingTop: Platform.OS === "android" ? 20 : 0,
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
