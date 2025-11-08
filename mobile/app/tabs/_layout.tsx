import { Tabs } from "expo-router"; 
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function TabsLayout() {
  return (
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
        name="Events"
        options={{
          title: "Events",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                borderRadius: 8, 
                width: 50,        
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="calendar" color={focused ? "#0A0F51" : color} size={25} />
            </View>
          ),
        }}
      />

      <Tabs.Screen 
        name="Explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                
                borderRadius: 8, 
                width: 40,        
                height: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="compass" color={focused ? "#0A0F51" : color} size={25} />
            </View>
          ),
        }}
      />

      <Tabs.Screen 
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                
                borderRadius: 8, 
                width: 40,        
                height: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome name="user" color={focused ? "#0A0F51" : color} size={25} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
