// src/pages/LoginPage.tsx
import { useForm } from '@mantine/form';
import { TextInput, Button, Box, Group, Title } from '@mantine/core';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export const LoginPage = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, values);
      const { access_token } = response.data;
      if (access_token) {
        setToken(access_token);
        // We will add notifications later with Mantine's system
        console.log('Login Successful.');
        navigate('/');
      }
    } catch (error) {
      console.error('Login Failed.', error);
      // We will add notifications later
    }
  };

  return (
    <Box maw={400} mx="auto" mt={100}>
      <Title order={2} ta="center" mb="lg">
        Log In
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          withAsterisk
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
        />
        <TextInput
          withAsterisk
          label="Password"
          type="password"
          placeholder="Your password"
          mt="md"
          {...form.getInputProps('password')}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Log In</Button>
        </Group>
      </form>
    </Box>
  );
};
