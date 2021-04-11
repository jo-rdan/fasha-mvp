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
} from "react-native";
import {
  Layout,
  Spinner,
  Text,
  Card,
  Avatar,
  Icon,
  Divider,
} from "@ui-kitten/components";
import Toast from "react-native-toast-message";
import jwt from "expo-jwt";
import BottomSheet from "react-native-simple-bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FASHA_KEY, API_URL } from "dotenv";

const Comments = React.forwardRef(
  (
    { postId, newComment, setNewComment, setChangeData, isDeleted, isFocused },
    ref
  ) => {
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const [loggedUser, setLoggedUser] = useState({});
    const [disable, setDisable] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
      if (!isFocused) return;

      const fetchToken = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const isUser = jwt.decode(token, FASHA_KEY);
          setLoggedUser(isUser);
          setLoading(true);
          const response = await axios.get(
            `${API_URL}/comments/post/${postId}`,
            {
              headers: { token },
            }
          );
          setLoading(false);
          if (response.status === 200) {
            setNewComment(false);
            setComments(response.data.data);
            return;
          }
        } catch (error) {
          console.log(error);
          setLoading(false);
          if (error.response.status === 404)
            return Toast.show({
              type: "error",
              text1: "Not found",
              text2: error.response.data.error,
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
      fetchToken();

      return () => setNewComment(false);
    }, [isFocused, newComment, isDeleted]);

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

    return (
      <Layout>
        {loading ? (
          <Layout style={{ flex: 1, alignItems: "center", marginVertical: 10 }}>
            <Spinner size='tiny' />
          </Layout>
        ) : (
          <Layout>
            {/* <ScrollView contentContainerStyle={{ flexGrow: 1 }}> */}
            {comments && comments.length > 0 ? (
              comments.map((comment) => {
                const commentDate = handleDate(
                  new Date(),
                  +new Date(comment.createdAt)
                );
                return (
                  <Card style={styles.posts} key={comment.commentId} disabled>
                    <View style={styles.postContainer}>
                      <View style={styles.postAvatar}>
                        <Avatar
                          size='medium'
                          source={{
                            uri:
                              comment.user.image ||
                              "https://res.cloudinary.com/focus-faith-family/image/upload/v1617375424/yww0sl19f03g0rh5vql1.png",
                          }}
                        />
                      </View>
                      <View style={styles.postUser}>
                        <View style={styles.postHeader}>
                          <Text style={styles.numbers}>
                            {comment.user.fullnames}
                          </Text>
                          <Text appearance='hint' style={styles.postUsername}>
                            {`@${comment.user.username}`}
                          </Text>
                        </View>
                        <View style={styles.postTime}>
                          <Text appearance='hint' style={{ fontSize: 12 }}>
                            {commentDate
                              ? commentDate
                              : `${new Date(
                                  comment.createdAt
                                ).getDate()}-${new Date(
                                  comment.createdAt
                                ).getMonth()}-${new Date(
                                  comment.createdAt
                                ).getFullYear()}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.postCaption}>
                      <Text style={{ fontSize: 13 }}>{comment.comment}</Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <TouchableHighlight
                        underlayColor='#F1F1F1'
                        onPress={() => null}
                        style={{ width: "20%", paddingHorizontal: 4 }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Icon
                            name='flag-outline'
                            height={18}
                            width={20}
                            fill='#8f9bb3'
                          />
                          <Text appearance='hint' style={{ fontSize: 9 }}>
                            Report
                          </Text>
                        </View>
                      </TouchableHighlight>
                      {comment && comment.user.uuid === loggedUser.uuid ? (
                        <View style={{ width: "20%" }}>
                          <Icon
                            name='more-horizontal-outline'
                            fill='#8f9bb3'
                            height={18}
                            onPress={() => {
                              setChangeData({
                                data: {
                                  commentId: comment.commentId,
                                  comment: comment.comment,
                                },
                                change: true,
                              });
                              ref.current.togglePanel();
                            }}
                          />
                        </View>
                      ) : (
                        <View></View>
                      )}
                    </View>
                  </Card>
                );
              })
            ) : (
              <Text></Text>
            )}
            {/* </ScrollView> */}
          </Layout>
        )}
      </Layout>
    );
  }
);

export default Comments;

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
