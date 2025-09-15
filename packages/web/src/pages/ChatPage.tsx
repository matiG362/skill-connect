// src/pages/ChatPage.tsx
import { AppShell, Burger, Group, NavLink, Paper, Text, TextInput, ActionIcon, Box, Loader } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react'; // Import useRef
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { socket } from '../socket'; // Import our shared socket instance

const API_URL = 'http://localhost:3000';

// Define types for our data
interface User { id: number; email: string; }
interface Message { id: number; body: string; sender: User; conversationId: number; } // Added conversationId
interface Conversation { id: number; users: User[]; messages: Message[]; }

export const ChatPage = () => {
  const [opened, setOpened] = useState(false);
  const { user, token } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // --- Data Fetching and WebSocket Logic ---

  useEffect(() => {
    if (!token) return;

    // Connect to the WebSocket server
    socket.connect();

    // Define the event handler function
    const handleNewMessage = (message: Message) => {
      // Use a functional update to correctly add the new message
      if (message.conversationId === selectedConversation?.id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    // Set up the listener
    socket.on('newMessage', handleNewMessage);

    // Fetch the initial conversation list
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(response.data);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();

    // The cleanup function that runs when the component unmounts
    // or before the effect runs again. This is the key fix.
    return () => {
      socket.off('newMessage', handleNewMessage); // Remove the specific listener
      socket.disconnect(); // Disconnect the socket
    };
  }, [token, selectedConversation?.id]); // Re-run effect if the selected conversation changes

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (conversation: Conversation) => {
    // If there's a current room, leave it
    if (selectedConversation) {
        socket.emit('leaveRoom', String(selectedConversation.id));
    }
    
    setSelectedConversation(conversation);
    socket.emit('joinRoom', String(conversation.id));
    
    const response = await axios.get(`${API_URL}/chat/conversations/${conversation.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages(response.data);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation && user) {
      const payload = {
        conversationId: selectedConversation.id,
        senderId: user.sub,
        body: newMessage,
      };

      // 1. Emit the message to the server
      socket.emit('sendMessage', payload);

      // 2. Optimistically update our own UI immediately
      const optimisticMessage: Message = {
        id: Date.now(), // Use a temporary, unique key for React
        body: newMessage,
        conversationId: selectedConversation.id,
        sender: {
          id: user.sub,
          email: user.email,
        },
      };
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

      // 3. Clear the input field
      setNewMessage('');
    }
  };


  if (!user) return <Loader />;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={() => setOpened(!opened)} hiddenFrom="sm" size="sm" />
          <Text fw={700}>SkillConnect Chat</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Text mb="md" fw={500}>Conversations</Text>
        {loading && <Loader />}
        {conversations.map(convo => {
          const otherUser = convo.users.find(u => u.email !== user.email);
          return (
            <NavLink
              key={convo.id}
              label={otherUser?.email || 'Unknown User'}
              active={selectedConversation?.id === convo.id}
              onClick={() => handleSelectConversation(convo)}
            />
          );
        })}
      </AppShell.Navbar>

      <AppShell.Main>
        <Paper style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
          <Box style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? messages.map(msg => (
              <Paper
                key={msg.id} p="sm" mb="xs" radius="md" withBorder
                style={{
                  alignSelf: msg.sender.id === user.sub ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender.id === user.sub ? '#E6FFEA' : '#FFFFFF',
                  maxWidth: '70%',
                  marginLeft: msg.sender.id === user.sub ? 'auto' : '0',
                  marginRight: msg.sender.id === user.sub ? '0' : 'auto',
                }}
              >
                <Text size="sm" c="dimmed">{msg.sender.email}</Text>
                <Text>{msg.body}</Text>
              </Paper>
            )) : <Text ta="center" c="dimmed" mt="xl">Select a conversation to start chatting.</Text>}
            <div ref={messageEndRef} /> {/* Dummy div to scroll to */}
          </Box>

          <Group p="md" gap="sm" style={{ borderTop: '1px solid #e0e0e0' }}>
            <TextInput
              placeholder="Type a message..."
              style={{ flexGrow: 1 }}
              value={newMessage}
              onChange={(event) => setNewMessage(event.currentTarget.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') handleSendMessage() }}
              disabled={!selectedConversation}
            />
            <ActionIcon size="lg" variant="filled" onClick={handleSendMessage} disabled={!selectedConversation}>
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        </Paper>
      </AppShell.Main>
    </AppShell>
  );
};
