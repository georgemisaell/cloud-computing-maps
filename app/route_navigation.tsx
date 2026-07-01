import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const MAP_HEIGHT = height * 0.62;

export default function RouteNavigationScreen() {
  const params = useLocalSearchParams();
  const venue = params.venue ? JSON.parse(params.venue as string) : {};
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const destLat = venue.lat ?? venue.latitude ?? -7.2575;
  const destLng = venue.lng ?? venue.longitude ?? 112.7521;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  useEffect(() => {
    if (location && destLat && destLng && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: location.coords.latitude, longitude: location.coords.longitude },
          { latitude: destLat, longitude: destLng },
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [location, destLat, destLng]);

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleCompassPress = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" translucent={false} />

      {/* Map Area */}
      <View style={[styles.mapContainer, { height: MAP_HEIGHT }]}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={{
            latitude: destLat,
            longitude: destLng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {location && (
            <Polyline
              coordinates={[
                { latitude: location.coords.latitude, longitude: location.coords.longitude },
                { latitude: destLat, longitude: destLng },
              ]}
              strokeColor="#2196F3"
              strokeWidth={4}
              lineDashPattern={[1]}
            />
          )}

          <Marker coordinate={{ latitude: destLat, longitude: destLng }}>
            <View style={styles.destWrapper}>
              <View style={styles.destPin}>
                <Ionicons name="location" size={20} color="#fff" />
              </View>
              <View style={styles.destTail} />
            </View>
          </Marker>
        </MapView>

        {/* Compass */}
        <TouchableOpacity style={styles.compassButton} onPress={handleCompassPress}>
          <Ionicons name="navigate" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        <View style={styles.etaRow}>
          <View>
            <Text style={styles.etaTime}>{venue.name ?? "Tujuan"}</Text>
            <Text style={styles.etaDetail}>
              {venue.distance ? `${venue.distance} • ` : ""}Rute langsung
            </Text>
          </View>
          <TouchableOpacity style={styles.compassBtn} onPress={handleCompassPress}>
            <Ionicons name="navigate-outline" size={22} color="#2196F3" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.85} style={styles.mapsButton}>
          <Text style={styles.mapsButtonText}>Buka Google Maps</Text>
          <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <Text style={styles.hint}>Akan membuka aplikasi peta eksternal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF4EE" },

  // Map
  mapContainer: {
    width: "100%",
    backgroundColor: "#EEF4EE",
    position: "relative",
    overflow: "hidden",
  },





  destWrapper: {
    alignItems: "center",
  },
  destPin: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#F59E0B",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  destTail: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 12,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#F59E0B",
    marginTop: -1,
  },
  destLabel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    marginTop: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    minWidth: 100,
    alignItems: "center",
  },
  destLabelText: { fontSize: 12, fontWeight: "600", color: "#1A1A2E" },

  compassButton: {
    position: "absolute", bottom: 16, right: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },

  // Bottom Sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 8,
    justifyContent: "space-between",
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center", marginBottom: 16,
  },
  etaRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  etaTime: { fontSize: 36, fontWeight: "800", color: "#1A1A2E", marginBottom: 2 },
  etaDetail: { fontSize: 14, color: "#6B7280" },
  compassBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#EFF6FF",
    alignItems: "center", justifyContent: "center",
  },
  mapsButton: {
    height: 56, borderRadius: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#00BFA5",
    marginBottom: 8,
    shadowColor: "#00BFA5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  mapsButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  hint: { textAlign: "center", fontSize: 12, color: "#9CA3AF" },
});