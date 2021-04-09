import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Platform,
  StatusBar,
  Alert,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TouchableHighlight,
  Keyboard,
} from "react-native";
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
  Modal,
  ListItem,
  Divider,
  Button,
} from "@ui-kitten/components";
import Toast from "react-native-toast-message";

import BottomSheet from "react-native-simple-bottom-sheet";
import { Icon as Icons } from "react-native-eva-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import axios from "axios";
import { FASHA_KEY, API_URL } from "dotenv";
import jwt from "expo-jwt";
import BottomNav from "./shared/BottomNav";
import AddPost from "./AddPost";
import Comments from "./Comments";
import EditComment from "./shared/EditComment";

const Post = (props) => {
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState({});
  const [newComment, setNewComment] = useState(false);
  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [changeData, setChangeData] = useState({ data: "", change: false });
  const [disable, setDisable] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();
  const panelRef = useRef(null);
  const textRef = useRef(null);

  let postId;

  const BackIcon = (props) => <Icon {...props} name='arrow-back' />;

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
  );

  const PersonIcon = (props) => <Icon {...props} name='person-outline' />;

  const PersonAction = () => <TopNavigationAction icon={PersonIcon} />;

  const SettingsIcon = (props) => <Icon {...props} name='settings-outline' />;

  const AddIcon = (props) => <Icon {...props} name='plus-circle-outline' />;

  const SettingsAction = () => (
    <TopNavigationAction icon={SettingsIcon} onPress={() => setVisible(true)} />
  );

  const SettingsIconAnchor = (props) => (
    <Icon {...props} name='settings' style={{ display: "none" }} />
  );

  useEffect(() => {
    if (!isFocused) return;
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const isUser = jwt.decode(token, FASHA_KEY);
        setUser(isUser);
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/posts/${route.params.uuid}`,
          {
            headers: { token },
          }
        );
        setLoading(false);
        setPost(response.data.data);
        return;
      } catch (error) {
        console.log("<====2", error);
      }
    };
    fetchToken();

    return () => {
      setIsDeleted(false);
      setNewComment(false);
    };
  }, [isFocused, newComment, isDeleted]);

  const renderItemIcon = (props) => <Icon {...props} name='trash-2-outline' />;

  const renderItem = ({ item, index }) => {
    <ListItem
      title={`${item.title}`}
      accessoryLeft={(props) => <Icon {...props} name={`${item.icon}`} />}
    />;
  };

  const handleInput = (message) => {
    if (!message) return setDisable(true);
    setComment(message);
    setDisable(false);
    return;
  };

  const handleComment = async () => {
    try {
      Keyboard.dismiss();
      const { uuid } = post;
      const token = await AsyncStorage.getItem("token");
      setIsCreating(true);
      const response = await axios.post(
        `${API_URL}/comments/${uuid}`,
        {
          comment,
        },
        { headers: { token } }
      );
      setIsCreating(false);
      if (response.status === 201) {
        textRef.current.clear();
        setDisable(true);
        setNewComment(true);
        return;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

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
      const response = await axios.delete(`${API_URL}/posts/${post.uuid}`, {
        headers: { token },
      });
      if (response.status === 200) {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.message,
          position: "bottom",
        });
        return navigation.goBack();
      }
      setLoading(false);
      return;
    } catch (error) {
      setLoading(false);
      if (error.response.status === 403) {
        return Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response.data.message,
          position: "top",
        });
      }
      if (error.response.status === 500) {
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

  const handleDeleteComment = async () => {
    panelRef.current.togglePanel();
    try {
      const { commentId } = changeData.data;
      const token = await AsyncStorage.getItem("token");
      setLoading(true);
      const response = await axios.delete(`${API_URL}/comments/${commentId}`, {
        headers: { token },
      });
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
      if (error.response.status === 403)
        return Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response.data.message,
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

  const elapsed = handleDate(new Date(), +new Date(post.createdAt));
  return (
    <Layout style={styles.container}>
      <TopNavigation
        accessoryLeft={BackAction}
        title={() => <Text style={styles.title}>Post</Text>}
      />
      <ScrollView>
        {loading ? (
          <View style={styles.spinner}>
            <Spinner size='medium' />
          </View>
        ) : (
          <Text></Text>
        )}

        <View></View>
        {post && post.user ? (
          <>
            <Card style={styles.posts} key={post.uuid} disabled>
              <View style={styles.postContainer}>
                {post.user.image ? (
                  <View style={styles.postAvatar}>
                    <Avatar size='medium' source={{ uri: post.user.image }} />
                  </View>
                ) : (
                  <View></View>
                )}
                <View style={styles.postUser}>
                  <View style={styles.postHeader}>
                    <Text style={styles.numbers}>{post.user.fullnames}</Text>
                    <Text appearance='hint' style={styles.postUsername}>
                      {`@${post.user.username}`}
                    </Text>
                  </View>
                  <View style={styles.postTime}>
                    <Text appearance='hint' style={{ fontSize: 12 }}>
                      {elapsed
                        ? elapsed
                        : `${new Date(post.createdAt).getDate()}-${new Date(
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
                  {post.postcaption ? <Text>{post.postcaption}</Text> : null}
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
                  <Icons
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
                        setChangeData(false);
                        panelRef.current.togglePanel();
                      }}
                    />
                  </View>
                ) : (
                  <View></View>
                )}
              </View>
            </Card>

            <Comments
              postId={post.uuid}
              newComment={newComment}
              setNewComment={setNewComment}
              ref={panelRef}
              setChangeData={setChangeData}
              handleDeleteComment={handleDeleteComment}
              isDeleted={isDeleted}
              isFocused={isFocused}
            />
          </>
        ) : (
          <View style={styles.noPost}>
            <Text category='h5'>No posts found</Text>
            <Image
              source={require("../assets/app/post.png")}
              style={styles.noPostImage}
            />
          </View>
        )}
      </ScrollView>
      <View style={styles.commentBox}>
        <View style={{ width: "82%" }}>
          <TextInput
            underlineColorAndroid='rgba(0,0,0,0)'
            placeholder='Comment'
            ref={textRef}
            style={styles.input}
            autoCapitalize='none'
            onChangeText={(comment) => handleInput(comment)}
          />
        </View>
        <View>
          <Button
            appearance='ghost'
            size='small'
            onPress={handleComment}
            disabled={disable}
          >
            {!isCreating ? "Post" : <Spinner size='small' />}
          </Button>
        </View>
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
            title: `Edit ${!changeData.change ? "post" : "comment"}`,
            icon: "edit-2-outline",
            onPress: !changeData.change
              ? () => {
                  panelRef.current.togglePanel();
                  navigation.navigate("Edit Post", {
                    image: post && post.user && post.user.image,
                    post: post && post,
                  });
                }
              : () => {
                  panelRef.current.togglePanel();
                  navigation.navigate("Edit Comment", {
                    commentData: changeData && changeData.data,
                  });
                },
          },
          {
            title: `Delete ${!changeData.change ? "post" : "comment"}`,
            icon: "trash-2-outline",
            onPress: !changeData.change
              ? handleDeletePost
              : handleDeleteComment,
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
                    <Icons name={`${item.icon}`} fill='#8f9bb3' height={20} />
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
    </Layout>
  );
};

export default Post;

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
  commentBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: "2%",
    fontSize: 13,
    width: "98%",
    height: 30,
    bottom: 0,
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
    padding: "2%",
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
