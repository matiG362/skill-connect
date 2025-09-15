// src/pages/HomePage.tsx
import { useState } from 'react';
import axios from 'axios';
import { Container, Title, Text, SimpleGrid, Card, Loader, Alert, Box, Group, TextInput, NumberInput, Button } from '@mantine/core';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  distance_km?: number;
}

export const HomePage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [radius, setRadius] = useState('10');

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    // ... (this function is unchanged)
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Service[]>(`${API_URL}/services/search`, {
        params: { lat: parseFloat(lat), lon: parseFloat(lon), radius: parseFloat(radius) },
      });
      setServices(response.data);
    } catch (err) {
      setError('Failed to fetch services. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // --- NEW FUNCTION TO GET USER'S LOCATION ---
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(String(position.coords.latitude));
          setLon(String(position.coords.longitude));
          alert('Location found! You can now click Search.');
        },
        (err) => {
          console.error("Error getting location: ", err);
          alert('Could not get your location. Please enter it manually or check your browser permissions.');
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <Container py="xl">
      <Title order={1} mb="lg">Available Services</Title>
      
      <Box component="form" onSubmit={handleSearch} mb="xl" p="md" style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
        <Group align="flex-end">
          <TextInput
            label="Your Latitude"
            placeholder="e.g., 40.7128"
            value={lat}
            onChange={(event) => setLat(event.currentTarget.value)}
            required
          />
          <TextInput
            label="Your Longitude"
            placeholder="e.g., -74.0060"
            value={lon}
            onChange={(event) => setLon(event.currentTarget.value)}
            required
          />
          <NumberInput
            label="Radius (km)"
            value={Number(radius)}
            onChange={(value) => setRadius(String(value))}
            min={1}
            required
          />
          {/* --- NEW BUTTON --- */}
          <Button
            variant="outline"
            onClick={handleGetLocation}
            type="button" // Important to prevent form submission
          >
            Use My Location
          </Button>
          <Button type="submit">Search</Button>
        </Group>
      </Box>

      {/* ... (rest of the component is unchanged) ... */}
      {loading && <Loader />}
      {error && <Alert color="red" title="Error">{error}</Alert>}
      {!loading && !error && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {services.map((service) => (
            <Link to={`/services/${service.id}`} key={service.id} style={{ textDecoration: 'none' }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
                <Group justify="space-between">
                  <Title order={3}>{service.title}</Title>
                  {service.distance_km && (
                    <Text size="sm" c="dimmed">{service.distance_km.toFixed(1)} km away</Text>
                  )}
                </Group>
                <Text mt="md">{service.description}</Text>
                <Text mt="lg" fw={700}>${service.price.toFixed(2)}</Text>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};
