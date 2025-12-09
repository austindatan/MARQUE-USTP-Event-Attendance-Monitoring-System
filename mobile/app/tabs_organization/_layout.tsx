//@ts-nocheck
import { Tabs } from "expo-router"; 
import { View, Image } from "react-native";
import { StatusBar } from 'react-native';

export default function TabsLayout() {
  return (
    <>
    <StatusBar 
      style="light"
      backgroundColor="#0A0F51"
    />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0A0F51",
        tabBarStyle: {
          position: 'absolute',
          height: 80,
          paddingBottom: 30,
          paddingTop: 10,
          paddingHorizontal: 90,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          fontFamily: "DMSans-Regular",
        },
      }}
    >
      <Tabs.Screen 
        name="Teams"
        options={{
          title: "Teams",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                borderRadius: 8, 
                width: 50,        
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../assets/images/marque/compass.png")} // replace with your image path
                style={{
                  width: 25,
                  height: 25,
                  tintColor: focused ? "#0A0F51" : "#888", // optional: mimic icon color change
                }}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen 
        name="Officers"
        options={{
          title: "Officers",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                borderRadius: 8, 
                width: 50,        
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../assets/images/marque/compass.png")} // replace with your image path
                style={{
                  width: 25,
                  height: 25,
                  tintColor: focused ? "#0A0F51" : "#888", // optional: mimic icon color change
                }}
              />
            </View>
          ),
        }}
      />

    </Tabs>
    </>
  );
}