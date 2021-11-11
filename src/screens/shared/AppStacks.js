import React from "react";
import { View } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { Host } from "react-native-portalize";
import {
  ApplicationProvider,
  IconRegistry,
  Button,
  Icon,
  Spinner,
  Toggle,
  BottomNavigation,
  BottomNavigationTab,
} from "@ui-kitten/components";
import Post from "../Post";
import Homepage from "../Homepage";
import Profile from "../Profile";
import EditProfile from "../EditProfile";
import AddPost from "../AddPost";
import Search from "../Search";
import Notifications from "../Notifications";

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const HomeTabs = ({ onLogout, onDelete, loading, setLoading }) => {
  return (
    <Host>
      <Tab.Navigator
        activeColor='#3366ff'
        barStyle={{ backgroundColor: "#ffff", elevation: 2 }}
      >
        <Tab.Screen
          name='Feed'
          component={Homepage}
          options={{
            tabBarLabel: "Feed",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "home" : "home-outline"}
                fill={color}
                height={32}
                width={20}
              />
            ),
            style: { borderTopWidth: 3, borderTopColor: "indigo" },
          }}
        />
        {/* <Tab.Screen
          name='Search'
          component={Search}
          options={{
            tabBarLabel: "Search",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Icon name='search' fill={color} height={32} width={20} />
            ),
          }}
        /> */}
        <Tab.Screen
          name='Notifications'
          component={Notifications}
          options={{
            tabBarLabel: "Notifications",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "bell" : "bell-outline"}
                fill={color}
                height={32}
                width={20}
              />
            ),
            tabBarBadge: true,
          }}
        />
        <Tab.Screen
          name='Profile'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "person" : "person-outline"}
                fill={color}
                height={32}
                width={20}
              />
            ),
          }}
        >
          {(props) => (
            <Profile
              {...props}
              onLogout={onLogout}
              onDelete={onDelete}
              loading={loading}
              setLoading={setLoading}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </Host>
  );
};

export default HomeTabs;
