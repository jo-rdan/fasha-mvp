import React from "react";
import { StyleSheet, View, Platform, StatusBar, Image } from "react-native";
import {
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
  Layout,
  Avatar,
} from "@ui-kitten/components";

const BackIcon = (props) => <Icon {...props} name='arrow-back' />;

const BackAction = () => <TopNavigationAction icon={BackIcon} />;

const Notifications = (props) => {
  return (
    <Layout style={styles.container}>
      {/* Top nav */}
      <TopNavigation
        accessoryLeft={BackAction}
        title={() => <Text style={styles.title}>Notifications</Text>}
      />
      {/* Notifications */}
      {/* User info && timestamp */}
      <View style={styles.notifications}>
        <View style={styles.header}>
          {/* IMAGE */}
          <View style={styles.userInfo}>
            <Avatar source={require("../assets/app/profile.jpeg")} />
            {/* USER INFO */}
            <View>
              <Text style={styles.notTitle}>New Post</Text>
            </View>
          </View>
          <View>
            {/* TIMESTAMP */}
            <Text
              appearance='hint'
              style={styles.time}
            >{`${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`}</Text>
          </View>
        </View>
        <View style={styles.message}>
          <View>
            <Icon name='file-text-outline' height={20} width={20} fill='grey' />
          </View>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Jordan Kayinamura</Text>{" "}
            created a new post
          </Text>
        </View>
      </View>
      {/* Notification text */}
    </Layout>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    paddingHorizontal: 10,
  },
  notifications: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "space-between",
    // backgroundColor: "red",
    height: 120,
    borderLeftWidth: 5,
    borderLeftColor: "#3366ff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    borderRadius: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
  },
  notTitle: {
    fontWeight: "bold",
  },
  time: {
    fontSize: 12,
  },
  message: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
});
