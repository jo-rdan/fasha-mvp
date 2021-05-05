import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  Button,
  Card,
  Input,
  Modal,
  Text,
  Icon,
  Spinner,
} from "@ui-kitten/components";
import axios from "axios";
import { API_URL } from "dotenv";
import Toast from "react-native-toast-message";

const ForgotPassword = (props) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [showError, setShowError] = useState({ show: false, error: "" });
  const navigation = useNavigation();

  const handleSendEmail = async () => {
    // send email here

    try {
      setSending(true);
      const response = await axios.post(
        `${API_URL}/users/reset-password/request`,
        { email }
      );
      if (response.status === 200) {
        setSending(false);
        return navigation.navigate("Verify", { email });
      }
    } catch (error) {
      setSending(false);
      if (error?.response.status === 404) {
        setShowError({ show: true, error: error.response.data.error });
        return setTimeout(() => setShowError({ show: false, error: "" }), 3000);
      }
      if (error?.response.status === 500) {
        setShowError({ show: true, error: error.response.data.error });
        return setTimeout(() => setShowError({ show: false, error: "" }), 3000);
      }

      setShowError({ show: true, error: error.message });
      return setTimeout(() => setShowError({ show: false, error: "" }), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={true}
        backdropStyle={styles.backdrop}
        style={styles.modal}
        onBackdropPress={() => navigation.navigate("Signin")}
      >
        <Card disabled={true} style={styles.card}>
          <View style={styles.cardBody}>
            <View>
              <Icon
                name='email-outline'
                width={50}
                height={50}
                fill='#3366ff'
              />
            </View>
            <Text category='h4'>Enter your email</Text>
            <Text appearance='hint'>
              We will send a message to your mailbox with a code to verify your
              account
            </Text>
            <Input
              placeholder='Enter email'
              status={showError.show ? "danger" : "default"}
              keyboardType='email-address'
              autoCapitalize='none'
              onChangeText={(email) => setEmail(email)}
            />
            {showError.show ? (
              <Text style={{ fontSize: 12, marginVertical: 5 }} status='danger'>
                {showError.error}
              </Text>
            ) : (
              <View></View>
            )}
            <Button
              style={{ borderRadius: 30, width: "100%" }}
              onPress={handleSendEmail}
            >
              {sending ? <Spinner size='small' status='basic' /> : "Send Code"}
            </Button>
          </View>
        </Card>
      </Modal>
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  card: {
    minHeight: 270,
    elevation: 30,
  },
  cardBody: {
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  input: {
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    padding: 10,
    margin: 5,
    width: "98%",
  },
  modal: {
    width: "95%",
  },
});
