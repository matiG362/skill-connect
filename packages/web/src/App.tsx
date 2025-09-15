// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { CreateServicePage } from './pages/CreateServicePage';
import { EditServicePage } from './pages/EditServicePage'; 
import { ProfilePage } from './pages/ProfilePage';
import { ChatPage } from './pages/ChatPage';
import { PaymentVerificationPage } from './pages/PaymentVerificationPage';

function RegisterPage() {
  return <h1>Register Page</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/payment/verify" element={<PaymentVerificationPage />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/services/create" element={<CreateServicePage />} /> 
            <Route path="/services/edit/:id" element={<EditServicePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chat" element={<ChatPage />} /> {/* 2. Add route */}
            <Route path="/chat/:conversationId" element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
