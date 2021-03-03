import React from "react";
import { StyleSheet, View, Platform, StatusBar, Alert } from "react-native";
import {
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
  OverflowMenu,
  MenuItem,
  Divider,
  Spinner,
} from "@ui-kitten/components";
import { useState } from "react/cjs/react.development";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "dotenv";

const Profile = (props) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const BackIcon = (props) => <Icon {...props} name='arrow-back' />;

  const BackAction = () => <TopNavigationAction icon={BackIcon} />;

  const SettingsIcon = (props) => <Icon {...props} name='settings' />;

  const SettingsIconAnchor = (props) => (
    <Icon {...props} name='settings' style={{ display: "none" }} />
  );

  const SettingsAction = () => (
    <TopNavigationAction icon={SettingsIcon} onPress={() => setVisible(true)} />
  );

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return Alert.alert(
          "Sign in",
          "You need to sign in to perform this action",
          [{ text: `Sign in`, onPress: () => navigation.navigate("Signin") }]
        );
      }
      setLoading(true);
      const response = await axios.delete(`${API_URL}/users/user/delete`, {
        headers: { token },
      });
      if (response.status === 200) {
        setLoading(false);
        await AsyncStorage.removeItem("token");
        return navigation.navigate("Signup");
      }
    } catch (error) {
      if (error.response && error.response.status === 401)
        return Alert.alert(
          "Authentication failed!",
          "You need to sign in to perform this action",
          [{ text: `Sign in`, onPress: () => navigation.navigate("Signin") }]
        );
      if (error.response && error.response.status === 404)
        return Alert.alert("User not found!", error.response.data.error, [
          { text: `Sign up`, onPress: () => navigation.navigate("Signup") },
        ]);
    }
  };

  return (
    <View style={styles.container}>
      <TopNavigation
        accessoryLeft={BackAction}
        title={() => (
          <Text style={styles.title}>
            {route.params ? `${route.params.fullNames}` : "User"}
          </Text>
        )}
        subtitle={route.params ? `@${route.params.username}` : "@Username"}
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
          <MenuItem title='Logout' disabled />
          <MenuItem
            title='Delete account'
            onPress={() => {
              setVisible(false);
              Alert.alert(
                "Confirm Deletion",
                "Are you sure you want to delete your account? This action cannot be undone!",
                [
                  { text: `Yes, I'm sure`, onPress: handleSubmit },
                  { text: `No, cancel`, onPress: () => console.log("no") },
                ]
              );
            }}
          />
        </OverflowMenu>
      </View>
      {loading ? (
        <View style={styles.spinner}>
          <Spinner size='medium' />
        </View>
      ) : (
        <Text></Text>
      )}
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 26,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: { minHeight: 128 },
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
