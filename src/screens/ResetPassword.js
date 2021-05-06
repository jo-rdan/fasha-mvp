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
import Toast from "react-native-toast-message";
import axios from "axios";
import { API_URL } from "dotenv";

const ResetPassword = () => {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [resetting, setResetting] = useState(false);
  const [showError, setShowError] = useState({ show: false, error: "" });

  const navigation = useNavigation();
  const route = useRoute();

  const handleResetPassword = async () => {
    // handle password reset here
    try {
      setResetting(true);
      // check if both passwords match
      if (passwords.newPassword !== passwords.confirmPassword) {
        setResetting(false);
        setShowError({ show: true, error: "Passwords do not match" });
        return setTimeout(() => setShowError({ show: false, error: "" }), 3000);
      }
      const response = await axios.patch(
        `${API_URL}/users/reset-password?email=${route.params.email}`,
        { newPassword: passwords.newPassword }
      );
      setResetting(false);
      if (response.status === 200) {
        navigation.navigate("Signin");
        return Toast.show({
          type: "success",
          position: "top",
          text1: "Success",
          text2: "Password reset",
        });
      }
    } catch (error) {
      console.log(error.message);
      setResetting(false);
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
                name='refresh-outline'
                width={50}
                height={50}
                fill='#3366ff'
              />
            </View>
            <Text category='h4'>Reset Password</Text>
            <Text appearance='hint'>You can now create new password</Text>
            <Input
              placeholder='New password'
              secureTextEntry={true}
              autoCapitalize='none'
              onChangeText={(newPassword) =>
                setPasswords({ ...passwords, newPassword })
              }
            />
            <Input
              placeholder='Confirm password'
              secureTextEntry={true}
              status={showError.show ? "danger" : "default"}
              autoCapitalize='none'
              onChangeText={(confirmPassword) =>
                setPasswords({ ...passwords, confirmPassword })
              }
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
              onPress={handleResetPassword}
            >
              {resetting ? (
                <Spinner size='small' status='basic' />
              ) : (
                "Reset password"
              )}
            </Button>
          </View>
        </Card>
      </Modal>
    </View>
  );
};

export default ResetPassword;

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
