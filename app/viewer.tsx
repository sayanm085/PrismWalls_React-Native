import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions. get('window');

const tags = ['Anime', 'Blue', 'Night', 'Fantasy', 'Art'];

const relatedWallpapers = [
  { id: '1', image: 'https://picsum.photos/150/200?random=40' },
  { id: '2', image: 'https://picsum.photos/150/200? random=41' },
  { id: '3', image: 'https://picsum.photos/150/200?random=42' },
  { id: '4', image: 'https://picsum.photos/150/200? random=43' },
];

export default function ViewerScreen() {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Main Image */}
      <Image
        source={{ uri: 'https://picsum.photos/600/900? random=100' }}
        style={styles. mainImage}
        resizeMode="cover"
      />

      {/* Overlay Gradient */}
      <View style={styles. topOverlay} />
      <View style={styles.bottomOverlay} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ?  'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#EF4444' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>Artworks by Omuk</Text>
          <View style={styles.statsRow}>
            <Ionicons name="eye" size={16} color="#CBD5E1" />
            <Text style={styles.statsText}>23,009 views</Text>
          </View>
        </View>

        {/* Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
        >
          {tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tag,
                index === 0 && styles.tagActive,
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  index === 0 && styles.tagTextActive,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles. actionButton}>
            <MaterialCommunityIcons name="wallpaper" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowOptions(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Related Section */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related Wallpapers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {relatedWallpapers.map((item) => (
              <TouchableOpacity key={item.id} style={styles.relatedCard}>
                <Image source={{ uri: item.image }} style={styles.relatedImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles. modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Options</Text>

            <TouchableOpacity style={styles.modalOption}>
              <View style={[styles. modalIcon, { backgroundColor: '#4F46E5' }]}>
                <MaterialCommunityIcons name="cellphone" size={20} color="#fff" />
              </View>
              <Text style={styles.modalOptionText}>Set as Home Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption}>
              <View style={[styles.modalIcon, { backgroundColor: '#22C55E' }]}>
                <MaterialCommunityIcons name="lock" size={20} color="#fff" />
              </View>
              <Text style={styles. modalOptionText}>Set as Lock Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption}>
              <View style={[styles.modalIcon, { backgroundColor: '#F97316' }]}>
                <MaterialCommunityIcons name="cellphone-lock" size={20} color="#fff" />
              </View>
              <Text style={styles.modalOptionText}>Set as Both</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption}>
              <View style={[styles.modalIcon, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="share-social" size={20} color="#fff" />
              </View>
              <Text style={styles.modalOptionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption}>
              <View style={[styles. modalIcon, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="flag" size={20} color="#fff" />
              </View>
              <Text style={styles.modalOptionText}>Report</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 350,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  infoSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#CBD5E1',
    marginLeft: 6,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  tagActive: {
    backgroundColor: '#4F46E5',
  },
  tagText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  tagTextActive: {
    color: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    borderRadius: 30,
    padding: 8,
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedSection: {
    marginBottom: 20,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  relatedCard: {
    width: 80,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
  },
  relatedImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginLeft: 14,
  },
});