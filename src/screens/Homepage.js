import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  TouchableHighlight,
} from "react-native";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  Text,
  Icon,
  TopNavigation,
  TopNavigationAction,
  OverflowMenu,
  MenuItem,
  Avatar,
  Layout,
  Spinner,
  Card,
  List,
  ListItem,
  Divider,
} from "@ui-kitten/components";

import Toast from "react-native-toast-message";
import BottomSheet from "react-native-simple-bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FASHA_KEY, API_URL } from "dotenv";
import jwt from "expo-jwt";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";
import connectSocket from "../helpers/socketConnection";
import AddPost from "./AddPost";

const AddIcon = (props) => (
  <Icon
    {...props}
    name='plus-circle-outline'
    height={25}
    width={50}
    fill='black'
  />
);

const MessageIcon = (props) => (
  <Icon
    {...props}
    name='paper-plane-outline'
    height={25}
    width={30}
    fill='black'
  />
);

const rightActions = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        width: "70%",
        justifyContent: "space-between",
      }}
    >
      <View style={{ width: "20%" }}>
        <AddIcon />
      </View>
      <View style={{ width: "10%" }}>
        <MessageIcon />
      </View>
    </View>
  );
};

const Homepage = (props) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [selectedPost, setSelectedPost] = useState({});
  const [isDeleted, setIsDeleted] = useState(false);
  const [visible, setVisible] = useState(false);

  const panelRef = useRef(null);
  const isFocused = useIsFocused();
  useEffect(() => {
    const fetchToken = async () => {
      try {
        if (!isFocused) return;
        const token = await AsyncStorage.getItem("token");
        const socket = connectSocket(token);
        const isUser = jwt.decode(token, FASHA_KEY);
        setUser(isUser);
        setLoading(true);
        const response = await axios.get(`${API_URL}/posts/`, {
          headers: { token },
        });
        setLoading(false);
        setPosts(response.data.data);
        socket.on("created-post", (data) => {
          if (data.posts.length <= 0) return;
          console.log(
            "creator",
            data.creator,
            "\nuser",
            isUser.uuid,
            "\nthe fuck",
            isUser.uuid === data.creator
          );
          setPosts(data.posts);
          if (isUser.uuid === data.creator) {
            return Toast.show({
              type: "success",
              text1: "Success",
              text2: "Post created",
              autoHide: true,
              visibilityTime: 2000,
              position: "top",
            });
          }
          return Toast.show({
            type: "success",
            text1: "New Posts",
            text2: "New Posts created",
            autoHide: true,
            visibilityTime: 2000,
            position: "top",
          });
        });
        return;
      } catch (error) {
        setLoading(false);
        console.log(error);
        if (error && error.response.status === 404)
          return Toast.show({
            type: "error",
            text1: "Not found",
            text2: error.response.data.error,
            position: "top",
          });
        if (error && error.response.status === 500)
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
    fetchToken();
  }, [isDeleted]);
  const handleDate = (current, previous) => {
    const minutesUnit = 60 * 1000;
    const hoursUnit = minutesUnit * 60;
    const daysUnit = hoursUnit * 24;
    const weeksUnit = daysUnit * 7;

    var elapsed = current - previous;

    if (elapsed < minutesUnit)
      return `${Math.round(elapsed / 1000)} seconds ago`;
    if (elapsed < hoursUnit)
      return `${Math.round(elapsed / minutesUnit)} minutes ago`;
    if (elapsed < daysUnit)
      return Math.round(elapsed / hoursUnit) === 1
        ? `${Math.round(elapsed / hoursUnit)} hour ago`
        : `${Math.round(elapsed / hoursUnit)} hours ago`;
    if (elapsed < weeksUnit)
      return Math.round(elapsed / daysUnit) === 1
        ? `${Math.round(elapsed / daysUnit)} day ago`
        : `${Math.round(elapsed / daysUnit)} days ago`;

    return null;
  };

  const handleDeletePost = async () => {
    panelRef.current.togglePanel();
    try {
      const token = await AsyncStorage.getItem("token");
      setLoading(true);
      const response = await axios.delete(
        `${API_URL}/posts/${selectedPost.uuid}`,
        {
          headers: { token },
        }
      );
      if (response.status === 200) {
        setLoading(false);
        setIsDeleted(true);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.message,
          position: "bottom",
        });
        setIsDeleted(false);
        return;
      }
      setLoading(false);
      return;
    } catch (error) {
      setLoading(false);
      if (error && error.response.status === 403) {
        return Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response.data.message,
          position: "top",
        });
      }
      if (error && error.response.status === 500) {
        console.log(loading);
        return Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong, try again later",
          position: "top",
        });
      }

      return Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
        position: "top",
      });
    }
  };
  const renderRightActions = () => (
    <View style={{ width: "45%" }}>
      <TopNavigationAction
        icon={rightActions}
        onPress={() => setVisible(true)}
      />
    </View>
  );

  return (
    <>
      <AddPost
        visible={visible}
        setVisible={setVisible}
        image={user && user.image}
      />
      <Layout style={styles.container}>
        <TopNavigation
          accessoryLeft={() => (
            <Image
              source={require("../assets/app/logo.png")}
              style={{ width: 100, height: 40 }}
            />
          )}
          accessoryRight={renderRightActions}
        />
        {!loading ? (
          <ScrollView>
            <Layout style={styles.body}>
              {posts && posts.length > 0 ? (
                posts.map((post) => {
                  const elapsed = handleDate(
                    new Date(),
                    +new Date(post.createdAt)
                  );

                  return (
                    <TouchableHighlight
                      key={post.uuid}
                      underlayColor='#F1F1F1'
                      onPress={() =>
                        navigation.navigate("Post", { uuid: post.uuid })
                      }
                    >
                      <View style={styles.posts}>
                        <View style={styles.postContainer}>
                          <View style={styles.postAvatar}>
                            {post && post.user.image ? (
                              <Avatar
                                size='medium'
                                source={{ uri: post.user.image }}
                              />
                            ) : (
                              <Layout></Layout>
                            )}
                          </View>
                          <View style={styles.postUser}>
                            <View style={styles.postHeader}>
                              <Text style={styles.numbers}>
                                {post.user.fullnames}
                              </Text>
                              <Text
                                appearance='hint'
                                style={styles.postUsername}
                              >
                                {`@${post.user.username}`}
                              </Text>
                            </View>
                            <View style={styles.postTime}>
                              <Text appearance='hint' style={{ fontSize: 12 }}>
                                {elapsed
                                  ? elapsed
                                  : `${new Date(
                                      post.createdAt
                                    ).getDate()}-${new Date(
                                      post.createdAt
                                    ).getMonth()}-${new Date(
                                      post.createdAt
                                    ).getFullYear()}`}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.postMedia}>
                          <View style={styles.postCaption}>
                            {post.postcaption ? (
                              <Text>{post.postcaption}</Text>
                            ) : null}
                          </View>
                          <View>
                            {post.postmedia ? (
                              <Image
                                source={{ uri: post.postmedia }}
                                style={styles.postImage}
                              />
                            ) : (
                              <Layout></Layout>
                            )}
                          </View>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                          <View style={{ width: "8%" }}>
                            <Icon
                              name='message-circle-outline'
                              fill='#8f9bb3'
                              height={18}
                            />
                          </View>
                          <Text appearance='hint'>{post.comments.length}</Text>
                          {post && post.user.uuid === user.uuid ? (
                            <View style={{ width: "20%" }}>
                              <Icon
                                name='more-horizontal-outline'
                                fill='#8f9bb3'
                                height={18}
                                onPress={() => {
                                  setSelectedPost(post);
                                  panelRef.current.togglePanel();
                                }}
                              />
                            </View>
                          ) : (
                            <View></View>
                          )}
                        </View>
                      </View>
                    </TouchableHighlight>
                  );
                })
              ) : (
                <Text></Text>
              )}
            </Layout>
          </ScrollView>
        ) : (
          <Layout
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Spinner size='giant' />
          </Layout>
        )}
      </Layout>
      <View>
        <BottomNav />
      </View>
      <BottomSheet
        ref={(ref) => {
          panelRef.current = ref;
        }}
        sliderMinHeight={0}
        isOpen={false}
      >
        {[
          {
            title: "Edit post",
            icon: "edit-2-outline",
            onPress: () => {
              panelRef.current.togglePanel();
              navigation.navigate("Edit Post", {
                image: user && user.image,
                post: selectedPost,
              });
            },
          },
          {
            title: "Delete post",
            icon: "trash-2-outline",
            onPress: handleDeletePost,
          },
        ].map((item, index) => {
          return (
            <View key={index}>
              <TouchableHighlight
                onPress={item.onPress}
                underlayColor='#F1F1F1'
              >
                <View style={{ flexDirection: "row", paddingVertical: "5%" }}>
                  <View style={{ width: "15%" }}>
                    <Icon name={`${item.icon}`} fill='#8f9bb3' height={20} />
                  </View>
                  <View>
                    <Text>{item.title}</Text>
                  </View>
                </View>
              </TouchableHighlight>
              <Divider />
            </View>
          );
        })}
      </BottomSheet>
    </>
  );
};

export default Homepage;

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
  noPost: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    height: 200,
  },
  noPostImage: { width: "50%", height: 100 },
  numbersContainer: {
    width: 50,
    alignItems: "center",
  },
  numbers: { fontWeight: "bold" },
  posts: {
    // marginTop: 20,

    justifyContent: "space-between",
    padding: "6%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "#eaebec",
    borderBottomColor: "#eaebec",
  },
  postCaption: {
    alignItems: "flex-start",
    margin: "5%",
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
    marginBottom: "5%",
  },
  postMedia: {
    // minHeight: 100,
    justifyContent: "space-between",
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
