// @ts-nocheck
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header_Normal";
import styles from "../styles/components_bookmark";
import { useRouter } from "expo-router";
import BookmarkCard from "../components/Card_Bookmark";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config";

const Bookmark = () => {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const student_number = await AsyncStorage.getItem("student_number");
    if (!student_number) return;

    try {
      const res = await axios.get(`${BASE_URL}/api/bookmarks/${student_number}`);
      setBookmarks(res.data);
    } catch (err) {
      console.log("❌ Error loading bookmarks:", err);
    }
  };

  const removeBookmark = async (event_id) => {
    const student_number = await AsyncStorage.getItem("student_number");

    try {
      await axios.delete(
        `${BASE_URL}/api/bookmarks/${student_number}/${event_id}`
      );
      loadBookmarks(); // Refresh list
    } catch (err) {
      console.log("❌ Error removing bookmark:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 20, paddingTop: 20 }}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()} // 3. Use router.back() instead of navigation.goBack()
        >
          <Ionicons name="arrow-back" size={18} color="#0A0F51" />
          <Text style={styles.backText}>Bookmarks</Text>
        </TouchableOpacity>

        {bookmarks.map((b) => (
          <BookmarkCard
            key={b._id}
            id={b.event_id._id}
            title={b.event_id.event_name}
            image={{ uri: b.event_id.event_image }}
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            organization={b.event_id.organization_id?.name || "Organization"}
            dateDay={
              new Date(b.event_id.event_date).getDate().toString()
            }
            dateMonth={new Date(b.event_id.event_date).toLocaleString(
              "en-US",
              { month: "short" }
            )}
            orgDate={new Date(b.event_id.event_date).toDateString()}
            onPress={() => console.log("Open event", b.event_id._id)}
            onRemove={() => removeBookmark(b.event_id._id)} // <-- parent call
          />
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

export default Bookmark;
