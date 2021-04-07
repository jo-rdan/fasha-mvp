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
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import { API_URL, CLOUDINARY_API, FASHA_KEY } from "dotenv";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CloseIcon = (props) => (
  <Icon fill='grey' width={30} height={30} {...props} name='close-outline' />
);

const CameraIcon = (props) => (
  <Icon fill='grey' width={20} height={20} name='camera-outline' />
);

const GalleryIcon = (props) => (
  <Icon fill='grey' width={20} height={20} {...props} name='image-outline' />
);

const EditPost = (props) => {
  const route = useRoute();
  const { image, post } = route.params;
  const [isCreating, setIsCreating] = useState(false);
  const [changeColor, setChangeColor] = useState(false);
  const [newPost, setNewPost] = useState(post);
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(newPost ? false : true);
  const [clearImage, setClearImage] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    console.log("hhahaha", newPost);
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
    return navigation.goBack();
  };

  const askForPermission = async () => {
    const permissionResult = await Permissions.askAsync(Permissions.CAMERA);
    if (permissionResult.status !== "granted") {
      Alert.alert("no permissions to access camera!", [{ text: "ok" }]);
      return false;
    }
    return true;
  };
  const handlePostCaption = (postcaption) => {
    setNewPost({ ...post, postcaption });
    setDisable(false);
    return;
  };

  const handleClearImage = () => {
    setClearImage(true);
    setNewPost({ ...newPost, postmedia: "" });
    if (!newPost.postcaption) return setDisable(true);
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
          setClearImage(false);
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
          setDisable(false);
          setNewPost({ ...post, postmedia: res.secure_url });
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log(error.message);
      return error;
    }
  };

  const handleEditPost = async () => {
    Keyboard.dismiss();
    try {
      const { postcaption, postmedia } = newPost;
      const token = await AsyncStorage.getItem("token");
      setIsCreating(true);
      const res = await axios.patch(
        `${API_URL}/posts/${post.uuid}/edit`,
        {
          postcaption,
          postmedia,
        },
        { headers: { token } }
      );
      setIsCreating(false);
      console.log("res", res.data.data);
      if (res.status === 200) {
        setChangeColor(true);
        onHide();
        return;
      }
    } catch (error) {
      console.log("error", error.response);
    }
  };

  return (
    <Layout style={styles.container}>
      <Modal
        visible={true}
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
              <Text category='h5'>Edit Post</Text>
              <Layout style={styles.headerIcons}>
                {/* <CheckIcon  /> */}
                <Button
                  size='tiny'
                  style={{ borderRadius: 50, paddingHorizontal: 20 }}
                  disabled={disable}
                  onPress={handleEditPost}
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
                  defaultValue={post.postcaption || ""}
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
                <Layout style={{ display: !clearImage ? "flex" : "none" }}>
                  {!loading && newPost && newPost.postmedia ? (
                    <View>
                      <View style={styles.clear}>
                        <Icon
                          name='minus-circle'
                          fill='rgba(191,191,191,0.9)'
                          height={18}
                          onPress={handleClearImage}
                        />
                      </View>
                      <Image
                        source={{ uri: newPost.postmedia }}
                        style={{
                          width: 100,
                          height: 100,
                        }}
                      />
                    </View>
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

export default EditPost;

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
  clear: {
    top: "10%",
    right: "8%",
    zIndex: 1,
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
