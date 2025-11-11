// app/(tabs)/clientes.js
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
// 1. Importa as funções da API
import { getMesas, liberarMesa } from '../../api';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Componente para um Card de Cliente ---
const ClienteCard = ({ mesa, onLiberarMesa }) => {
  const router = useRouter();

  // Função para navegar para a tela de Pedido (para ver ou adicionar itens)
  function handleVerPedido() {
    router.push({
      pathname: `/pedido/${mesa.id}`,
      params: { 
        // Passa os dados da mesa para a tela de pedido
        clienteNome: mesa.cliente_nome, 
        garcomNome: mesa.garcom_nome,
      } 
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardMesa}>Mesa {mesa.id} - Ocupada</Text>
        <Text style={styles.cardGarcom}>Garçom: {mesa.garcom_nome}</Text>
      </View>
      
      <Text style={styles.cardClienteNome}>Cliente: {mesa.cliente_nome || 'Aguardando nome...'}</Text>
      
      <View style={styles.cardAcoes}>
        <Pressable style={styles.botaoVer} onPress={handleVerPedido}>
          <FontAwesome name="eye" size={16} color="white" />
          <Text style={styles.botaoVerTexto}>Ver Pedido</Text>
        </Pressable>
        
        <Pressable style={styles.botaoLiberar} onPress={() => onLiberarMesa(mesa)}>
          <FontAwesome name="lock-open" size={16} color="#dc2626" />
          <Text style={styles.botaoLiberarTexto}>Encerrar Mesa</Text>
        </Pressable>
      </View>
    </View>
  );
};


export default function ClientesScreen() {
  
  const [mesasOcupadas, setMesasOcupadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const estaEmFoco = useIsFocused();
  const router = useRouter(); // Para o feedback

  // 2. Função para buscar mesas
  async function fetchMesas() {
    setIsLoading(true);
    try {
        const data = await getMesas(); // Chama a API
        
        // Filtra para mostrar APENAS as mesas ocupadas
        const ocupadas = data.filter(m => m.status === 'ocupada');
        setMesasOcupadas(ocupadas);
    } catch (error) {
        Alert.alert("Erro de Conexão", "Não foi possível carregar as mesas ocupadas.");
    } finally {
        setIsLoading(false);
    }
  }

  // 3. Lógica de liberação de mesa (usando a API)
  async function handleLiberarMesa(mesa) {
    Alert.alert(
      "Confirmação",
      `Deseja realmente encerrar a Mesa ${mesa.id} e liberá-la?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, Liberar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await liberarMesa(mesa.id); // Chama a API
              
              // Envia o feedback para a tela de Mesas (index)
              router.setParams({ feedback: `Mesa ${mesa.id} encerrada com sucesso.` });
              
              fetchMesas(); // Recarrega a lista
              
            } catch (error) {
              Alert.alert("Erro", "Não foi possível encerrar a mesa.");
            }
          }
        }
      ]
    );
  }

  useEffect(() => {
    if (estaEmFoco) {
      fetchMesas(); // Carrega a lista quando a aba é focada
    }
  }, [estaEmFoco]);


  if (isLoading && mesasOcupadas.length === 0) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#633A21" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mesasOcupadas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClienteCard 
            mesa={item} 
            onLiberarMesa={handleLiberarMesa}
          />
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>👥 Gestão de Clientes</Text>
            <Text style={styles.subtitle}>{mesasOcupadas.length} mesas em atendimento.</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma mesa ocupada no momento.</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3A291F' },
  subtitle: { fontSize: 16, color: '#5C4033', marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#5C4033' },
  card: {
    backgroundColor: 'white', marginHorizontal: 16, marginTop: 12, padding: 16,
    borderRadius: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1,
    borderLeftWidth: 5, borderLeftColor: '#633A21',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardMesa: { fontSize: 18, fontWeight: 'bold', color: '#3A291F' },
  cardGarcom: { fontSize: 14, color: '#5C4033' },
  cardClienteNome: { fontSize: 16, fontWeight: '600', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#EFEBE4', paddingBottom: 8 },
  cardAcoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  botaoVer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', 
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6,
  },
  botaoVerTexto: { color: 'white', fontWeight: 'bold', marginLeft: 6 },
  botaoLiberar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6,
    borderWidth: 1, borderColor: '#dc2626',
  },
  botaoLiberarTexto: { color: '#dc2626', fontWeight: 'bold', marginLeft: 6 },
});