// app/(tabs)/garcons.js
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getGarcons } from '../../api';
import { FontAwesome } from '@expo/vector-icons'; 
import { useIsFocused } from '@react-navigation/native';

// --- Componente para renderizar cada garçom ---
const CardGarcom = ({ garcom, estaLogado, onPress }) => {
  const statusTexto = estaLogado ? 'Logado (Você)' : garcom.cargo === 'gerente' ? 'Gerente' : 'Disponível';

  return (
    <Pressable 
      style={[styles.card, estaLogado && styles.cardIndisponivel]} 
      onPress={onPress}
    >
      <View style={styles.iconeContainer}>
        <FontAwesome name="user-circle" size={40} color="#5C4033" />
      </View>
      <View style={styles.textoContainer}>
        <Text style={styles.nome}>{garcom.nome}</Text>
        <Text style={[styles.status, estaLogado && styles.status_indisponivel]}>
          {statusTexto}
        </Text>
      </View>
    </Pressable>
  );
};


export default function GarconsScreen() {
  
  const { usuarioLogado } = useAuth(); // Apenas para saber quem está logado
  
  const [listaGarcons, setListaGarcons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const estaEmFoco = useIsFocused();

  // 1. Lógica de fetch
  async function fetchGarcons() {
    setIsLoading(true);
    try {
      const data = await getGarcons();
      setListaGarcons(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      Alert.alert("Erro de Conexão", "Não foi possível buscar a lista de garçons.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (estaEmFoco) {
      fetchGarcons();
    }
  }, [estaEmFoco]); 

  // 2. Apenas visualização
  function handleSelectGarcom(garcom) {
    if (usuarioLogado?.dados?.id === garcom.id) {
      Alert.alert("Atenção", "Você já está logado como este usuário. Saia pela tela de Mesas.");
    } else {
      Alert.alert("Atenção", "Esta tela é apenas para visualização. Use a tela inicial para fazer login.");
    }
  }

  // 3. RENDERIZAÇÃO CONDICIONAL
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#633A21" />
        <Text style={styles.loadingText}>A carregar equipa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Erro: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={listaGarcons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CardGarcom 
            garcom={item}
            estaLogado={usuarioLogado?.dados?.id === item.id}
            onPress={() => handleSelectGarcom(item)}
          />
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>👨‍🍳 Equipa Registada</Text>
            <Text style={styles.subtitle}>
              Logado como: {usuarioLogado?.dados?.nome || 'Nenhum'}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16, color: '#5C4033' },
  errorText: { fontSize: 16, color: '#dc2626', fontWeight: 'bold' },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3A291F' },
  subtitle: { fontSize: 16, color: '#5C4033', marginTop: 4 },
  card: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderRadius: 12, marginHorizontal: 16, marginTop: 12,
    padding: 12, alignItems: 'center', elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
    borderWidth: 2, borderColor: '#EFEBE4',
  },
  cardIndisponivel: { 
    borderColor: '#633A21', 
    backgroundColor: '#FDF9F3',
  },
  iconeContainer: {
    width: 50, height: 50, borderRadius: 25,
    marginRight: 12, backgroundColor: '#EFEBE4',
    justifyContent: 'center', alignItems: 'center',
  },
  textoContainer: { flex: 1 },
  nome: { fontSize: 18, fontWeight: '600', color: '#3A291F' },
  status: { fontSize: 14, marginTop: 4, color: '#166534' }, 
  status_indisponivel: { color: '#633A21', fontWeight: 'bold' } 
});