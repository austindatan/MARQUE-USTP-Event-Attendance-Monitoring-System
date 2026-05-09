import React from "react";
import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from "react-native";

interface OrgItem {
    name: string;
    college: string;
    logo?: string;
    _id: string;
}

interface OrgChipProps {
    item: OrgItem;
    isSelected: boolean;
    onPress: () => void;
}

export default function OrgChip({ item, isSelected, onPress }: OrgChipProps) {
    const isLogoValid = typeof item.logo === 'string' && item.logo.length > 0;
    const imageSource: ImageSourcePropType = isLogoValid
        ? { uri: item.logo }
        : require('../../assets/images/coffee_and_pastry.png');

    const orange = "#FECB20";
    const lightGray = "#ddd";
    const subtitleColor = "#777";
    const darkBlue = "#0A0F51";

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                borderWidth: 2,
                borderColor: isSelected ? orange : lightGray,
                borderRadius: 50,
                padding: 4,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? orange : "#fff",
            }}
        >
            <Image
                source={imageSource}
                style={{
                    width: 58,
                    height: 58,
                    borderRadius: 50,
                }}
            />
        </TouchableOpacity>
    );
}