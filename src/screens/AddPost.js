import React, { useState, useEffect } from "react";
import { Image, StyleSheet, TextInput, View, Keyboard } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Icon,
  Input,
  Spinner,
  Layout,
  Modal,
  Text,
} from "@ui-kitten/components";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import Toast from "react-native-toast-message";

import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import { API_URL, CLOUDINARY_API, FASHA_KEY } from "dotenv";
import axios from "axios";
import jwt from "expo-jwt";

import AsyncStorage from "@react-native-async-storage/async-storage";
import connectSocket from "../helpers/socketConnection";

const CloseIcon = (props) => (
  <Icon fill='grey' width={30} height={30} {...props} name='close-outline' />
);

const CameraIcon = (props) => (
  <Icon fill='grey' width={20} height={20} name='camera-outline' />
);

const GalleryIcon = (props) => (
  <Icon fill='grey' width={20} height={20} {...props} name='image-outline' />
);

const AddPost = ({ visible, setVisible, image }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [changeColor, setChangeColor] = useState(false);
  const [post, setPost] = useState({
    postCaption: "",
    postImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(true);
  const [socket, setSocket] = useState();
  const navigation = useNavigation();
  const route = useRoute();

  // const { image } = route.params;

  useEffect(() => {
    console.log(disable);
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem("token");
      const socketCon = connectSocket(token);
      setSocket(socketCon);
    };
    fetchToken();
  }, []);

  // const MusicIcon = (props) => (
  //   <Icon
  //     fill='gray'
  //     width={20}
  //     height={20}
  //     {...props}
  //     name='headphones-outline'
  //   />
  // );

  const CheckIcon = (props) =>
    isCreating ? (
      <Spinner size='small' />
    ) : (
      <Icon
        {...props}
        width={20}
        height={20}
        name='checkmark-circle-2-outline'
      />
    );

  const onHide = () => {
    setDisable(true);
    setPost({ postCaption: "", postImage: "" });
    return setVisible(false);
  };

  const askForPermission = async () => {
    const permissionResult = await Permissions.askAsync(Permissions.CAMERA);
    if (permissionResult.status !== "granted") {
      Alert.alert("no permissions to access camera!", [{ text: "ok" }]);
      return false;
    }
    return true;
  };

  const handlePostCaption = (postCaption) => {
    if (postCaption === "") return setDisable(true);
    setPost({ ...post, postCaption });
    setDisable(false);
    return;
  };

  const handlePostImage = async () => {
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
          console.log(res);
          setDisable(false);
          setPost({ ...post, postImage: res.secure_url });
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log(error.message);
      return error;
    }
  };

  const handleAddPost = async () => {
    Keyboard.dismiss();
    try {
      const token = await AsyncStorage.getItem("token");
      const { postCaption, postImage } = post;
      const user = jwt.decode(token, FASHA_KEY);
      setIsCreating(true);
      socket.emit("new post", {
        post: { postCaption, postMedia: postImage },
        user,
      });
      setIsCreating(false);
      onHide();
    } catch (error) {
      setIsCreating(false);
      console.log(error);
      if (error.response.status === 404)
        return Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.message,
          position: "bottom",
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
      <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={onHide}
        style={styles.modal}
      >
        <Card
          disabled={true}
          style={{
            minHeight: 250,
          }}
        >
          <Layout style={styles.card}>
            <Layout style={styles.cardHeader}>
              <Text category='h5'>Add Post</Text>
              <Layout style={styles.headerIcons}>
                {/* <CheckIcon  /> */}
                <Button
                  size='tiny'
                  style={{ borderRadius: 50, paddingHorizontal: 20 }}
                  disabled={disable}
                  onPress={handleAddPost}
                >
                  {isCreating ? (
                    <View style={{ width: "30%" }}>
                      <Spinner size='tiny' status='basic' />
                    </View>
                  ) : (
                    "Post"
                  )}
                </Button>
                <CloseIcon onPress={onHide} />
              </Layout>
            </Layout>
            <Layout style={styles.postInput}>
              <Layout>
                <Avatar source={{ uri: image }} />
              </Layout>
              <Layout style={{ width: "80%" }}>
                {/* <Layout> */}
                <TextInput
                  underlineColorAndroid='transparent'
                  placeholder='Tell me anything'
                  autoCorrect={false}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.input}
                  onChangeText={(postCaption) => handlePostCaption(postCaption)}
                />
                {/* </Layout> */}
                <Layout style={styles.iconActions}>
                  <Layout>
                    <CameraIcon />
                  </Layout>
                  <Layout>
                    <GalleryIcon onPress={handlePostImage} />
                  </Layout>
                  {/* <Layout>
                    <MusicIcon />
                  </Layout> */}
                </Layout>
                <Layout>
                  {post && post.postImage ? (
                    <Image
                      source={{ uri: post.postImage }}
                      style={{ width: 100, height: 100 }}
                    />
                  ) : (
                    <Layout>
                      {loading ? <Spinner size='small' /> : <Layout></Layout>}
                    </Layout>
                  )}
                </Layout>
              </Layout>
            </Layout>
          </Layout>
        </Card>
      </Modal>
    </Layout>
  );
};

export default AddPost;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  card: {
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    padding: 10,
    margin: 5,
    width: "100%",
    overflow: "scroll",
  },
  headerIcons: {
    width: "40%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconActions: {
    flex: 1,
    width: "25%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  modal: {
    width: "98%",
    // height: 300,
    // justifyContent: "space-between",
  },
  postInput: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
  },
});
