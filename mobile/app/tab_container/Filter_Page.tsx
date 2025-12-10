// @ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, } from "react-native";
import { useRouter } from "expo-router";
import OrgChip from "../components/Org_Chip";
import { BASE_URL } from "../../config";
import styles from "../styles/component_filter_page";

const mapOrgData = (data) =>
  data.map((org) => ({
    _id: org._id,
    name: org.org_name,
    logo: org.pfp,
    college: org.description,
  }));

export default function Filter_Page() {
  const router = useRouter();
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedMothers, setSelectedMothers] = useState([]);
  const [units, setUnits] = useState([]);
  const [mothers, setMothers] = useState([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [isLoadingMothers, setIsLoadingMothers] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUnits();
    fetchMothers();
  }, []);

  const fetchUnits = async () => {
    setIsLoadingUnits(true);
    try {
      const res = await fetch(`${BASE_URL}/api/organizations/by-type/units`);
      const data = await res.json();
      setUnits(Array.isArray(data) ? mapOrgData(data) : []);
    } catch (err) {
      console.error("Error fetching units:", err);
      setUnits([]);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const fetchMothers = async () => {
    setIsLoadingMothers(true);
    try {
      const res = await fetch(`${BASE_URL}/api/organizations/by-type/mothers`);
      const data = await res.json();
      setMothers(Array.isArray(data) ? mapOrgData(data) : []);
    } catch (err) {
      console.error("Error fetching mothers:", err);
      setMothers([]);
    } finally {
      setIsLoadingMothers(false);
    }
  };

  const toggleUnit = (id) =>
    setSelectedUnits((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );

  const toggleMother = (id) =>
    setSelectedMothers((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );

  const applyFilter = () => {
    const allSelectedIds = [...selectedUnits, ...selectedMothers];

    router.replace({
      pathname: "../tab_container/Search_Page",
      params: {
        filterIds: JSON.stringify(allSelectedIds)
      },
    });
  };

  const filteredUnits = units.filter((u) =>
    u?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMothers = mothers.filter((m) =>
    m?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Unit Organizations</Text>
        {isLoadingUnits ? (
          <ActivityIndicator size="large" color="#222762" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.chipWrappingContainer}>
            {filteredUnits.map((unit) => (
              <OrgChip
                key={unit._id}
                item={unit}
                isSelected={selectedUnits.includes(unit._id)}
                onPress={() => toggleUnit(unit._id)}
              />
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Mother Organizations</Text>
        {isLoadingMothers ? (
          <ActivityIndicator size="large" color="#222762" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.chipWrappingContainer}>
            {filteredMothers.map((mother) => (
              <OrgChip
                key={mother._id}
                item={mother}
                isSelected={selectedMothers.includes(mother._id)}
                onPress={() => toggleMother(mother._id)}
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