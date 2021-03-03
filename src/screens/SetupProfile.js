import React, { useState } from "react";
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  TextInput,
  Keyboard,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Button, Text, Spinner } from "@ui-kitten/components";
import axios from "axios";
import { API_URL } from "dotenv";
import { validateEmail } from "../helpers/emailValidation";
import { useNavigation, useRoute } from "@react-navigation/native";

export default SetupProfile = ({ onSetup, loading }) => {
  const [userProfile, setUserProfile] = useState({
    fullNames: "",
    username: "",
  });
  const route = useRoute();

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
        <Text style={styles.welcomeText}>Almost there,</Text>
        <Text>Setup a basic profile, you can edit later</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.innerForm}>
          <TextInput
            underlineColorAndroid='rgba(0,0,0,0)'
            placeholder='Full Names'
            style={styles.input}
            value={userProfile.fullNames}
            onChangeText={(fullNames) =>
              setUserProfile({ ...userProfile, fullNames })
            }
          />
          <TextInput
            underlineColorAndroid='rgba(0,0,0,0)'
            placeholder='Choose your username'
            style={styles.input}
            value={userProfile.username}
            onChangeText={(username) =>
              setUserProfile({ ...userProfile, username })
            }
          />
        </View>
      </View>
      <View style={styles.btnParent}>
        <Button style={styles.btn} onPress={() => onSetup(userProfile, route)}>
          {!loading ? "Finish setup" : <Spinner status='basic' size='small' />}
        </Button>
      </View>
      <View>
        <Text appearance='hint' style={styles.footer}>
          All rights reserved &copy; 2021 Fasha
        </Text>
      </View>
    </View>
  );
};

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
