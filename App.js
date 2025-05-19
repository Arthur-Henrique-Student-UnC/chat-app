import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import io from 'socket.io-client';

const [hasConnection, setHasConnection] = useState(false);

export default function App() {
  const [hasConnection, setHasConnection] = useState(false);

  if (!hasConnection){
      return (
      <View style={styles.container}>
        <Text>Conectando...</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
