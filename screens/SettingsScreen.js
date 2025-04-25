// screens/SettingsScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native"; // Added ScrollView

const SettingsScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef && isCameraReady) {
      const photo = await cameraRef.takePictureAsync();
      console.log("Photo URI:", photo.uri);
      // You can now use the photo URI as needed
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    // Use ScrollView if your settings list might exceed screen height
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        ref={(ref) => setCameraRef(ref)}
        onCameraReady={() => setIsCameraReady(true)}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.text}>Take Picture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    backgroundColor: "#fff",
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
    borderRadius: 5,
  },
  button: {
    padding: 10,
  },
  text: {
    fontSize: 18,
    color: "black",
  },
});

export default SettingsScreen;
