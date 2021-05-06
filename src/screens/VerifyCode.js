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

const VerifyCode = (props) => {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showError, setShowError] = useState({ show: false, error: "" });

  const navigation = useNavigation();
  const route = useRoute();

  const handleVerifyCode = async () => {
    // verify code
    try {
      setVerifying(true);
      const response = await axios.post(
        `${API_URL}/users/reset-password/verify`,
        { email: route.params.email, code }
      );
      if (response.status === 200) {
        setVerifying(false);
        return navigation.navigate("Reset Password", {
          email: route.params.email,
        });
      }
    } catch (error) {
      setVerifying(false);
      if (error?.response.status === 404) {
        setShowError({ show: true, error: error.response.data.error });
        return setTimeout(() => setShowError({ show: false, error: "" }), 3000);
      }
      if (error?.response.status === 400) {
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
                name='checkmark-circle-outline'
                width={50}
                height={50}
                fill='#3366ff'
              />
            </View>
            <Text category='h4'>Enter code</Text>
            <Text appearance='hint'>
              Paste the code we sent in the input below to verify
            </Text>
            <Input
              placeholder='Type your code'
              status={showError.show ? "danger" : "default"}
              autoCapitalize='none'
              keyboardType='numeric'
              onChangeText={(code) => setCode(code)}
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
              onPress={handleVerifyCode}
            >
              {verifying ? (
                <Spinner size='small' status='basic' />
              ) : (
                "Verify Code"
              )}
            </Button>
          </View>
        </Card>
      </Modal>
    </View>
  );
};

export default VerifyCode;

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
