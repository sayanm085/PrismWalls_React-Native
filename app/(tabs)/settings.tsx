/**
 * =============================================================================
 * WALLPERS - Settings Screen (Tab Version)
 * =============================================================================
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '@/src/constants';

// =============================================================================
// TYPES
// =============================================================================

type SettingItemProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  hasArrow?: boolean;
  onPress?: () => void;
};

// =============================================================================
// SETTING ITEM COMPONENT
// =============================================================================

const SettingItem = React.memo(function SettingItem({
  icon,
  iconBg,
  title,
  subtitle,
  hasToggle,
  toggleValue,
  onToggle,
  hasArrow,
  onPress,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={hasToggle ? 1 : 0.7}
      disabled={hasToggle}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {hasToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
          thumbColor={toggleValue ? COLORS.primary : '#94A3B8'}
          ios_backgroundColor="#E2E8F0"
        />
      )}
      {hasArrow && (
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SettingsScreen() {
  // Settings State
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoDownload, setAutoDownload] = useState(true);
  const [highQuality, setHighQuality] = useState(false);
  const [saveToGallery, setSaveToGallery] = useState(true);

  const handleLogout = useCallback(() => {
    console.log('Logout pressed');
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.9}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>johndoe@example.com</Text>
          </View>
          <View style={styles.premiumBadge}>
            <MaterialCommunityIcons name="crown" size={16} color="#F59E0B" />
            <Text style={styles.premiumText}>PRO</Text>
          </View>
        </TouchableOpacity>

        {/* Premium Banner */}
        <TouchableOpacity style={styles.premiumBanner} activeOpacity={0.9}>
          <View style={styles.premiumBannerContent}>
            <MaterialCommunityIcons name="star-circle" size={40} color="#fff" />
            <View style={styles.premiumBannerText}>
              <Text style={styles.premiumBannerTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumBannerSubtitle}>
                Unlock all wallpapers & ringtones
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={<Ionicons name="notifications" size={20} color="#fff" />}
              iconBg="#8B5CF6"
              title="Notifications"
              subtitle="Manage push notifications"
              hasToggle
              toggleValue={notifications}
              onToggle={setNotifications}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="moon" size={20} color="#fff" />}
              iconBg="#1E293B"
              title="Dark Mode"
              subtitle="Switch to dark theme"
              hasToggle
              toggleValue={darkMode}
              onToggle={setDarkMode}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="language" size={20} color="#fff" />}
              iconBg="#3B82F6"
              title="Language"
              subtitle="English"
              hasArrow
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Downloads Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downloads</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={<Ionicons name="cloud-download" size={20} color="#fff" />}
              iconBg="#22C55E"
              title="Auto Download"
              subtitle="Download daily wallpapers"
              hasToggle
              toggleValue={autoDownload}
              onToggle={setAutoDownload}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="images" size={20} color="#fff" />}
              iconBg="#F97316"
              title="High Quality"
              subtitle="Original resolution"
              hasToggle
              toggleValue={highQuality}
              onToggle={setHighQuality}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="save" size={20} color="#fff" />}
              iconBg="#EC4899"
              title="Save to Gallery"
              subtitle="Auto save downloads"
              hasToggle
              toggleValue={saveToGallery}
              onToggle={setSaveToGallery}
            />
          </View>
        </View>

        {/* Storage Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.sectionCard}>
            <View style={styles.storageInfo}>
              <View style={styles.storageHeader}>
                <Text style={styles.storageTitle}>Storage Used</Text>
                <Text style={styles.storageValue}>2.4 GB / 8 GB</Text>
              </View>
              <View style={styles.storageBar}>
                <View style={[styles.storageProgress, { width: '30%' }]} />
              </View>
            </View>
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="trash" size={20} color="#fff" />}
              iconBg="#EF4444"
              title="Clear Cache"
              subtitle="Free up 450 MB"
              hasArrow
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Support Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={<Ionicons name="help-circle" size={20} color="#fff" />}
              iconBg={COLORS.primary}
              title="Help Center"
              hasArrow
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="star" size={20} color="#fff" />}
              iconBg="#F59E0B"
              title="Rate App"
              hasArrow
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="share-social" size={20} color="#fff" />}
              iconBg="#22C55E"
              title="Share App"
              hasArrow
              onPress={() => {}}
            />
          </View>
        </View>

        {/* About Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={<Ionicons name="document-text" size={20} color="#fff" />}
              iconBg="#64748B"
              title="Privacy Policy"
              hasArrow
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Ionicons name="information-circle" size={20} color="#fff" />}
              iconBg="#64748B"
              title="App Version"
              subtitle="v2.5.0"
              hasArrow={false}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>Made with ❤️ by WALLPERS Team</Text>
      </ScrollView>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },

  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginLeft: 4,
  },

  // Premium Banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
  },

  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  premiumBannerText: {
    marginLeft: 16,
  },

  premiumBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },

  premiumBannerSubtitle: {
    fontSize: 13,
    color: '#C7D2FE',
    marginTop: 4,
  },

  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingContent: {
    flex: 1,
    marginLeft: 14,
  },

  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 66,
  },

  // Storage
  storageInfo: {
    padding: 12,
  },

  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  storageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  storageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  storageBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },

  storageProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },

  // Footer
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 24,
    marginBottom: 20,
  },
});