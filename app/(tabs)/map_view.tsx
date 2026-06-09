import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  price_min: number;
  price_max: number;
  rating?: number;
  category?: { name: string; color: string };
  image?: string;
}

const customMapStyle = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] }
];

export default function MapViewScreen() {
  const insets = useSafeAreaInsets();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    checkPermissionAndInit();
  }, []);

  async function checkPermissionAndInit() {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      router.replace("/location_permission");
    } else {
      initializeMap();
    }
  }

  async function initializeMap() {
    try {
      setLoading(true);
      
      // 1. Get User Location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Gagal mendapatkan lokasi Anda.");
      } else {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        
        // Animate to user location if map is ready
        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }

      // 2. Fetch Venues
      const { data, error } = await supabase
        .from("places")
        .select(`
          id, name, address, lat, lng, price_min, price_max,
          category:categories(name, color),
          place_images(image_url)
        `);

      if (error) throw error;

      const formattedData: Venue[] = (data || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        price_min: v.price_min,
        price_max: v.price_max,
        rating: 4.5,
        category: Array.isArray(v.category) ? v.category[0] : v.category,
        image: v.place_images?.[0]?.image_url || null
      }));

      setVenues(formattedData);
    } catch (error: any) {
      console.error("Initialization error:", error.message);
    } finally {
      setLoading(false);
    }
  }


  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Map Background */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          customMapStyle={customMapStyle}
          initialRegion={{
            latitude: userLocation?.coords.latitude || -7.25,
            longitude: userLocation?.coords.longitude || 112.75,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {!loading && filteredVenues.map((venue) => {
            const color = venue.category?.color || "#00BFA5";
            return (
              <Marker
                key={venue.id}
                coordinate={{ latitude: venue.lat, longitude: venue.lng }}
                onPress={() => router.push({
                  pathname: "/venue_preview",
                  params: { 
                    venue: JSON.stringify({
                      ...venue,
                      initial: venue.name.charAt(0),
                      color: color,
                      distance: "Dekat kamu", 
                      price: `Rp ${venue.price_min/1000}K–${venue.price_max/1000}K/jam`,
                      status: "Buka",
                      sport: venue.category?.name || "Sport",
                      image: venue.image
                    }) 
                  },
                })}
              >
                <View style={[styles.venueMarker, { backgroundColor: color }]}>
                  <Text style={styles.venueMarkerText}>{venue.name.charAt(0)}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00BFA5" />
          </View>
        )}

        {/* Refresh / My Location Button */}
        <TouchableOpacity style={styles.compassButton} onPress={initializeMap}>
          <Ionicons name="navigate" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { top: Math.max(insets.top + 16, 40) }]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari tempat olahraga..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F0F7" },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(232, 240, 247, 0.5)",
  },
  mapWrapper: {
    flex: 1,
    width: "100%",
    backgroundColor: "#E8F0F7",
    position: "relative",
    overflow: "hidden",
  },
  venueMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  venueMarkerText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  compassButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  searchContainer: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: "#1A1A2E" },
});
