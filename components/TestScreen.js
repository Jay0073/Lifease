import React from "react";
import { View } from "react-native";
import HeaderMenu from "./HeaderMenu";

export default function TestScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <HeaderMenu />
    </View>
  );
}