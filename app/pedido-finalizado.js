// app/pedido-finalizado.js
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 
import { useEffect } from 'react';

export default function PedidoFinalizadoScreen() {
  
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Volta para a tela anterior (a tela de Pedido)
      if (router.canGoBack()) {
        router.back();
      }
    }, 2000); // 2 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FontAwesome name="check-circle" size={80} color="#22c55e" />
        <Text style={styles.title}>Pedido Enviado!</Text>
        <Text style={styles.subtitle}>
          Enviado para a cozinha.
        </Text>
        <ActivityIndicator size="large" color="#633A21" style={{ marginTop: 24 }} />
        <Text style={styles.redirectText}>A voltar para a mesa...</Text>
      </View>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  content: { 
    flex: 1, padding: 16, 
    justifyContent: 'center', alignItems: 'center', gap: 24,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3A291F' },
  subtitle: { fontSize: 18, color: '#5C4033', textAlign: 'center' },
  redirectText: { fontSize: 14, color: '#5C4033' },
});