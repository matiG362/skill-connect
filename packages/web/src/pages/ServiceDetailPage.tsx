// src/pages/ServiceDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Title, Text, Loader, Alert, Paper, Button, Group, Box, TextInput, Stack } from '@mantine/core';
import { useAuthStore } from '../store/auth.store';
import { socket } from '../socket';
// NO shallow import needed

const API_URL = 'http://localhost:3000';

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
}
interface Review {
  id: number;
  rating: number;
  comment: string;
  author: {
    firstName: string | null;
  };
}

export const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]); 

  // --- THIS IS THE CORRECTED PART ---
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [currentTxRef, setCurrentTxRef] = useState<string | null>(null);
  const navigate = useNavigate();
 
 useEffect(() => {
  const fetchServiceAndReviews = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // Use Promise.all to fetch both in parallel
      const [serviceRes, reviewsRes] = await Promise.all([
        axios.get(`${API_URL}/services/${id}`),
        axios.get(`${API_URL}/services/${id}/reviews`),
      ]);
      setService(serviceRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      setError('Failed to fetch service details.');
    } finally {
      setLoading(false);
    }
  };
  fetchServiceAndReviews();
}, [id]);

 useEffect(() => {
    if (!currentTxRef) return; // Only run this effect if a transaction has been started

    const handlePaymentSuccess = (data: { tx_ref: string }) => {
      if (data.tx_ref === currentTxRef) {
        // Navigate to the verification page, passing the status and tx_ref
        navigate(`/payment/verify?status=success&tx_ref=${data.tx_ref}`);
      }
    };
    
    const onConnect = () => {
        const roomName = `transaction_${currentTxRef}`;
        socket.emit('joinRoom', roomName);
        console.log(`Socket connected, joined room: ${roomName}`);
    }

    socket.on('paymentSuccess', handlePaymentSuccess);
    socket.on('connect', onConnect);
    
    if (!socket.connected) {
      socket.connect();
    } else {
      // If already connected, just join the room
      onConnect();
    }
    
    // Cleanup function
    return () => {
      const roomName = `transaction_${currentTxRef}`;
      socket.emit('leaveRoom', roomName);
      socket.off('paymentSuccess', handlePaymentSuccess);
      socket.off('connect', onConnect);
      // We don't disconnect here, as the ChatPage might be using the connection
    };
  }, [currentTxRef]);

  const handleRedirectPayment = async () => {
    if (!service) return;
    try {
      const response = await axios.post(`${API_URL}/payments/initialize`, 
        { serviceId: service.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.data?.checkout_url) {
        window.location.href = response.data.data.checkout_url;
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Could not start payment process. Please try again.');
    }
  };
  
// Updated handleDirectCharge function in ServiceDetailPage.tsx
const handleDirectCharge = async (paymentMethod: string) => {
  if (!service || !phoneNumber) {
    alert('Please enter your phone number first.');
    return;
  }
  
  setPaymentStatus(`Initiating ${paymentMethod} payment...`);
  try {
    const response = await axios.post(
      `${API_URL}/payments/charge`, 
      { serviceId: service.id, phoneNumber, paymentMethod }, // Send the payment method
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.data.tx_ref) {
      setCurrentTxRef(response.data.tx_ref);
    }
    setPaymentStatus(response.data.message);
  } catch (error) {
    console.error('Direct charge failed:', error);
    setPaymentStatus('Failed to start payment. Please try again.');
  }
};

  if (loading) return <Loader style={{ margin: 'auto' }} />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  if (!service) return <Text>Service not found.</Text>;

 return (
    <Container py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={1} mb="lg">{service.title}</Title>
        <Text size="lg" mb="md">{service.description}</Text>
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700} c="teal">${service.price.toFixed(2)}</Text>
          {isAuthenticated && (
            <Button onClick={handleRedirectPayment}>
              Pay with Chapa (Redirect)
            </Button>
          )}
        </Group>

        {isAuthenticated && (
          <Box mt="xl" pt="xl" style={{ borderTop: '1px solid #e9ecef' }}>
            <Title order={4} ta="center">Or Pay Directly</Title>
            {/* The form was missing from your code, I've re-added it */}
            <Box mt="md">
              <TextInput
                label="Enter Your Phone Number"
                placeholder="0912345678"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.currentTarget.value)}
                required
              />
              <Group grow mt="md">
                <Button onClick={() => handleDirectCharge('telebirr')}>
                  Pay with Telebirr
                </Button>
                <Button onClick={() => handleDirectCharge('cbebirr')} color="purple">
                  Pay with CBE Birr
                </Button>
              </Group>
              {paymentStatus && <Text ta="center" mt="sm" c="blue">{paymentStatus}</Text>}
            </Box>
          </Box>
        )}
        
        <Box mt="xl" pt="xl" style={{ borderTop: '1px solid #e9ecef' }}>
          <Title order={3} mb="lg">Reviews</Title>
          {reviews.length > 0 ? (
            <Stack>
              {reviews.map((review) => (
                <Paper withBorder p="md" radius="md" key={review.id}>
                  <Group>
                    <Text fw={700}>Rating: {review.rating}/5</Text>
                    <Text c="dimmed">by {review.author.firstName || 'Anonymous'}</Text>
                  </Group>
                  <Text mt="xs">{review.comment}</Text>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Text>No reviews yet.</Text>
          )}
        </Box>
      </Paper>
    </Container>
  );
};
