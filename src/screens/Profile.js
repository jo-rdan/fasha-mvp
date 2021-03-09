import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Platform,
  StatusBar,
  Alert,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import {
  Text,
  Icon,
  TopNavigation,
  TopNavigationAction,
  OverflowMenu,
  MenuItem,
  Avatar,
  Spinner,
} from "@ui-kitten/components";
import { Icon as Icons } from "react-native-eva-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { FASHA_KEY, API_URL } from "dotenv";
import jwt from "expo-jwt";
import BottomNav from "./shared/BottomNav";

const Profile = ({ onLogout, onDelete, loading, setLoading }) => {
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState({});
  const navigation = useNavigation();
  const route = useRoute();

  const BackIcon = (props) => <Icon {...props} name='arrow-back' />;

  const BackAction = () => <TopNavigationAction icon={BackIcon} />;

  const PersonIcon = (props) => <Icon {...props} name='person-outline' />;

  const PersonAction = () => <TopNavigationAction icon={PersonIcon} />;

  const SettingsIcon = (props) => <Icon {...props} name='settings-outline' />;

  const SettingsIconAnchor = (props) => (
    <Icon {...props} name='settings' style={{ display: "none" }} />
  );

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem("token");
      // const userData = await jwt.decode(token, `${FASHA_KEY}`);
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/user/profile`, {
        headers: { token: `${token}` },
      });
      setLoading(false);
      setUser(response.data.data);
    };
    fetchToken();
  }, []);

  const SettingsAction = () => (
    <TopNavigationAction icon={SettingsIcon} onPress={() => setVisible(true)} />
  );

  // const onLogout = async () => {
  //   setVisible(false);
  //   setLoading(true);
  //   await AsyncStorage.removeItem("token");
  //   setLoading(false);
  //   return;
  // };

  return (
    <View style={styles.container}>
      <TopNavigation
        accessoryLeft={BackAction}
        title={() => <Text style={styles.title}>{user.fullNames}</Text>}
        subtitle={user && user.username ? `@${user.username}` : ""}
        accessoryRight={SettingsAction}
      />
      <View style={styles.buttonContainer}>
        <OverflowMenu
          anchor={SettingsIconAnchor}
          visible={visible}
          placement='bottom end'
          onBackdropPress={() => setVisible(false)}
        >
          <MenuItem title='Edit Profile' disabled />
          <MenuItem title='Logout' onPress={() => onLogout(setVisible)} />
          <MenuItem
            title={(props) => (
              <Text
                {...props}
                style={{
                  marginLeft: 8,
                  marginRight: 8,
                  width: "90%",
                  color: "white",
                  fontSize: 13,
                }}
              >
                Delete account
              </Text>
            )}
            style={{ backgroundColor: "red" }}
            onPress={() => {
              setVisible(false);
              Alert.alert(
                "Confirm Deletion",
                "Are you sure you want to delete your account? This action cannot be undone!",
                [
                  { text: `Yes, I'm sure`, onPress: onDelete },
                  { text: `No, cancel`, onPress: () => console.log("no") },
                ]
              );
            }}
          />
        </OverflowMenu>
      </View>
      <ScrollView>
        {loading ? (
          <View style={styles.spinner}>
            <Spinner size='medium' />
          </View>
        ) : (
          <Text></Text>
        )}
        <View style={styles.profileContainer}>
          <View>
            {user.image ? (
              <Image
                source={require("../assets/app/profile.jpeg")}
                style={styles.avatar}
              />
            ) : (
              <View
                style={{
                  backgroundColor: "lightgray",
                  width: 70,
                  height: 70,
                  top: -15,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 50,
                }}
              >
                <Avatar ImageComponent={PersonAction} size='medium' />
              </View>
            )}
          </View>
          <View style={styles.numbersContainer}>
            <Text style={styles.numbers}>0</Text>
            <Text>Posts</Text>
          </View>
          <View style={styles.numbersContainer}>
            <Text style={styles.numbers}>0</Text>
            <Text>Groups</Text>
          </View>
          <View style={styles.numbersContainer}>
            <Text style={styles.numbers}>0</Text>
            <Text>Stories</Text>
          </View>
        </View>
        <View style={styles.bioContainer}>
          <Text style={styles.bioTitle}>Biography</Text>
          <View style={styles.bio}>
            <Text
              style={styles.bioText}
              appearance={user && !user.bio ? "hint" : "normal"}
            >
              {user.bio}
            </Text>
          </View>
        </View>
        <View style={styles.noPost}>
          <Text category='h5'>No posts yet</Text>
          <Image
            source={require("../assets/app/post.png")}
            style={styles.noPostImage}
          />
        </View>
        {/* <View style={styles.posts}>
          <View style={styles.postContainer}>
            <View style={styles.postAvatar}>
              <Avatar
                size='medium'
                source={require("../assets/app/profile.jpeg")}
              />
            </View>
            <View style={styles.postUser}>
              <View style={styles.postHeader}>
                <Text style={styles.numbers}>Jordan Kayz</Text>
                <Text appearance='hint' style={styles.postUsername}>
                  @jo.rdan
                </Text>
              </View>
              <View style={styles.postTime}>
                <Text appearance='hint' style={{ fontSize: 12 }}>
                  9 hours ago
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.postMedia}>
            <View style={styles.postCaption}>
              <View>
                <Text>Today I started working out, wish me luck.{"\n"} </Text>
                <Image
                  source={require("../assets/app/profile.jpeg")}
                  style={styles.postImage}
                />
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: 20 }}>
              <Icons name='message-circle-outline' fill='grey' height={20} />
            </View>
            <Text>0</Text>
          </View>
          <View>
            <TextInput
              underlineColorAndroid='transparent'
              placeholder='Comment'
              style={styles.input}
              autoCompleteType='email'
              autoCapitalize='none'
            />
          </View>
        </View> */}
      </ScrollView>
      <View>
        <BottomNav />
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
    top: -15,
  },
  bio: {
    width: "50%",
  },
  bioText: {
    fontSize: 14,
  },
  bioContainer: {
    left: 20,
    marginBottom: 20,
    justifyContent: "space-between",
    height: 65,
  },
  bioTitle: {
    fontWeight: "bold",
    fontSize: 15,
  },
  buttonContainer: {
    marginVertical: 3,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: { minHeight: 128 },
  icons: {
    alignSelf: "flex-start",
  },
  input: {
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    padding: 5,
    margin: 5,
    fontSize: 12,
    width: "100%",
  },
  noPost: { flex: 1, alignItems: "center", justifyContent: "center" },
  noPostImage: { width: 200, height: 200 },
  numbersContainer: {
    width: 50,
    alignItems: "center",
  },
  numbers: { fontWeight: "bold" },
  posts: {
    // marginTop: 20,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "#eaebec",
    borderBottomColor: "#eaebec",
  },
  postCaption: {
    alignItems: "center",
    margin: 10,
    justifyContent: "center",
  },
  postContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  postHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  postImage: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  postMedia: {
    minHeight: 100,
    justifyContent: "space-between",
    alignItems: "center",
  },
  postUser: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    alignItems: "center",
    // left: -15,
  },
  postUsername: { fontSize: 12 },
  profileContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  spinner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
});
