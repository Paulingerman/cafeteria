// app/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { loginUsuario } from '../api'; // ✅ CORREÇÃO: Usa 'loginUsuario'

export default function LoginScreen() {
  
  const { setUsuarioLogado } = useAuth();
  const router = useRouter();
  
  const SENHA_FIXA_PROTOTIPO = '123'; 

  const [modalClienteVisible, setModalClienteVisible] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  
  const [modalGarcomVisible, setModalGarcomVisible] = useState(false);
  const [modalGerenteVisible, setModalGerenteVisible] = useState(false);
  const [nomeGarcom, setNomeGarcom] = useState('');
  // ✅ CORREÇÃO: Adiciona os estados que faltavam (erro de 'setSenhaGarcom is not defined')
  const [senhaGarcom, setSenhaGarcom] = useState(SENHA_FIXA_PROTOTIPO); 
  const [senhaGerente, setSenhaGerente] = useState(SENHA_FIXA_PROTOTIPO); 
  
  const [isLoadingGarcom, setIsLoadingGarcom] = useState(false);
  const [isLoadingGerente, setIsLoadingGerente] = useState(false);

  // 1. Função para login como Cliente (USANDO MODAL)
  const handleClienteLogin = () => {
    const nome = nomeCliente?.trim() || 'Cliente Anônimo';
    setUsuarioLogado({ tipo: 'cliente', dados: { nome: nome } });
    
    setModalClienteVisible(false);
    setNomeCliente('');
    
    // ✅ NAVEGAÇÃO CLIENTE: Vai para a raiz das abas (Cardápio)
    router.replace('/(tabs)'); 
  };
  
  // 2. Função para login como Garçom
  const handleGarcomLogin = async () => {
    if (!nomeGarcom.trim()) { Alert.alert('Erro', 'Digite o nome do garçom.'); return; }
    
    setIsLoadingGarcom(true);
    try {
      // ✅ CORREÇÃO: Chama 'loginUsuario'
      const usuario = await loginUsuario(nomeGarcom, senhaGarcom, 'garcom'); 
      
      setUsuarioLogado({ tipo: 'garcom', dados: usuario });
      setModalGarcomVisible(false);
      setNomeGarcom('');
      setSenhaGarcom(SENHA_FIXA_PROTOTIPO); 

      // ✅ NAVEGAÇÃO GARÇOM: Vai para a Gestão de Clientes
      router.replace('/(tabs)/clientes'); 

    } catch (error) {
      Alert.alert('Erro', error.message || 'Nome incorreto ou falha de conexão.');
    } finally {
      setIsLoadingGarcom(false);
    }
  };

  // 3. Função para login como Gerente
  const handleGerenteLogin = async () => {
    if (senhaGerente !== SENHA_FIXA_PROTOTIPO) {
      Alert.alert('Erro', 'Senha do gerente incorreta.');
      return;
    }
    
    setIsLoadingGerente(true);
    try {
      // ✅ CORREÇÃO: Chama 'loginUsuario'
      const usuario = await loginUsuario('Administrador', SENHA_FIXA_PROTOTIPO, 'gerente'); 
      
      setUsuarioLogado({ tipo: 'gerente', dados: usuario });
      setModalGerenteVisible(false);
      setSenhaGerente(SENHA_FIXA_PROTOTIPO);
      
      // ✅ NAVEGAÇÃO GERENTE: Vai para a Gestão de Estoque
      router.replace('/(tabs)/estoque'); 
      
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha de conexão.');
    } finally {
      setIsLoadingGerente(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FontAwesome name="coffee" size={60} color="#633A21" style={styles.icon} />
        <Text style={styles.title}>Bem-vindo à Cafeteria</Text>
        <Text style={styles.subtitle}>Escolha como deseja acessar:</Text>

        <Pressable style={styles.button} onPress={() => setModalClienteVisible(true)}>
          <FontAwesome name="user" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Entrar como Cliente</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => setModalGarcomVisible(true)}>
          <FontAwesome name="id-badge" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Entrar como Garçom</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => setModalGerenteVisible(true)}>
          <FontAwesome name="briefcase" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Entrar como Gerente</Text>
        </Pressable>
      </View>

      {/* MODAL PARA CLIENTE */}
      <Modal visible={modalClienteVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Entrar como Cliente</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome (Opcional)"
              value={nomeCliente}
              onChangeText={setNomeCliente}
              autoCapitalize="words"
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setModalClienteVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={handleClienteLogin}>
                <Text style={styles.confirmText}>Entrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Garçom */}
      <Modal visible={modalGarcomVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Login como Garçom</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome (Ex: Ana Silva)"
              value={nomeGarcom}
              onChangeText={setNomeGarcom}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha (123)"
              secureTextEntry
              value={senhaGarcom}
              onChangeText={setSenhaGarcom} // Permite que o usuário digite
            />
            {isLoadingGarcom ? (
              <ActivityIndicator size="large" color="#633A21" />
            ) : (
              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelButton} onPress={() => setModalGarcomVisible(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.confirmButton} onPress={handleGarcomLogin}>
                  <Text style={styles.confirmText}>Entrar</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para Gerente */}
      <Modal visible={modalGerenteVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Login como Gerente</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha (123)"
              secureTextEntry
              value={senhaGerente}
              onChangeText={setSenhaGerente}
            />
            {isLoadingGerente ? (
              <ActivityIndicator size="large" color="#633A21" />
            ) : (
              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelButton} onPress={() => setModalGerenteVisible(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.confirmButton} onPress={handleGerenteLogin}>
                  <Text style={styles.confirmText}>Entrar</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3', justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', padding: 20 },
  icon: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#3A2F1F', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#5C4033', marginBottom: 40 },
  button: {
    backgroundColor: '#633A21',
    paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10,
    marginVertical: 10, width: 250, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
  },
  buttonIcon: { marginRight: 10 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 10, width: 300, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#3A2F1F', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#EFEBE4', padding: 10, marginBottom: 15, borderRadius: 5, width: '100%' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cancelButton: { backgroundColor: '#9C9C9C', padding: 10, borderRadius: 5, flex: 1, marginRight: 10 },
  cancelText: { color: '#FFFFFF', textAlign: 'center' },
  confirmButton: { backgroundColor: '#633A21', padding: 10, borderRadius: 5, flex: 1 },
  confirmText: { color: '#FFFFFF', textAlign: 'center' },
});