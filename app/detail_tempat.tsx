// Lokasi file ini: letakkan di folder yang sama dengan index (screen utama)
// Contoh: app/VenueDetailScreen.tsx  atau  screens/VenueDetailScreen.tsx
// Navigasi back: navigation.navigate('index') — sesuaikan nama route jika berbeda

import React, { useState } from 'react';
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
  SafeAreaView, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';

let Svg: any, Path: any, Circle: any, Rect: any, Line: any;
try {
  const svg = require('react-native-svg');
  Svg = svg.Svg; Path = svg.Path;
  Circle = svg.Circle; Rect = svg.Rect; Line = svg.Line;
} catch {}

type Navigation = {
  goBack: () => void;
  navigate: (screen: string) => void;
};
type Review = {
  id: string; name: string; avatar: string;
  rating: number; timeAgo: string; comment: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;



const formatRupiah = (n: number) =>
  'Rp ' + n.toLocaleString('id-ID').replace(/,/g, '.');

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconChevronLeft({ size = 20, color = '#fff' }) {
  if (!Svg) return <Text style={{ color, fontSize: size + 4 }}>‹</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Heart icon: outline putih default, solid merah kalau favorited — persis seperti desain
function IconHeart({ size = 20, filled = false }) {
  const strokeColor = filled ? '#EF4444' : '#fff';
  const fillColor   = filled ? '#EF4444' : 'none';
  if (!Svg) return <Text style={{ fontSize: size, color: strokeColor }}>{filled ? '♥' : '♡'}</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fillColor}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconPin({ size = 16 }) {
  if (!Svg) return <Text style={{ fontSize: size }}>📍</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#6B7280" strokeWidth="1.8" strokeLinejoin="round" />
      <Circle cx="12" cy="9" r="2.5" stroke="#6B7280" strokeWidth="1.8" />
    </Svg>
  );
}

function IconClock({ size = 16 }) {
  if (!Svg) return <Text style={{ fontSize: size }}>🕐</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="1.8" />
      <Path d="M12 7V12L15 14" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconPhone({ size = 16 }) {
  if (!Svg) return <Text style={{ fontSize: size }}>📞</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconAC({ size = 22 }) {
  if (!Svg) return <Text style={{ fontSize: size * 0.8, color: '#555' }}>≋</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="20" height="10" rx="3" stroke="#555" strokeWidth="1.8" />
      <Line x1="6" y1="12" x2="18" y2="12" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="6" y1="9.5" x2="6" y2="14.5" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="10" y1="9.5" x2="10" y2="14.5" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="14" y1="9.5" x2="14" y2="14.5" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="18" y1="9.5" x2="18" y2="14.5" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconCar({ size = 22 }) {
  if (!Svg) return <Text style={{ fontSize: size * 0.8, color: '#555' }}>🚗</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 11L7.5 6H16.5L19 11" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="2" y="11" width="20" height="7" rx="2" stroke="#555" strokeWidth="1.8" />
      <Circle cx="7" cy="18" r="2" stroke="#555" strokeWidth="1.8" />
      <Circle cx="17" cy="18" r="2" stroke="#555" strokeWidth="1.8" />
      <Line x1="2" y1="14" x2="22" y2="14" stroke="#555" strokeWidth="1.8" />
    </Svg>
  );
}

function IconCoffee({ size = 22 }) {
  if (!Svg) return <Text style={{ fontSize: size * 0.8, color: '#555' }}>☕</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 2C6 2 6.5 4 8 4C9.5 4 10 2 10 2" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
      <Rect x="3" y="6" width="13" height="11" rx="2" stroke="#555" strokeWidth="1.8" />
      <Path d="M16 8H18C19.1046 8 20 8.89543 20 10V10C20 11.1046 19.1046 12 18 12H16" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="1" y1="19" x2="19" y2="19" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconWifi({ size = 22 }) {
  if (!Svg) return <Text style={{ fontSize: size * 0.8, color: '#555' }}>📶</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.55C7.17 10.5 10.04 9.25 12.01 9.25C13.98 9.25 16.84 10.5 19 12.55" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M1.42 9C4.45 6.12 8.05 4.5 12 4.5C15.95 4.5 19.55 6.12 22.58 9" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M8.53 16.11C9.57 15.16 10.76 14.63 12 14.63C13.24 14.63 14.43 15.16 15.47 16.11" stroke="#555" strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="12" cy="20" r="1.2" fill="#555" />
    </Svg>
  );
}

function IconRoute({ size = 18 }) {
  if (!Svg) return <Text style={{ fontSize: size, color: '#fff' }}>➤</Text>;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12h15M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const FacilityBadge = ({ type, label }: { type: string; label: string }) => (
  <View style={styles.facilityItem}>
    <View style={styles.facilityIconBox}>
      {type === 'ac'     && <IconAC />}
      {type === 'car'    && <IconCar />}
      {type === 'coffee' && <IconCoffee />}
      {type === 'wifi'   && <IconWifi />}
    </View>
    <Text style={styles.facilityLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ iconType, children }: { iconType: string; children: React.ReactNode }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      {iconType === 'pin'   && <IconPin />}
      {iconType === 'clock' && <IconClock />}
      {iconType === 'phone' && <IconPhone />}
    </View>
    <View style={styles.infoContent}>{children}</View>
  </View>
);

const SmallStars = ({ rating }: { rating: number }) => (
  <View style={styles.smallStarRow}>
    {[1,2,3,4,5].map(i => (
      <Text key={i} style={[styles.smallStar, i <= rating && styles.smallStarFilled]}>★</Text>
    ))}
  </View>
);

const ReviewCard = ({ review }: { review: Review }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
      <View style={styles.reviewMeta}>
        <Text style={styles.reviewName}>{review.name}</Text>
        <SmallStars rating={review.rating} />
      </View>
      <Text style={styles.reviewTime}>{review.timeAgo}</Text>
    </View>
    <Text style={styles.reviewComment}>{review.comment}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VenueDetailScreen({ navigation }: { navigation: Navigation }) {
  const params = useLocalSearchParams();
  const venueParam = params.venue ? JSON.parse(params.venue as string) : null;

  const venue = {
    id: venueParam?.id ?? '1',
    name: venueParam?.name ?? 'GOR Arcadia',
    category: venueParam?.sport ?? venueParam?.category ?? 'Badminton',
    rating: venueParam?.rating ?? 4.5,
    reviewCount: 128,
    address: venueParam?.address ?? 'Jl. Mayjend Sungkono No.12, Surabaya',
    hours: '07:00 – 22:00',
   isOpen: venueParam ? venueParam.status === 'Buka' : true,
    phone: '0812-3456-7890',
    priceMin: 25000,
    priceMax: 40000,
    description: 'GOR dengan 6 lapangan standar BWF, AC, parkir luas, dan kantin di dalam area. Cocok untuk latihan rutin maupun turnamen lokal.',
    facilities: [
      { id: '1', type: 'ac',     label: 'AC' },
      { id: '2', type: 'car',    label: 'Parkir' },
      { id: '3', type: 'coffee', label: 'Kantin' },
      { id: '4', type: 'wifi',   label: 'WiFi' },
    ],
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
      'https://images.unsplash.com/photo-1613918431703-aa50889e3be8?w=800&q=80',
      'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=800&q=80',
    ],
    reviews: [
      {
        id: '1', name: 'Budi Santoso',
        avatar: 'https://i.pravatar.cc/100?img=12',
        rating: 3, timeAgo: '2 hari lalu',
        comment: 'Lapangannya bagus, karpetnya tidak licin. AC nya dingin jadi main siang pun tetap nyaman.',
      },
    ] as Review[],
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Carousel ── */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
          >
            {venue.images.map((item, i) => (
              <Image
                key={i}
                source={{ uri: item }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Tombol back — kiri atas, klik kembali ke index */}
          <TouchableOpacity
  style={styles.overlayBtnLeft}
  onPress={() => router.push("/(tabs)")}
>
  <IconChevronLeft size={20} color="#fff" />
</TouchableOpacity>

          {/* Tombol love — kanan atas sejajar back, outline putih → merah saat aktif */}
          <TouchableOpacity
            style={styles.overlayBtnRight}
            onPress={() => setIsFavorited(v => !v)}
          >
            <IconHeart size={20} filled={isFavorited} />
          </TouchableOpacity>

          {/* Dot indicators */}
          <View style={styles.dotRow}>
            {venue.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── Content Card ── */}
        <View style={styles.contentCard}>

          {/* Category + Rating */}
          <View style={styles.badgeRatingRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{venue.category}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStarIcon}>★</Text>
              <Text style={styles.ratingValue}>{venue.rating}</Text>
              <Text style={styles.ratingCount}>({venue.reviewCount} ulasan)</Text>
            </View>
          </View>

          <Text style={styles.venueName}>{venue.name}</Text>

          {/* Info rows */}
          <View style={styles.infoSection}>
            <InfoRow iconType="pin">
              <Text style={styles.infoText}>{venue.address}</Text>
            </InfoRow>
            <InfoRow iconType="clock">
              <Text style={styles.infoText}>{venue.hours}</Text>
              {venue.isOpen && (
                <View style={styles.openBadge}>
                  <View style={styles.openDot} />
                  <Text style={styles.openText}>Buka</Text>
                </View>
              )}
            </InfoRow>
            <InfoRow iconType="phone">
              <Text style={styles.infoText}>{venue.phone}</Text>
            </InfoRow>
          </View>

          <View style={styles.divider} />

          {/* Price */}
          <Text style={styles.priceLabel}>Harga sewa</Text>
          <Text style={styles.priceValue}>
            {formatRupiah(venue.priceMin)} – {formatRupiah(venue.priceMax)}
            <Text style={styles.priceUnit}> /jam</Text>
          </Text>

          <View style={styles.divider} />

          {/* Facilities */}
          <Text style={styles.sectionTitle}>Fasilitas</Text>
          <View style={styles.facilitiesGrid}>
            {venue.facilities.map(f => (
              <FacilityBadge key={f.id} type={f.type} label={f.label} />
            ))}
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.descriptionText}>{venue.description}</Text>

          <View style={styles.divider} />

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Ulasan</Text>
            <TouchableOpacity>
              <Text style={styles.lihatSemua}>Lihat semua</Text>
            </TouchableOpacity>
          </View>
          {venue.reviews.map(r => <ReviewCard key={r.id} review={r} />)}

          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* ── Sticky Bar: heart + lihat rute ── */}
      <View style={styles.stickyBar}>
        <TouchableOpacity
          style={[styles.heartButton, isFavorited && styles.heartButtonActive]}
          onPress={() => setIsFavorited(v => !v)}
        >
          {/* heart di sticky bar: pakai warna merah solid */}
          {Svg ? (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill={isFavorited ? '#EF4444' : 'none'}>
              <Path
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                stroke="#EF4444" strokeWidth="1.8" strokeLinejoin="round"
              />
            </Svg>
          ) : (
            <Text style={{ fontSize: 22, color: '#EF4444' }}>{isFavorited ? '♥' : '♡'}</Text>
          )}
        </TouchableOpacity>

       
<TouchableOpacity
  style={styles.routeButton}
  onPress={() => router.push({
    pathname: "/route_navigation",
    params: { venue: JSON.stringify(venueParam) },
  })}
>
  <IconRoute size={18} />
  <Text style={styles.routeButtonText}>Lihat rute</Text>
</TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  carouselContainer: { width: SCREEN_WIDTH, height: IMAGE_HEIGHT },
  carouselImage:     { width: SCREEN_WIDTH, height: IMAGE_HEIGHT },

  // tombol back — pojok kiri atas foto
  overlayBtnLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  // tombol love — pojok kanan atas foto, sejajar dengan back
  overlayBtnRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  dotRow: {
    position: 'absolute', bottom: 14, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff' },

  contentCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -20, paddingHorizontal: 20, paddingTop: 24,
  },

  badgeRatingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  categoryText:   { color: '#4F7BF7', fontSize: 13, fontWeight: '600' },
  ratingBox:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingStarIcon: { color: '#F5A623', fontSize: 15 },
  ratingValue:    { color: '#F5A623', fontSize: 14, fontWeight: '700' },
  ratingCount:    { color: '#999', fontSize: 12, marginLeft: 2 },

  venueName: {
    fontSize: 24, fontWeight: '800', color: '#111',
    marginBottom: 16, letterSpacing: -0.3,
  },

  infoSection: { gap: 10, marginBottom: 4 },
  infoRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoIconWrap:{ width: 20, marginTop: 1, alignItems: 'center' },
  infoContent: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  infoText:    { fontSize: 14, color: '#444', lineHeight: 20 },
  openBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  openDot:     { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22C55E' },
  openText:    { color: '#22C55E', fontWeight: '600', fontSize: 13 },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 18 },

  priceLabel: { fontSize: 13, color: '#999', marginBottom: 4 },
  priceValue: { fontSize: 20, fontWeight: '800', color: '#4F7BF7' },
  priceUnit:  { fontSize: 14, fontWeight: '400', color: '#666' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 14 },

  facilitiesGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  facilityItem:   { alignItems: 'center', gap: 6, minWidth: 60 },
  facilityIconBox:{
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#F3F4F8',
    alignItems: 'center', justifyContent: 'center',
  },
  facilityLabel: { fontSize: 12, color: '#555', textAlign: 'center' },

  descriptionText: { fontSize: 14, color: '#555', lineHeight: 22 },

  reviewsHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  lihatSemua: { fontSize: 13, color: '#4F7BF7', fontWeight: '600' },

  reviewCard:   { backgroundColor: '#FAFAFA', borderRadius: 14, padding: 14, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  reviewAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ddd' },
  reviewMeta:   { flex: 1, gap: 3 },
  reviewName:   { fontSize: 14, fontWeight: '700', color: '#111' },
  smallStarRow: { flexDirection: 'row', gap: 1 },
  smallStar:       { fontSize: 12, color: '#DDD' },
  smallStarFilled: { color: '#F5A623' },
  reviewTime:    { fontSize: 12, color: '#999', alignSelf: 'flex-start', marginTop: 2 },
  reviewComment: { fontSize: 13, color: '#555', lineHeight: 19 },

  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderTopWidth: 1, borderTopColor: '#EBEBEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 10,
  },
  heartButton: {
    width: 50, height: 50, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF5F5',
  },
  heartButtonActive: { backgroundColor: '#FEE2E2' },
  routeButton: {
    flex: 1, backgroundColor: '#06C3A0',
    paddingVertical: 14, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    shadowColor: '#06C3A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  routeButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
});