import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

const Home = () => {
  return (
    <View style={styles.container}>
      {/* Heaader */}
      <View style={styles.headerContainer}>
        <Text style={styles.h1}>Sport Place Finder</Text>
        <TextInput style={styles.searchBar} placeholder="Cari nama tempat...">
          George Misael
        </TextInput>
        <View style={styles.menuContainer}>
          {/* Tombol Kategori */}
          <TouchableOpacity style={styles.buttonTopMenu}>
            <Ionicons name="grid-outline" size={16} style={styles.iconStyle} />
            <Text style={styles.textMenu}>Kategori</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonTopMenu}>
            <Ionicons
              name="pricetag-outline"
              size={16}
              style={styles.iconStyle}
            />
            <Text style={styles.textMenu}>Harga</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonTopMenu}>
            <Ionicons name="star-outline" size={16} style={styles.iconStyle} />
            <Text style={styles.textMenu}>Rating</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main */}
      <View style={styles.mainContainer}>
        <View style={styles.cardItem}>
          <Text>Hello Skibidi</Text>
        </View>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },

  // Header
  headerContainer: {
    width: 395,
    marginTop: 40,
    paddingHorizontal: 15,
    // backgroundColor: "yellow",
  },

  h1: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },

  searchBar: {
    borderRadius: 8,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#9b9b9b",
  },

  menuContainer: {
    flexDirection: "row",
    marginTop: 10,
    display: "row",
    gap: 20,
  },

  buttonTopMenu: {
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.3,
    alignItems: "center",
    width: 110,
    color: "white",
    flexDirection: "row",
    justifyContent: "center",
  },

  iconStyle: {
    color: "#374151",
    marginLeft: -4,
    marginRight: 6,
  },

  textMenu: {
    color: "#374151",
    fontWeight: "400",
    fontSize: 14,
  },

  // MainContainer
  mainContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  cardItem: {
    // backgroundColor: "yellow",
    borderWidth: 0.4,
    borderRadius: 8,
    height: 117.33,
    marginBottom: 20,
  },
});
