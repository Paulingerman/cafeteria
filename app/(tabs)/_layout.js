// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 
// 1. Importa o useAuth do caminho correto (sobe 2 níveis)
import { useAuth } from '../../context/AuthContext';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { usuarioLogado } = useAuth();
  
  const isGerente = usuarioLogado?.tipo === 'gerente';
  const isGarcom = usuarioLogado?.tipo === 'garcom';

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#633A21', 
      tabBarInactiveTintColor: '#9C9C9C', 
      headerShown: false,
      tabBarStyle: {
          backgroundColor: '#FDF9F3', 
          height: Platform.OS === 'ios' ? 90 : 60,
      },
    }}>
      
      {/* 1. ABA INICIAL: CARDÁPIO (Ficheiro: index.js) */}
      <Tabs.Screen
        name="index" 
        options={{ title: 'Cardápio', tabBarIcon: ({ color }) => <FontAwesome name="coffee" size={24} color={color} /> }}
      />

      {/* 2. ABA: MESAS (Ficheiro: mesas.js) */}
      <Tabs.Screen
        name="mesas" 
        options={{ title: 'Mesas', tabBarIcon: ({ color }) => <FontAwesome name="map-pin" size={24} color={color} /> }}
      />
      
      <Tabs.Screen
        name="historico" // Ficheiro: historico.js
        options={{ title: 'Histórico', tabBarIcon: ({ color }) => <FontAwesome name="list-alt" size={24} color={color} /> }}
      />

      {/* 3. ABAS DE GERÊNCIA (SÓ VISÍVEIS APÓS LOGIN) */}
      
      <Tabs.Screen
        name="clientes" // Ficheiro: clientes.js
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color }) => <FontAwesome name="users" size={24} color={color} />,
          href: isGarcom || isGerente ? '/(tabs)/clientes' : null 
        }}
      />

      <Tabs.Screen
        name="estoque" // Ficheiro: estoque.js
        options={{
          title: 'Estoque',
          tabBarIcon: ({ color }) => <FontAwesome name="cubes" size={24} color={color} />,
          href: isGerente ? '/(tabs)/estoque' : null 
        }}
      />
      
      <Tabs.Screen
        name="garcons" // Ficheiro: garcons.js
        options={{
          title: 'Garçons',
          tabBarIcon: ({ color }) => <FontAwesome name="id-badge" size={24} color={color} />,
          href: isGerente || isGarcom ? '/(tabs)/garcons' : null
        }}
      />
      
    </Tabs>
  );
}