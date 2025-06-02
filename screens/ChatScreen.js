import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import io from 'socket.io-client';
import { DangerButton } from '../components/Buttons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const socketEndpoint = process.env.EXPO_PUBLIC_SOCKET_URL;

export default function ChatScreen() {
    const { user } = useAuth();

    const [hasConnection, setHasConnection] = useState(false);    

    const [userId, setUserId] = useState(null);    

    useEffect(() => {
        if (user) {
            setUserId(user.uid);
        }
    }, [user])

    const [contactId, setContactId] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [socket, setSocket] = useState(null);

    const [time, setTime] = useState(null);

    useEffect(() => {
        const newSocket = io(socketEndpoint, {
            transports: ['websocket'],
            query: { userId }
        })

        setSocket(newSocket);

        newSocket.on('connect',
            () => setHasConnection(true));
        newSocket.on('disconnect',
            () => setHasConnection(false));

        newSocket.on('time-msg', (data) => {
            setTime(new Date(data.time).toString());
        })

        newSocket.on('private-message', ({ from, message }) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { from, message, type: 'received' }
            ])
            console.log(from, ': ', message);
        })

        return () => {
            newSocket.disconnect();
            newSocket.removeAllListeners();
        }
    }, [])

    const sendMessage = () => {
        if(!contactId.trim() || !message.trim() || !socket) return;

        socket.emit('private-message', {
            to: contactId,
            message: message
        })

        setMessages((prevMessages) => [
            ...prevMessages,
            { from: 'Você', message, type: 'sent' }
        ])

        setMessage('');
    }

    if (!hasConnection) {
        return (
            <View style={styles.container}>
                <Text>Conectando...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <DangerButton
                text={'Sair da conta'}
                action={() => {
                    signOut(auth);
                }}
            />

            <Text style={styles.text}>Horário do Servidor</Text>
            <Text style={styles.text}>{time}</Text>

            <Text style={styles.text}>Seu ID: {userId}</Text>

            <Text style={styles.text}>ID do Contato</Text>
            <TextInput
                placeholder='Preencha'
                style={styles.input}
                value={contactId}
                onChangeText={setContactId}
            />

            <Text style={styles.text}>Mensagem</Text>
            <TextInput
                placeholder='Preencha uma mensagem'
                style={styles.input}
                value={message}
                onChangeText={setMessage}
            />

            <TouchableOpacity style={styles.button}
                onPress={sendMessage}
            >
                <Text style={styles.buttonText}>ENVIAR</Text>
            </TouchableOpacity>

            <FlatList
                data={messages}
                style={{ width: '100%' }}
                renderItem={({ item }) => (
                    <Text style={item.type == 'sent' ? styles.sentMessage : styles.receivedMessage}>
                        {item.type === 'sent' ? 'Você' : `De ${item.from}`}: {item.message}
                    </Text>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        // justifyContent: 'center',
        padding: 20,
        paddingTop: 60
    },
    text: {
        fontSize: 20,
        marginVertical: 10
    },
    input: {
        width: '100%',
        borderWidth: 1,
        padding: 10,
    },
    button: {
        backgroundColor: '#ccc',
        width: '100%',
        padding: 10,
        marginVertical: 15
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 18
    },
    sentMessage: {
        backgroundColor: "#DFF6FF",
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        alignSelf: 'flex-end'
    },
    receivedMessage: {
        backgroundColor: "#F1F1F1",
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        alignSelf: 'flex-start'
    },
});