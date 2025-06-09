import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native';
import { collection, query, orderBy, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChatScreen() {
    const { user } = useAuth();
    const route = useRoute();
    const navigation = useNavigation();
    const { chatId } = route.params;

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!chatId) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [chatId]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
            from: user.email,
            text: message.trim(),
            timestamp: serverTimestamp()
        });

        setMessage('');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Conversa</Text>
            </View>

            <View style={styles.content}>
                <FlatList
                    data={messages}
                    keyExtractor={item => item.id}
                    style={{ width: '100%' }}
                    renderItem={({ item }) => (
                        <Text
                            style={item.from === user.email ? styles.sentMessage : styles.receivedMessage}
                        >
                            {item.from === user.email ? 'Você' : 'Contato'}: {item.text}
                        </Text>
                    )}
                />

                <TextInput
                    placeholder="Mensagem..."
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={sendMessage}
                >
                    <Text style={styles.buttonText}>Enviar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: '#172b4d',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%'
    },
    backButton: {
        color: 'white',
        fontSize: 24,
        marginRight: 10
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: '#fff'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    button: {
        backgroundColor: '#172b4d',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    sentMessage: {
        backgroundColor: '#d1e7dd',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        alignSelf: 'flex-end'
    },
    receivedMessage: {
        backgroundColor: '#f8d7da',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        alignSelf: 'flex-start'
    }
});