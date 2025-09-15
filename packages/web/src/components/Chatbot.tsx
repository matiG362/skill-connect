// src/components/Chatbot.tsx
import { useState } from 'react';
import { Box, Paper, Title, ActionIcon, TextInput, Text, ScrollArea, Group } from '@mantine/core';
import { IconMessageChatbot, IconSend, IconX } from '@tabler/icons-react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hello! How can I help you today?' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/dialogflow/query`, {
        text: inputValue,
      });
      
      const botMessage: Message = {
        sender: 'bot',
        text: response.data.fulfillmentText,
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Error querying Dialogflow:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <ActionIcon
        size="xl"
        radius="xl"
        variant="filled"
        color="blue"
        onClick={() => setIsOpen(true)}
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
      >
        <IconMessageChatbot size={24} />
      </ActionIcon>
    );
  }

  return (
    <Paper
      shadow="md"
      p="md"
      radius="md"
      withBorder
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      <Group justify="space-between" mb="md">
        <Title order={4}>SkillConnect Bot</Title>
        <ActionIcon variant="transparent" onClick={() => setIsOpen(false)}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
      
      <ScrollArea style={{ flex: 1 }} type="auto">
        {messages.map((msg, index) => (
          <Box key={index} mb="sm">
            <Text
              p="xs"
              radius="md"
              bg={msg.sender === 'bot' ? 'gray.1' : 'blue.5'}
              c={msg.sender === 'bot' ? 'black' : 'white'}
              style={{ float: msg.sender === 'user' ? 'right' : 'left', clear: 'both', maxWidth: '80%' }}
            >
              {msg.text}
            </Text>
          </Box>
        ))}
        {loading && <Text size="sm" c="dimmed">Bot is typing...</Text>}
      </ScrollArea>

      <Group gap="sm" mt="md">
        <TextInput
          placeholder="Ask a question..."
          style={{ flex: 1 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <ActionIcon onClick={handleSendMessage} disabled={loading}>
          <IconSend size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  );
};
