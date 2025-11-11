// app/mesa-detalhe/[mesaId].js
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext'; 
import { Picker } from '@react-native-picker/picker'; 
import { getGarcons, ocuparMesa } from '../../api'; // Importa da API

export default function DetalheMesaScreen() {
  
  const router = useRouter();
  const { mesaId } = useLocalSearchParams();
  
  // 1. LER O USUÁRIO LOGADO (Cliente)
  const { usuarioLogado } = useAuth();
  const nomeCliente = usuarioLogado?.dados?.nome || 'Cliente Anônimo';

  // 2. ESTADOS
  const [mesa] = useState({ id: mesaId, nome: `Mesa ${mesaId}` }); 
  const [garcons, setGarcons] = useState([]);
  const [garcomSelecionado, setGarcomSelecionado] = useState(null); // O nome do garçom
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 3. Carregar a lista de Garçons (APENAS uma vez)
  useEffect(() => {
    async function fetchGarcons() {
      try {
        const data = await getGarcons();
        
        setGarcons(data);
        // Define a seleção inicial para a primeira opção da lista
        setGarcomSelecionado(data.length > 0 ? data[0].nome : 'Selecione...');
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGarcons();
  }, []);

  // 4. FUNÇÃO "OCUPAR MESA"
  async function handleOcuparMesa() {
    
    if (!garcomSelecionado || garcomSelecionado === 'Selecione...') {
        Alert.alert("Garçom", "Por favor, selecione quem irá atendê-lo.");
        return;
    }
    
    setIsSubmitting(true);

    try {
      // 5. O PEDIDO 'PUT' para ocupar a mesa
      await ocuparMesa(mesa.id, garcomSelecionado);
      
      // 6. NAVEGA PARA O PEDIDO (e leva AMBOS os nomes)
      router.push({
        pathname: `/pedido/${mesa.id}`,
        params: { 
          clienteNome: nomeCliente, // ✅ Nome lido do useAuth
          garcomNome: garcomSelecionado // ✅ Nome lido do Picker
        }
      });

    } catch (err) {
      Alert.alert("Erro", err.message || "Não foi possível ocupar a mesa.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 7. RENDERIZAÇÃO CONDICIONAL
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#633A21" />
        <Text>A carregar garçons...</Text>
      </View>
    );
  }
  if (error || !mesa) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Erro: Não foi possível carregar o detalhe da mesa.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mesa {mesa.nome}</Text>
        <Text style={styles.subtitle}>Olá, {nomeCliente}!</Text>

        {/* SELEÇÃO DO GARÇOM */}
        <View style={styles.infoBox}>
          <Text style={styles.label}>Escolha quem irá atendê-lo:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={garcomSelecionado}
              onValueChange={(itemValue) => setGarcomSelecionado(itemValue)}
              style={styles.picker}
              enabled={!isSubmitting}
            >
              <Picker.Item label="--- Selecione um Garçom ---" value="Selecione..." style={styles.pickerPlaceholder} /> 
              {garcons.map((g) => (
                <Picker.Item key={g.id} label={g.nome} value={g.nome} />
              ))}
            </Picker>
          </View>
        </View>

        <Pressable 
          style={[styles.botaoOcupar, isSubmitting && styles.botaoDesativado]} 
          onPress={handleOcuparMesa}
          disabled={isSubmitting || garcomSelecionado === 'Selecione...'}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botaoTexto}>Fazer Pedido na Mesa {mesa.id}</Text>
          )}
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

// 8. ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 16, color: '#dc2626', fontWeight: 'bold' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#3A291F', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#5C4033', marginBottom: 40, textAlign: 'center' },
  infoBox: { marginBottom: 24 },
  label: { fontSize: 16, color: '#5C4033', marginBottom: 8 },
  pickerContainer: {
    borderWidth: 1, borderColor: '#bbb', borderRadius: 8,
    backgroundColor: '#fff', overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50, // Altura diferente para iOS
    width: '100%',
  },
  pickerPlaceholder: {
    color: '#aaa',
  },
  botaoOcupar: {
    backgroundColor: '#633A21', paddingVertical: 16,
    borderRadius: 12, elevation: 5, alignItems: 'center',
    minHeight: 55, marginTop: 20,
  },
  botaoDesativado: { backgroundColor: '#b0a199' },
  botaoTexto: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});