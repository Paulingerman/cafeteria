// app/(tabs)/index.js (AGORA É A TELA DE MESAS)
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { useIsFocused } from '@react-navigation/native';
import { BASE_URL, getMesas } from '../../api'; // Importa a API
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'; 

export default function MesasScreen() {
  
  const [mesas, setMesas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const estaEmFoco = useIsFocused();
  const { usuarioLogado, logout } = useAuth(); // Usa o logout do Contexto

  // 1. Função para buscar os dados na API
  useEffect(() => {
    if (estaEmFoco) {
      setIsLoading(true); 
      async function fetchMesas() {
        try {
          // Usa a função getMesas() do api.js
          const data = await getMesas();
          setMesas(data);
          setError(null);
        } catch (err) {
          setError(err.message);
          Alert.alert("Erro de Conexão", "Não foi possível carregar as mesas. Verifique se o servidor Node está a correr.");
        } finally {
          setIsLoading(false);
        }
      }
      
      fetchMesas();

      // 2. LÓGICA DE FEEDBACK (Mensagem de sucesso após liberar mesa)
      if (params.feedback) {
        Alert.alert("Sucesso", params.feedback);
        router.setParams({ feedback: undefined });
      }
    }
  }, [estaEmFoco, params.feedback]);

  // 3. LÓGICA DE NAVEGAÇÃO
  function selecionarMesa(mesa) {
    if (mesa.status === 'livre') {
      // Navega para a tela de detalhe (onde o cliente escolhe o garçom)
      router.push(`/mesa-detalhe/${mesa.id}`);
    } else {
      Alert.alert(
        "Mesa Ocupada", 
        `Atendida por: ${mesa.garcom_nome || 'Desconhecido'}.`
      );
    }
  }
  
  // 4. FUNÇÕES DE LOGIN/LOGOUT (Botão Flutuante)
  const handleAcessoGerencia = () => {
      if (usuarioLogado) {
          // Se houver usuário logado (Cliente, Garçom ou Gerente), faz LOGOUT
          Alert.alert(
              "Sair da Conta",
              `Deseja sair da conta de ${usuarioLogado.dados.nome}?`,
              [
                  { text: "Cancelar", style: 'cancel' },
                  { text: "Sair", style: 'destructive', onPress: () => {
                      logout(); // Limpa o estado
                      router.replace('/LoginScreen'); // Volta para a tela de Login Principal
                  }}
              ]
          );
      } else {
          // Se não houver, navega para a tela de Login
          router.push('/LoginScreen');
      }
  };

  // --- Componente de renderização ---
  const RenderItemMesa = ({ item }) => {
    const estaLivre = item.status === 'livre';
    const estiloMesa = estaLivre ? styles.mesaLivre : styles.mesaOcupada;
    const estiloTexto = estaLivre ? styles.mesaLivreTexto : styles.mesaOcupadaTexto;

    return (
      <Pressable 
        style={[styles.mesaContainer, estiloMesa]} 
        onPress={() => selecionarMesa(item)}
      >
        <Text style={[styles.mesaNome, estiloTexto]}>{item.nome}</Text>
        <Text style={[styles.mesaStatus, estiloTexto]}>
          {estaLivre ? 'Disponível' : 'Ocupada'}
        </Text>
      </Pressable>
    );
  };

  // 5. RENDERIZAÇÃO CONDICIONAL
  if (isLoading && mesas.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#633A21" />
        <Text style={styles.loadingText}>A carregar mesas...</Text>
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
      
      {/* BOTÃO FLUTUANTE DE ACESSO À GERÊNCIA */}
      <Pressable style={styles.gerenciaButton} onPress={handleAcessoGerencia}>
          <FontAwesome 
              // Mostra 'sign-out' se estiver logado, 'sign-in' se for público
              name={usuarioLogado ? "sign-out" : "sign-in"} 
              size={20} 
              color="#FFFFFF" 
          />
      </Pressable>
      
      {isLoading && <ActivityIndicator style={styles.refreshIndicator} color="#633A21" />}
      
      <FlatList
        data={mesas}
        renderItem={RenderItemMesa}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>📍 Seleção de Mesas</Text>
            <Text style={styles.subtitle}>
                {usuarioLogado?.tipo === 'cliente' ? 
                    `Bem-vindo, ${usuarioLogado.dados.nome}!` : 
                    "Modo Público (Clique no ícone ➡️ para fazer login)"
                }
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 8 }}
        extraData={mesas} 
      />
    </SafeAreaView>
  );
}

// 6. ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16, color: '#5C4033' },
  errorText: { color: '#dc2626', textAlign: 'center' },
  refreshIndicator: { marginTop: 10 },
  header: { padding: 16, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3A2F1F' },
  subtitle: { fontSize: 16, color: '#5C4033', marginTop: 4 },
  
  gerenciaButton: {
    position: 'absolute',
    top: 50, 
    right: 20, 
    backgroundColor: '#633A21',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, 
    elevation: 5,
  },
  
  mesaContainer: {
    flex: 1, margin: 8, height: 120, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    padding: 12, shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 4,
  },
  mesaLivre: {
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#22c55e',
  },
  mesaLivreTexto: { color: '#166534' },
  mesaOcupada: {
    backgroundColor: '#d1d5db', opacity: 0.7,
  },
  mesaOcupadaTexto: { color: '#4b5563' },
  mesaNome: { fontSize: 18, fontWeight: '700' },
  statusTexto: { fontSize: 14, fontWeight: '500', marginTop: 4 },
});