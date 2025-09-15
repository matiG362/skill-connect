// src/pages/CreateServicePage.tsx
import { useForm } from '@mantine/form';
import { TextInput, Button, Box, Group, Title, Textarea, NumberInput } from '@mantine/core';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export const CreateServicePage = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      price: 0,
      lat: 0, // <-- Add latitude
      lon: 0, // <-- Add longitude
    },
    validate: {
      title: (value) => (value.length > 0 ? null : 'Title is required'),
      description: (value) => (value.length > 0 ? null : 'Description is required'),
      price: (value) => (value >= 0 ? null : 'Price must be a positive number'),
      // Add validation for lat/lon
      lat: (value) => (value >= -90 && value <= 90 ? null : 'Invalid latitude'),
      lon: (value) => (value >= -180 && value <= 180 ? null : 'Invalid longitude'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await axios.post(`${API_URL}/services`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  };

  return (
    <Box maw={600} mx="auto" mt={50}>
      <Title order={2} ta="center" mb="lg">
        Create a New Service
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          withAsterisk
          label="Service Title"
          placeholder="e.g., Professional Dog Walking"
          {...form.getInputProps('title')}
        />
        <Textarea
          withAsterisk
          label="Description"
          placeholder="Describe the service you are offering..."
          mt="md"
          minRows={4}
          {...form.getInputProps('description')}
        />
        <NumberInput
          withAsterisk
          label="Price ($)"
          placeholder="e.g., 25.50"
          mt="md"
          min={0}
          decimalScale={2}
          {...form.getInputProps('price')}
        />
        
        {/* --- ADD THESE NEW INPUTS --- */}
        <Group grow mt="md">
            <NumberInput
                withAsterisk
                label="Latitude"
                placeholder="e.g., 40.7128"
                decimalScale={4}
                {...form.getInputProps('lat')}
            />
            <NumberInput
                withAsterisk
                label="Longitude"
                placeholder="e.g., -74.0060"
                decimalScale={4}
                {...form.getInputProps('lon')}
            />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button type="submit">Create Service</Button>
        </Group>
      </form>
    </Box>
  );
};
