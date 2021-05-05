import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  Platform,
  StatusBar,
  Keyboard,
} from "react-native";
import {
  Button,
  Text,
  Input,
  Spinner,
  Select,
  SelectItem,
  IndexPath,
} from "@ui-kitten/components";
import axios from "axios";
import { API_URL } from "dotenv";
import { validateEmail } from "../helpers/emailValidation";
import { useNavigation, useRoute } from "@react-navigation/native";

export default SetupProfile = ({ onSetup, loading }) => {
  const [userProfile, setUserProfile] = useState({
    fullNames: "",
    username: "",
  });
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const [selectedTag, setSelected] = useState();
  const [tags, setTags] = useState([]);
  const route = useRoute();
  const selectRef = useRef(null);
  const selectedTags = [];
  useEffect(() => {
    const getTags = async () => {
      try {
        const response = await axios.get(`${API_URL}/tags`);
        // console.log(response.data.data, ".....");
        setTags(response.data.data);
      } catch (error) {
        console.log(error.response.data);
      }
    };
    getTags();
  }, []);

  // const multipleTagsValues = selectedIndex.map((index) => {
  //   selectedTags.push(tags?.length > 0 ? tags[index.row] : "");
  //   return tags?.length > 0 ? tags[index.row].tagName : null;
  // });

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
            <Text style={styles.welcomeText}>Almost there,</Text>
            <Text>Setup a basic profile, you can edit later</Text>
          </View>
          <View style={styles.form}>
            <View style={styles.innerForm}>
              <Input
                placeholder='Full Names'
                value={userProfile.fullNames}
                onChangeText={(fullNames) =>
                  setUserProfile({ ...userProfile, fullNames })
                }
              />
              <Input
                placeholder='Choose your username'
                value={userProfile.username}
                onChangeText={(username) =>
                  setUserProfile({ ...userProfile, username })
                }
              />
              <Select
                value={
                  tags?.length > 0
                    ? tags[selectedIndex.row].tagName
                    : "Select your room"
                }
                onFocus={() => Keyboard.dismiss()}
                selectedIndex={selectedIndex}
                onSelect={(index) => {
                  setSelectedIndex(index);
                  setSelected(tags[index.row]);
                }}
              >
                {tags && tags.length > 0
                  ? tags.map((tag) => (
                      <SelectItem
                        title={tag.tagName}
                        key={tag.tagId}
                        ref={selectRef}
                      />
                    ))
                  : null}
              </Select>
            </View>
          </View>
          <View style={styles.btnParent}>
            <Button
              style={styles.btn}
              onPress={() => onSetup(userProfile, selectedTag, route)}
            >
              {!loading ? (
                "Finish setup"
              ) : (
                <Spinner status='basic' size='small' />
              )}
            </Button>
          </View>
          <View>
            <Text appearance='hint' style={styles.footer}>
              All rights reserved &copy; 2021 Fasha
            </Text>
          </View>
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
  inputSelect: {
    // borderRadius: 10,
    // backgroundColor: "#F6F6F6",
    // padding: 10,
    // margin: 5,
    width: "100%",
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
