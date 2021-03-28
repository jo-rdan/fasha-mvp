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

const Profile = ({ onLogout, onDelete, loading, setLoading }) => {
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({});
  const [isDeleted, setIsDeleted] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();
  const panelRef = useRef(null);

  let postId;

  const BackIcon = (props) => <Icon {...props} name='arrow-back' />;

  const BackAction = () => <TopNavigationAction icon={BackIcon} />;

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
    const fetchToken = async () => {
      console.log("doooooo");
      try {
        if (!isFocused) return;
        const token = await AsyncStorage.getItem("token");
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/user/profile`, {
          headers: { token },
        });
        setLoading(false);
        setUser(response.data.data);
        return;
      } catch (error) {
        console.log("<====", error.response.data);
      }
    };
    fetchToken();

    return () => setIsDeleted(false);
  }, [isFocused, isDeleted]);

  // const onLogout = async () => {
  //   setVisible(false);
  //   setLoading(true);
  //   await AsyncStorage.removeItem("token");
  //   setLoading(false);
  //   return;
  // };
  const onHide = () => {
    setShowModal(false);
    setRefresh(true);
  };

  const renderItemIcon = (props) => <Icon {...props} name='trash-2-outline' />;

  const renderItem = ({ item, index }) => {
    <ListItem
      title={`${item.title}`}
      accessoryLeft={(props) => <Icon {...props} name={`${item.icon}`} />}
    />;
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
      const response = await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { token },
      });
      if (response.status === 200) {
        setLoading(false);
        setIsDeleted(true);
        return Alert.alert("Success", response.data.message, [
          {
            text: "OK",
            onPress: () => setIsDeleted(false),
          },
        ]);
      }
      setLoading(false);
      return;
    } catch (error) {
      return error.response.data;
    }
  };

  const renderRightActions = () => (
    <React.Fragment>
      <TopNavigationAction
        icon={AddIcon}
        onPress={() =>
          navigation.navigate("Add Post", { image: user && user.image })
        }
      />
      <OverflowMenu
        anchor={SettingsAction}
        visible={visible}
        placement='bottom end'
        onBackdropPress={() => setVisible(false)}
      >
        <MenuItem
          title='Edit Profile'
          onPress={() => {
            setVisible(false);
            navigation.navigate("Edit Profile", {
              ...user,
            });
          }}
        />
        <MenuItem title='Logout' onPress={() => onLogout(setVisible)} />
        <MenuItem
          title={(props) => (
            <Text
              {...props}
              style={{
                marginLeft: 8,
                marginRight: 8,
                width: "90%",
                fontSize: 13,
              }}
              status='danger'
            >
              Delete account
            </Text>
          )}
          // style={{ color: "red" }}
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
    </React.Fragment>
  );

  return (
    <Layout style={styles.container}>
      <TopNavigation
        accessoryLeft={BackAction}
        title={() => <Text style={styles.title}>{user.fullnames}</Text>}
        subtitle={user && user.username ? `@${user.username}` : ""}
        accessoryRight={renderRightActions}
      />

      {/* <AddPost
        visible={showModal}
        onHide={onHide}
        image={!user ? "" : user.image}
      /> */}
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
              <Image source={{ uri: user.image }} style={styles.avatar} />
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
            <Text style={styles.numbers}>
              {user && user.posts ? user.posts.length : 0}
            </Text>
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

        {user && user.posts && user.posts.length > 0 ? (
          user.posts.length > 0 &&
          user.posts.map((post) => {
            const elapsed = handleDate(new Date(), +new Date(post.createdAt));
            return (
              <Card style={styles.posts} key={post.uuid}>
                <View style={styles.postContainer}>
                  <View style={styles.postAvatar}>
                    <Avatar size='medium' source={{ uri: user.image }} />
                  </View>
                  <View style={styles.postUser}>
                    <View style={styles.postHeader}>
                      <Text style={styles.numbers}>{user.fullnames}</Text>
                      <Text appearance='hint' style={styles.postUsername}>
                        {`@${user.username}`}
                      </Text>
                    </View>
                    <View style={styles.postTime}>
                      <Text appearance='hint' style={{ fontSize: 12 }}>
                        {/* {post.createdAt} */}
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
                  <View style={{ width: "20%" }}>
                    <Icons
                      name='more-horizontal-outline'
                      fill='#8f9bb3'
                      height={18}
                      onPress={() => {
                        postId = post.uuid;
                        panelRef.current.togglePanel();
                      }}
                    />
                  </View>
                </View>
                {/* <View>
                  <TextInput
                    underlineColorAndroid='transparent'
                    placeholder='Comment'
                    style={styles.input}
                    autoCompleteType='email'
                    autoCapitalize='none'
                  />
                </View> */}
              </Card>
            );
          })
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
          { title: "Edit post", icon: "edit-2-outline" },
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
