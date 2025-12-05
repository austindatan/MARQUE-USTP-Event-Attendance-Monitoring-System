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
                borderColor: isSelected ? "transparent" : lightGray, 
                borderRadius: 30,
                paddingHorizontal: 10,
                paddingVertical: 8, 
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                width: '48%', 
                backgroundColor: isSelected ? orange : "#fff",
            }}
        >
            <Image
                source={imageSource} 
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 50,
                }}
            />

            <View style={{ flexShrink: 1, justifyContent: 'center' }}>
                <Text 
                    style={{ 
                        fontWeight: "bold", 
                        fontSize: 14, 
                        color: isSelected ? darkBlue : "#000"
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.name}
                </Text>
                <Text 
                    style={{ 
                        fontSize: 11, 
                        color: isSelected ? darkBlue : subtitleColor 
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail" 
                >
                    {item.college}
                </Text>
            </View>
        </TouchableOpacity>
    );
}