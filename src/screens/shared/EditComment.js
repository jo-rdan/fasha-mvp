import React, { useState } from "react";
import { Keyboard, StyleSheet, TextInput } from "react-native";
import {
  Button,
  Card,
  Layout,
  Icon,
  Text,
  Modal,
  Spinner,
} from "@ui-kitten/components";
import Toast from "react-native-toast-message";

import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "dotenv";

const CloseIcon = (props) => (
  <Icon fill='grey' width={30} height={30} {...props} name='close-outline' />
);

const EditComment = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { commentData } = route.params;
  const [newComment, setNewComment] = useState(commentData.comment);
  const [disable, setDisable] = useState(newComment ? false : true);
  const [isCreating, setIsCreating] = useState(false);

  const handleInput = (message) => {
    if (!message) return setDisable(true);
    setDisable(false);
    setNewComment(message);
  };

  const handleEdit = async () => {
    Keyboard.dismiss();
    try {
      const { commentId } = commentData;
      const token = await AsyncStorage.getItem("token");
      setIsCreating(true);
      const response = await axios.patch(
        `${API_URL}/comments/${commentId}`,
        { comment: newComment },
        { headers: { token } }
      );
      setIsCreating(false);
      console.log(response.data.data);
      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.message,
          position: "bottom",
        });
        return navigation.goBack();
      }
    } catch (error) {
      return error;
    }
  };

  return (
    <Layout style={styles.container} level='1'>
      <Modal
        visible={true}
        backdropStyle={styles.backdrop}
        style={{ width: "90%" }}
      >
        <Card disabled={true}>
          <Layout style={styles.card}>
            <Layout style={styles.header}>
              <Layout>
                <Text category='h6'>Edit Comment</Text>
              </Layout>
              <Layout style={styles.buttons}>
                <Layout>
                  <Button
                    size='tiny'
                    style={styles.btn}
                    onPress={handleEdit}
                    disabled={disable}
                  >
                    {isCreating ? (
                      <Spinner size='tiny' status='basic' />
                    ) : (
                      "Edit"
                    )}
                  </Button>
                </Layout>
                <Layout>
                  <CloseIcon onPress={() => navigation.goBack()} />
                </Layout>
              </Layout>
            </Layout>
            <Layout>
              <TextInput
                underlineColorAndroid='transparent'
                placeholder='Tell me anything'
                defaultValue={commentData.comment}
                autoCorrect={false}
                style={styles.input}
                onChangeText={(comment) => handleInput(comment)}
              />
            </Layout>
          </Layout>
        </Card>
      </Modal>
    </Layout>
  );
};

export default EditComment;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  btn: {
    borderRadius: 50,
    paddingHorizontal: 20,
  },
  buttons: {
    width: "40%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    justifyContent: "space-between",
    height: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    alignSelf: "center",
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    padding: 10,
    margin: 5,
    width: "100%",
    overflow: "scroll",
  },
});
