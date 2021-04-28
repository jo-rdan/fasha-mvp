import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Notifications = (props) => {
  return (
    <View style={styles.container}>
      <Text>Notifications will appear here</Text>
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
