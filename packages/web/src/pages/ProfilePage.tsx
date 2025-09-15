import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Button, Box, Group, Title } from '@mantine/core';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export const ProfilePage = () => {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await axios.patch(`${API_URL}/users/me`, {
        firstName: values.firstName,
        lastName: values.lastName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert('Profile updated successfully!');
      navigate('/dashboard');

    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <Box maw={600} mx="auto" mt={50}>
      <Title order={2} ta="center" mb="lg">My Profile</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Email" disabled {...form.getInputProps('email')} />
        <TextInput label="First Name" mt="md" {...form.getInputProps('firstName')} />
        <TextInput label="Last Name" mt="md" {...form.getInputProps('lastName')} />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Update Profile</Button>
        </Group>
      </form>
    </Box>
  );
};
