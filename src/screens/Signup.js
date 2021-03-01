import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useMutation, gql } from "@apollo/client";
import { Button, Text as Texts, Spinner } from "@ui-kitten/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { validateEmail } from "../helpers/emailValidation";

function Signup(props) {
  const [userData, setUserData] = useState({
    userEmail: "",
    userPassword: "",
  });

  const [isMatch, setIsMatch] = useState(false);

  const ADD_USERS = gql`
    mutation($userEmail: String!, $userPassword: String!) {
      insert_users(
        objects: { userEmail: $userEmail, userPassword: $userPassword }
      ) {
        returning {
          userEmail
        }
      }
    }
  `;

  const [addUser, { loading, error, data }] = useMutation(ADD_USERS);

  const handleSubmit = () => {
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

    if (error) {
      return error.graphQLErrors.map((error) => {
        // console.log(error);
        if (error.extensions.code === "constraint-violation")
          return Alert.alert(
            "User already exists!",
            "Account with this email is already created, sign in instead",
            [
              {
                text: "Yes, sign me in",
                onPress: () => console.log("Thank you!"),
              },
            ]
          );
      });
    }
    addUser({ variables: { userEmail, userPassword } });
    Keyboard.dismiss();
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
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text>Create an account to get started!</Text>
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
          <TextInput
            underlineColorAndroid='rgba(0,0,0,0)'
            placeholder='Confirm password'
            style={styles.input}
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
        <Button style={styles.btn} onPress={handleSubmit}>
          {!loading ? (
            "Create account"
          ) : (
            <Spinner status='basic' size='small' />
          )}
        </Button>
        <Text>
          Already have an account?{" "}
          <Texts status='primary' style={styles.span}>
            Sign in
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

export default Signup;
