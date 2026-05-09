// @ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import OrgChip from "../components/Org_Chip";
import { BASE_URL } from "../../config";
import styles from "../styles/component_filter_page";
import bookmarkStyles from "../styles/components_bookmark";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header_Normal";

const mapOrgData = (data) =>
  data.map((org) => ({
    _id: org._id,
    name: org.org_name,
    logo: org.pfp,
    college: org.description,
  }));

export default function Filter_Page() {
  const router = useRouter();
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/exploreorgs/all`);
      const data = await res.json();
      setOrgs(Array.isArray(data) ? mapOrgData(data) : []);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setOrgs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrg = (id) =>
    setSelectedOrgs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );

  const applyFilter = () => {
    router.replace({
      pathname: "../tab_container/Search_Page",
      params: {
        filterIds: JSON.stringify(selectedOrgs)
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>

        {/* Back arrow + "Filter" title */}
        <TouchableOpacity style={[bookmarkStyles.backBtn, { marginTop: 16 }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#0A0F51" />
          <Text style={bookmarkStyles.backText}>Filter</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Organizations</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#222762" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.chipWrappingContainer}>
            {orgs.map((org) => (
              <OrgChip
                key={org._id}
                item={org}
                isSelected={selectedOrgs.includes(org._id)}
                onPress={() => toggleOrg(org._id)}
              />
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
          <Text style={styles.applyButtonText}>Apply Filter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}