// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Box, Title, Button, Group, SimpleGrid, Card, Text, Loader, Alert } from '@mantine/core';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_URL = 'http://localhost:3000';

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
}

export const DashboardPage = () => {
  const { token } = useAuthStore();
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyServices = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/services/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMyServices(response.data);
      } catch (err) {
        setError('Failed to fetch your services.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyServices();
  }, [token]);

  // --- NEW FUNCTION TO HANDLE DELETION ---
  const handleDelete = async (serviceId: number) => {
    // A simple confirmation dialog
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`${API_URL}/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // On success, update the UI by filtering out the deleted service
        setMyServices((prevServices) =>
          prevServices.filter((service) => service.id !== serviceId)
        );
      } catch (error) {
        console.error('Failed to delete service:', error);
        // We will add a proper error notification here later
        setError('Failed to delete the service. Please try again.');
      }
    }
  };

  return (
    <Box p="md">
      <Group justify="space-between" mb="lg">
        <Title order={1}>My Dashboard</Title>
        <Button component={Link} to="/services/create">
          + Add New Service
        </Button>
      </Group>

      <Title order={3} mb="md">My Service Listings</Title>

      {loading && <Loader />}
      {error && <Alert color="red" title="Error" withCloseButton onClose={() => setError(null)}>{error}</Alert>}
      
      {!loading && !error && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {myServices.map((service) => (
            <Card shadow="sm" padding="lg" radius="md" withBorder key={service.id}>
              {/* Added a Group to align title and buttons */}
              <Group justify="space-between" mb="xs">
                <Title order={4}>{service.title}</Title>
              </Group>

              <Text size="sm" c="dimmed" mt="sm">{service.description}</Text>
              <Text mt="md" fw={700}>${service.price.toFixed(2)}</Text>
              
              {/* --- NEW BUTTON GROUP FOR ACTIONS --- */}
              <Group justify="flex-end" mt="md">
                <Button
                  variant="default"
                  size="xs"
                  component={Link}
                  to={`/services/edit/${service.id}`}
                >
                  Edit
                </Button>
                <Button
                  color="red"
                  size="xs"
                  onClick={() => handleDelete(service.id)}
                >
                  Delete
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {!loading && !error && myServices.length === 0 && (
          <Text>You have not created any services yet.</Text>
      )}
    </Box>
  );
};
