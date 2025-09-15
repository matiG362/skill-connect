// src/pages/EditServicePage.tsx
import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Button, Box, Group, Title, Textarea, NumberInput } from '@mantine/core';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

// Define the Service type to handle the string location
interface Service {
  title: string;
  description: string;
  price: number;
  location: string; // The backend returns location as 'POINT(lon lat)'
}

export const EditServicePage = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      price: 0,
      lat: 0,
      lon: 0,
    },
    validate: { /* ... validation rules ... */ },
  });

  // Fetch the service data when the component loads
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await axios.get<Service>(`${API_URL}/services/${id}`);
        const serviceData = response.data;
        
        // Parse the 'POINT(lon lat)' string from the database
        let lat = 0, lon = 0;
        if (serviceData.location) {
          const coords = serviceData.location.replace('POINT(', '').replace(')', '').split(' ');
          lon = parseFloat(coords[0]);
          lat = parseFloat(coords[1]);
        }
        
        form.setValues({ ...serviceData, lat, lon });
      } catch (error) {
        console.error('Failed to fetch service data:', error);
      }
    };
    fetchServiceData();
  }, [id]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await axios.patch(`${API_URL}/services/${id}`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  return (
    <Box maw={600} mx="auto" mt={50}>
      <Title order={2} ta="center" mb="lg">
        Edit Service
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Service Title" {...form.getInputProps('title')} />
        <Textarea label="Description" mt="md" minRows={4} {...form.getInputProps('description')} />
        <NumberInput label="Price ($)" mt="md" min={0} decimalScale={2} {...form.getInputProps('price')} />
        
        {/* Add the location inputs */}
        <Group grow mt="md">
          <NumberInput label="Latitude" decimalScale={4} {...form.getInputProps('lat')} />
          <NumberInput label="Longitude" decimalScale={4} {...form.getInputProps('lon')} />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button type="submit">Save Changes</Button>
        </Group>
      </form>
    </Box>
  );
};
