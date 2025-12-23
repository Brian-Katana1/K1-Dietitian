import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePickerExpo from 'expo-image-picker';

export default function ImagePicker({ onImageSelected, selectedImage }) {
  const requestPermissions = async () => {
    const cameraPermission = await ImagePickerExpo.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();

    return cameraPermission.status === 'granted' && mediaLibraryPermission.status === 'granted';
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission required', 'Please grant camera and photo library permissions to use this feature.');
      return;
    }

    const result = await ImagePickerExpo.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0]);
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission required', 'Please grant photo library permissions to use this feature.');
      return;
    }

    const result = await ImagePickerExpo.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0]);
    }
  };

  return (
    <View style={styles.container}>
      {selectedImage && (
        <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImageFromCamera}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickImageFromGallery}>
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePreview: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
