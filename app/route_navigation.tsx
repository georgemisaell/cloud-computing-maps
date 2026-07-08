import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import {
  Animated,
  Dimensions,
  Linking,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function RouteNavigationScreen() {
  const params = useLocalSearchParams();
  const venue = params.venue ? JSON.parse(params.venue as string) : {};
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeCoords, setRouteCoords] = useState<{latitude: number, longitude: number}[]>([]);

  const destLat = venue.lat ?? venue.latitude ?? -7.2575;
  const destLng = venue.lng ?? venue.longitude ?? 112.7521;

  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (e, gestureState) => {
        let newY = gestureState.dy;
        if (newY < -100) newY = -100;
        if (newY > 200) newY = 200;
        panY.setValue(newY);
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 50) {
          Animated.spring(panY, {
            toValue: 150,
            useNativeDriver: true,
          }).start();
        } else if (gestureState.dy < -50) {
          Animated.spring(panY, {
            toValue: -100,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
    if (location && destLat && destLng) {
      const getRoute = async () => {
        const startLat = location.coords.latitude;
        const startLng = location.coords.longitude;
        try {
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((coord: any) => ({
              latitude: coord[1],
              longitude: coord[0],
            }));
            setRouteCoords(coords);
          } else {
             setRouteCoords([{ latitude: startLat, longitude: startLng }, { latitude: destLat, longitude: destLng }]);
          }
        } catch (error) {
          console.error("Error fetching route:", error);
          setRouteCoords([{ latitude: startLat, longitude: startLng }, { latitude: destLat, longitude: destLng }]);
        }
      };
      getRoute();
    }
  }, [location, destLat, destLng]);

  useEffect(() => {
    if (routeCoords.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(
        routeCoords,
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [routeCoords]);

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
      <View style={styles.mapContainer}>
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
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#2196F3"
              strokeWidth={5}
            />
          )}

          <Marker coordinate={{ latitude: destLat, longitude: destLng }}>
            <View style={styles.destWrapper}>
              <Ionicons name="pin" size={48} color="#EF4444" style={styles.markerShadow} />
            </View>
          </Marker>
        </MapView>

        {/* Compass */}
        <TouchableOpacity style={styles.compassButton} onPress={handleCompassPress}>
          <Ionicons name="navigate" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet, 
          { paddingBottom: Math.max(insets.bottom + 12, 24), transform: [{ translateY: panY }] }
        ]}
      >
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF4EE" },

  // Map
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#EEF4EE",
  },





  destWrapper: {
    alignItems: "center",
  },
  markerShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 8,
  },
  handleContainer: {
    width: "100%",
    paddingVertical: 10,
    alignItems: "center",
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E5E7EB",
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