import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  Layout,
  Text,
  Icon,
  TopNavigation,
  TopNavigationAction,
  OverflowMenu,
  MenuItem,
  Avatar,
  Spinner,
  Input,
  Select,
  SelectItem,
  Button,
  IndexPath,
} from "@ui-kitten/components";
import Toast from "react-native-toast-message";

import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_URL, CLOUDINARY_API, FASHA_KEY } from "dotenv";
import axios from "axios";
import jwt from "expo-jwt";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProfile = (props) => {
  const navigation = useNavigation();
  const route = useRoute();

  const data = ["Choose privacy option", "public", "private"];
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const [user, setUser] = useState({
    fullnames: route.params.user.fullnames,
    username: route.params.user.username,
    imageUri: route.params.user.image,
    image: "",
    tag: route.params.user.tag,
    privacy: route.params.user.privacy,
  });
  // const [user, setUser] = useState(route.params.user);
  const [tags, setTags] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("token");
      const data = await axios.get(`${API_URL}/tags`);
      setTags(data.data.data);
      return;
    };

    fetchUser();
  }, []);

  const BackIcon = (props) => <Icon {...props} name='arrow-back' />;

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
  );

  const CheckIcon = (props) =>
    isUpdating ? (
      <Spinner size='tiny' />
    ) : (
      <Icon {...props} fill='blue' name='checkmark-circle-2-outline' />
    );

  const CheckAction = () => (
    <TopNavigationAction icon={CheckIcon} onPress={handleEdit} />
  );

  const askForPermission = async () => {
    const permissionResult = await Permissions.askAsync(Permissions.CAMERA);
    if (permissionResult.status !== "granted") {
      Alert.alert("no permissions to access camera!", [{ text: "ok" }]);
      return false;
    }
    return true;
  };

  const takeImage = async () => {
    try {
      const hasPermission = await askForPermission();
      if (!hasPermission) {
        return;
      } else {
        let image = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [3, 3],
          base64: true,
        });
        if (!image.cancelled) {
          let base64Img = `data:image/jpg;base64,${image.base64}`;
          // setUser({...user, imageUri: image.uri});
          const file = {
            file: base64Img,
            upload_preset: "fasha_app",
          };
          setLoading(true);
          const response = await fetch(`${CLOUDINARY_API}/image/upload`, {
            body: JSON.stringify(file),
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
          });
          const res = await response.json();
          setUser({ ...user, image: res.secure_url, imageUri: image.uri });
          setLoading(false);
          return;
        }
      }
    } catch (error) {}
  };

  const handleEdit = async () => {
    Keyboard.dismiss();
    try {
      // const { id } = userProfile;
      const { imageUri, tag, ...userData } = user;
      const token = await AsyncStorage.getItem("token");
      setIsUpdating(true);
      const response = await axios.patch(
        `${API_URL}/users/edit-profile?tag=${tag.tagId}`,
        {
          ...userData,
        },
        { headers: { token } }
      );
      console.log("------", response.data.data);
      setIsUpdating(false);
      if (response.status === 200)
        return Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.message,
          visibilityTime: 2000,
          autoHide: true,
          position: "bottom",
        });
    } catch (error) {
      setLoading(false);
      if (error.response.status === 403)
        return Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response.error,
          position: "top",
        });

      if (error.response.status === 404)
        return Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response.error,
          position: "top",
        });

      if (error.response.status === 500)
        return Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong, try again later",
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

  return (
    <Layout style={styles.container}>
      <TopNavigation
        accessoryLeft={BackAction}
        title={() => <Text style={styles.title}>Edit Profile</Text>}
        accessoryRight={CheckAction}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
          <Layout style={styles.body}>
            <Layout style={styles.userImage}>
              <Layout>
                <Avatar
                  source={{ uri: user?.imageUri }}
                  style={styles.avatar}
                />
                {loading ? (
                  <Layout
                    style={{
                      backgroundColor: "transparent",
                      top: "-50%",
                      width: "10%",
                      left: "10%",
                    }}
                  >
                    <Spinner size='medium' />
                  </Layout>
                ) : (
                  <Layout></Layout>
                )}
              </Layout>
              <Layout>
                <Text status='primary' onPress={takeImage}>
                  Change profile image
                </Text>
              </Layout>
            </Layout>
            <Layout style={{ width: "90%", alignSelf: "center" }}>
              <Layout style={{ alignItems: "center" }}>
                <TextInput
                  underlineColorAndroid='rgba(0,0,0,0)'
                  autoCorrect={false}
                  placeholder='Full Names'
                  style={styles.input}
                  value={user.fullnames}
                  onChangeText={(fullNames) =>
                    setUser({ ...user, fullnames: fullNames })
                  }
                />
                <TextInput
                  underlineColorAndroid='rgba(0,0,0,0)'
                  autoCorrect={false}
                  placeholder='@Username'
                  style={styles.input}
                  value={user.username}
                  onChangeText={(username) => setUser({ ...user, username })}
                />
                <Select
                  value={!user.privacy ? data[selectedIndex.row] : user.privacy}
                  selectedIndex={selectedIndex}
                  onSelect={(index) => {
                    setUser({
                      ...user,
                      privacy: data[index.row],
                    });
                  }}
                  style={styles.select}
                >
                  {data.map((data, index) => (
                    <SelectItem
                      title={data}
                      key={index}
                      disabled={index === 0}
                    />
                  ))}
                </Select>
                <Select
                  value={
                    !user?.tag?.tagName
                      ? tags.length > 0 && tags[selectedIndex.row].tagName
                      : user.tag.tagName
                  }
                  selectedIndex={selectedIndex}
                  onSelect={(index) => {
                    setUser({
                      ...user,
                      tag: tags[index.row],
                    });
                  }}
                  style={styles.select}
                >
                  {tags.map((tag, index) => (
                    <SelectItem title={tag.tagName} key={tag.tagId} />
                  ))}
                </Select>
              </Layout>
            </Layout>
            {/* <Layout style={{ alignItems: "flex-start" }}>
            <Text status='primary'>Personal Information</Text>
          </Layout> */}
          </Layout>
        </KeyboardAvoidingView>
      </ScrollView>
      {/* <Layout>
        <BottomNav />
      </Layout> */}
    </Layout>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  avatar: {
    width: 100,
    height: 100,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  input: {
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    padding: 10,
    margin: 5,
    width: "90%",
  },
  select: {
    width: "90%",
    margin: 5,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  userImage: {
    alignItems: "center",
    justifyContent: "space-between",
    height: "25%",
  },
});
