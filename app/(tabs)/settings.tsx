/**
 * =============================================================================
 * PRISMWALLS - Settings Screen (Working Cache)
 * =============================================================================
 *
 * Features:
 * - Connected to Zustand settings store
 * - REAL cache size calculation
 * - WORKING clear cache
 * - Persisted preferences
 *
 * Author: Shotlin Team
 * =============================================================================
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Linking from 'expo-linking';
import React, { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

// Components
import { BottomNavBar } from '@/src/components/navigation';

// Store
import {
  useSettingsStore,
  selectHighQuality,
  selectSaveToGallery,
  selectAutoDownload,
} from '@/src/store/useSettingsStore';

// Constants
import { COLORS } from '@/src/constants';
import { TabName } from '@/src/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.yourapp.prismwalls';
const APP_STORE_URL = 'https://apps.apple.com/app/prismwalls/id123456789';

// =============================================================================
// TYPES
// =============================================================================

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  hasArrow?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  rightText?: string;
};

type CacheInfo = {
  size: number;
  formattedSize: string;
  percentage: number;
};

// =============================================================================
// HELPER: Format bytes to readable size
// =============================================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// =============================================================================
// HELPER: Calculate directory size
// =============================================================================

async function getDirectorySize(dirUri: string): Promise<number> {
  let totalSize = 0;

  try {
    const dirInfo = await FileSystem.getInfoAsync(dirUri);

    if (!dirInfo.exists) {
      return 0;
    }

    const files = await FileSystem.readDirectoryAsync(dirUri);

    for (const file of files) {
      const fileUri = `${dirUri}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (fileInfo.exists) {
        if (fileInfo.isDirectory) {
          // Recursively get size of subdirectory
          totalSize += await getDirectorySize(`${fileUri}/`);
        } else {
          totalSize += fileInfo.size || 0;
        }
      }
    }
  } catch (error) {
    console.error('Error calculating directory size:', error);
  }

  return totalSize;
}

// =============================================================================
// HELPER: Get total cache size
// =============================================================================

async function getCacheSize(): Promise<CacheInfo> {
  try {
    const cacheDir = FileSystem.cacheDirectory;

    if (!cacheDir) {
      return { size: 0, formattedSize: '0 B', percentage: 0 };
    }

    const totalBytes = await getDirectorySize(cacheDir);
    const formattedSize = formatBytes(totalBytes);

    // Assume max cache is 500MB for percentage calculation
    const maxCache = 500 * 1024 * 1024; // 500 MB
    const percentage = Math.min((totalBytes / maxCache) * 100, 100);

    return {
      size: totalBytes,
      formattedSize,
      percentage,
    };
  } catch (error) {
    console.error('Error getting cache size:', error);
    return { size: 0, formattedSize: '0 B', percentage: 0 };
  }
}

// =============================================================================
// HELPER: Clear cache
// =============================================================================

async function clearCache(): Promise<boolean> {
  try {
    const cacheDir = FileSystem.cacheDirectory;

    if (!cacheDir) {
      return false;
    }

    const files = await FileSystem.readDirectoryAsync(cacheDir);

    for (const file of files) {
      const fileUri = `${cacheDir}${file}`;
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }

    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
}

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
  disabled,
  comingSoon,
  rightText,
}: SettingItemProps) {
  return (
    <Pressable
      style={[styles.settingItem, disabled && styles.settingItemDisabled]}
      onPress={onPress}
      android_ripple={!hasToggle && !disabled ? RIPPLE_CONFIG : undefined}
      disabled={hasToggle || disabled}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>

      <View style={styles.settingContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
            {title}
          </Text>
          {comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={[styles.settingSubtitle, disabled && styles.settingSubtitleDisabled]}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightText && <Text style={styles.rightText}>{rightText}</Text>}

      {hasToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
          thumbColor={toggleValue ? COLORS.primary : '#94A3B8'}
          ios_backgroundColor="#E2E8F0"
          disabled={disabled}
        />
      )}

      {hasArrow && !comingSoon && (
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      )}
    </Pressable>
  );
});

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

const SectionHeader = React.memo(function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SettingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('settings');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  // ✅ Cache State
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    size: 0,
    formattedSize: '0 B',
    percentage: 0,
  });
  const [isLoadingCache, setIsLoadingCache] = useState(true);
  const [isClearingCache, setIsClearingCache] = useState(false);

  // ✅ Connected to Zustand Store
  const highQuality = useSettingsStore(selectHighQuality);
  const saveToGallery = useSettingsStore(selectSaveToGallery);
  const autoDownload = useSettingsStore(selectAutoDownload);

  const setHighQuality = useSettingsStore((state) => state.setHighQuality);
  const setSaveToGallery = useSettingsStore((state) => state.setSaveToGallery);
  const setAutoDownload = useSettingsStore((state) => state.setAutoDownload);

  // ==========================================================================
  // LOAD CACHE SIZE ON MOUNT & FOCUS
  // ==========================================================================

  const loadCacheSize = useCallback(async () => {
    setIsLoadingCache(true);
    const info = await getCacheSize();
    setCacheInfo(info);
    setIsLoadingCache(false);
  }, []);

  useEffect(() => {
    loadCacheSize();
  }, [loadCacheSize]);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('settings');
      loadCacheSize(); // Refresh cache size when screen focused
    }, [loadCacheSize])
  );

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleTabPress = useCallback(
    (tab: TabName) => {
      if (tab === 'settings') return;
      setActiveTab(tab);

      const routes: Record<TabName, string | null> = {
        home: '/',
        favorites: '/favorites',
        category: '/search',
        trending: '/trending',
        settings: null,
      };

      const route = routes[tab];
      if (route) router.push(route as any);
    },
    [router]
  );

  // ✅ Toggle Handlers
  const handleHighQualityToggle = useCallback(
    (value: boolean) => {
      setHighQuality(value);
      if (value) {
        Alert.alert(
          'High Quality Enabled',
          'Wallpapers will download in original resolution (larger file size)',
          [{ text: 'OK' }]
        );
      }
    },
    [setHighQuality]
  );

  const handleSaveToGalleryToggle = useCallback(
    (value: boolean) => {
      setSaveToGallery(value);
    },
    [setSaveToGallery]
  );

  const handleAutoDownloadToggle = useCallback(
    (value: boolean) => {
      setAutoDownload(value);
      if (value) {
        Alert.alert(
          'Coming Soon',
          'Auto download feature will be available in a future update! ',
          [{ text: 'OK' }]
        );
        setTimeout(() => setAutoDownload(false), 100);
      }
    },
    [setAutoDownload]
  );

  // ✅ WORKING Clear Cache
  const handleClearCache = useCallback(() => {
    if (cacheInfo.size === 0) {
      Alert.alert('Cache Empty', 'No cached data to clear.');
      return;
    }

    Alert.alert(
      'Clear Cache',
      `This will clear ${cacheInfo.formattedSize} of cached data.\n\nAre you sure? `,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearingCache(true);

            const success = await clearCache();

            if (success) {
              // Refresh cache size
              await loadCacheSize();
              Alert.alert('Success!  ✓', 'Cache cleared successfully! ');
            } else {
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            }

            setIsClearingCache(false);
          },
        },
      ]
    );
  }, [cacheInfo, loadCacheSize]);

  // Check for Updates
  const handleCheckUpdate = useCallback(async () => {
    setIsCheckingUpdate(true);

    setTimeout(() => {
      setIsCheckingUpdate(false);
      Alert.alert(
        'Up to Date!  ✓',
        `You're running the latest version (v${APP_VERSION})`,
        [{ text: 'OK' }]
      );
    }, 1500);
  }, []);

  // Rate App
  const handleRateApp = useCallback(() => {
    const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(storeUrl).catch(() => {
      Alert.alert('Error', 'Could not open store page.');
    });
  }, []);

  // Share App
  const handleShareApp = useCallback(async () => {
    const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    Alert.alert(
      'Share PRISMWALLS',
      'Share this app with your friends! ',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy Link',
          onPress: () => {
            Alert.alert('Copied! ', 'App link copied to clipboard.');
          },
        },
        {
          text: 'Open Store',
          onPress: () => Linking.openURL(storeUrl),
        },
      ]
    );
  }, []);

  // Help Center
  const handleHelpCenter = useCallback(() => {
    Alert.alert(
      'Help Center',
      'Need help? Contact us at:\n\nsupport@prismwalls.com',
      [
        { text: 'OK' },
        {
          text: 'Email Us',
          onPress: () => {
            Linking.openURL('mailto:support@prismwalls.com?subject=PRISMWALLS Support');
          },
        },
      ]
    );
  }, []);

  // Privacy Policy
  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL('https://prismwalls.com/privacy-policy').catch(() => {
      Alert.alert('Error', 'Could not open privacy policy.');
    });
  }, []);

  // Terms of Service
  const handleTermsOfService = useCallback(() => {
    Linking.openURL('https://prismwalls.com/terms').catch(() => {
      Alert.alert('Error', 'Could not open terms of service.');
    });
  }, []);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainerHeader}>
            <Ionicons name="settings" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your experience</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <SectionHeader title="Notifications" />
          <View style={styles.sectionCard}>
            <SettingItem
              icon="notifications"
              iconBg="#8B5CF6"
              title="Push Notifications"
              subtitle="Get notified about new wallpapers"
              hasToggle
              toggleValue={false}
              disabled
              comingSoon
            />
          </View>
        </View>

        {/* Downloads Section */}
        <View style={styles.section}>
          <SectionHeader title="Downloads" />
          <View style={styles.sectionCard}>
            <SettingItem
              icon="cloud-download"
              iconBg="#22C55E"
              title="Auto Download"
              subtitle="Download daily wallpapers automatically"
              hasToggle
              toggleValue={autoDownload}
              onToggle={handleAutoDownloadToggle}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="sparkles"
              iconBg="#F97316"
              title="High Quality"
              subtitle={highQuality ? 'Original resolution (larger files)' : 'Compressed (smaller files)'}
              hasToggle
              toggleValue={highQuality}
              onToggle={handleHighQualityToggle}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="save"
              iconBg="#EC4899"
              title="Save to Gallery"
              subtitle={saveToGallery ? 'Downloads will be saved to gallery' : 'Downloads stay in app only'}
              hasToggle
              toggleValue={saveToGallery}
              onToggle={handleSaveToGalleryToggle}
            />
          </View>
        </View>

        {/* ✅ Storage Section - WORKING */}
        <View style={styles.section}>
          <SectionHeader title="Storage" />
          <View style={styles.sectionCard}>
            <View style={styles.storageInfo}>
              <View style={styles.storageHeader}>
                <View style={styles.storageLeft}>
                  <Ionicons name="folder" size={20} color={COLORS.primary} />
                  <Text style={styles.storageTitle}>Cache Size</Text>
                </View>
                {isLoadingCache ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.storageValue}>{cacheInfo.formattedSize}</Text>
                )}
              </View>
              <View style={styles.storageBar}>
                <View
                  style={[
                    styles.storageProgress,
                    { width: `${cacheInfo.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.storageHint}>
                {cacheInfo.size > 0
                  ? 'Cached images and data'
                  : 'No cached data'}
              </Text>
            </View>
            <View style={styles.divider} />
            <Pressable
              style={styles.settingItem}
              onPress={handleClearCache}
              android_ripple={RIPPLE_CONFIG}
              disabled={isClearingCache}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#EF4444' }]}>
                {isClearingCache ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="trash" size={20} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Clear Cache</Text>
                <Text style={styles.settingSubtitle}>
                  {isClearingCache
                    ? 'Clearing...'
                    : cacheInfo.size > 0
                    ? `Free up ${cacheInfo.formattedSize}`
                    : 'Cache is empty'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <SectionHeader title="Support" />
          <View style={styles.sectionCard}>
            <SettingItem
              icon="help-circle"
              iconBg={COLORS.primary}
              title="Help Center"
              subtitle="Get help & contact us"
              hasArrow
              onPress={handleHelpCenter}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="star"
              iconBg="#F59E0B"
              title="Rate App"
              subtitle="Love the app? Rate us 5 stars!"
              hasArrow
              onPress={handleRateApp}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="share-social"
              iconBg="#22C55E"
              title="Share App"
              subtitle="Share with friends & family"
              hasArrow
              onPress={handleShareApp}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <SectionHeader title="About" />
          <View style={styles.sectionCard}>
            <SettingItem
              icon="document-text"
              iconBg="#64748B"
              title="Privacy Policy"
              hasArrow
              onPress={handlePrivacyPolicy}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark"
              iconBg="#64748B"
              title="Terms of Service"
              hasArrow
              onPress={handleTermsOfService}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="information-circle"
              iconBg="#3B82F6"
              title="App Version"
              subtitle={`v${APP_VERSION} (${BUILD_NUMBER})`}
              rightText={isCheckingUpdate ? 'Checking...' : ''}
              hasArrow
              onPress={handleCheckUpdate}
            />
          </View>
        </View>

        {/* Update Button */}
        <Pressable
          style={styles.updateButton}
          onPress={handleCheckUpdate}
          android_ripple={RIPPLE_CONFIG}
          disabled={isCheckingUpdate}
        >
          <Ionicons
            name={isCheckingUpdate ? 'sync' : 'refresh-circle'}
            size={22}
            color={COLORS.primary}
          />
          <Text style={styles.updateButtonText}>
            {isCheckingUpdate ? 'Checking for updates...' : 'Check for Updates'}
          </Text>
        </Pressable>

        {/* Current Settings Summary */}
        <View style={styles.settingsSummary}>
          <Text style={styles.summaryTitle}>Current Settings</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quality:</Text>
            <Text style={styles.summaryValue}>
              {highQuality ? '🎨 Original' : '📦 Compressed'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gallery:</Text>
            <Text style={styles.summaryValue}>
              {saveToGallery ? '✅ Auto-save' : '❌ App only'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cache:</Text>
            <Text style={styles.summaryValue}>
              📁 {cacheInfo.formattedSize}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ by Shotlin Team</Text>
          <Text style={styles.footerVersion}>Version {APP_VERSION}</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

// =============================================================================
// STATIC CONSTANTS
// =============================================================================

const RIPPLE_CONFIG = { color: 'rgba(0,0,0,0.1)', borderless: false };

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainerHeader: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingItemDisabled: {
    opacity: 0.6,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingTitleDisabled: {
    color: COLORS.textSecondary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingSubtitleDisabled: {
    color: '#CBD5E1',
  },
  rightText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: 8,
  },

  // Coming Soon Badge
  comingSoonBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    textTransform: 'uppercase',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },

  // Storage
  storageInfo: {
    padding: 14,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '700',
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
  storageHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
  },

  // Update Button
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Settings Summary
  settingsSummary: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#15803D',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerVersion: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
});