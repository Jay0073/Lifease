import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PopupMenu } from "./PopupMenu";
import { useNavigation } from "@react-navigation/native";

export default function CustomHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  return (
    <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingRight: 16 }}>
      <TouchableOpacity onPress={() => setMenuVisible(true)}>
        <Ionicons name="menu-outline" size={28} color="#000" />
      </TouchableOpacity>
      <PopupMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />
    </View>
  );
}
