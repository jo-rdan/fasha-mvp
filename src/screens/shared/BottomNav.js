import React from "react";
import { StyleSheet } from "react-native";
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
} from "@ui-kitten/components";

const HomeIcon = (props) => <Icon {...props} name='home-outline' />;

const SearchIcon = (props) => <Icon {...props} name='search-outline' />;

const BellIcon = (props) => <Icon {...props} name='bell-outline' />;

const PersonIcon = (props) => <Icon {...props} name='person-outline' />;

const useBottomNavigationState = (initialState = 0) => {
  const [selectedIndex, setSelectedIndex] = React.useState(initialState);
  return { selectedIndex, onSelect: setSelectedIndex };
};

export default BottomNav = () => {
  const topState = useBottomNavigationState();
  const bottomState = useBottomNavigationState();

  return (
    <BottomNavigation style={styles.bottomNavigation} {...bottomState}>
      <BottomNavigationTab icon={HomeIcon} />
      <BottomNavigationTab icon={SearchIcon} />
      <BottomNavigationTab icon={BellIcon} />
      <BottomNavigationTab icon={PersonIcon} />
    </BottomNavigation>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    marginVertical: 0,
  },
});
