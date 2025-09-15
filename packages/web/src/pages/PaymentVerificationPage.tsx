import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Paper,
  Button,
  Center,
  Loader,
} from "@mantine/core";
import { IconCheck, IconX, IconQuestionMark } from "@tabler/icons-react";
import { socket } from "../socket";
import axios from "axios";
import { useAuthStore } from "../store/auth.store"; 

export const PaymentVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const tx_ref = useMemo(() => searchParams.get("tx_ref"), [searchParams]);

  const [status, setStatus] = useState<"PENDING" | "SUCCESS" | "FAILED">(
    "PENDING"
  );
  const token = useAuthStore((state) => state.token);

  // Function to manually verify payment via API
  const verifyPayment = async () => {
    try {
      console.log("🔍 Manually verifying payment for:", tx_ref);
      const { data } = await axios.get(
        `http://localhost:3000/payments/status/${tx_ref}`,
         { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.status === "SUCCESS") {
        console.log("✅ Payment verified via API:", data);
        setStatus("SUCCESS");
      } else {
        console.log("⏳ Payment still pending via API:", data);
        setTimeout(verifyPayment, 3000); // retry after 3s
      }
    } catch (err) {
      console.error("❌ Payment verification API failed:", err);
      setTimeout(verifyPayment, 5000); // retry after 5s
    }
  };

  useEffect(() => {
    if (!tx_ref) {
      console.error("❌ No tx_ref found in URL!");
      setStatus("FAILED");
      return;
    }

    console.log("🔎 PaymentVerificationPage mounted with tx_ref:", tx_ref);

    const onConnect = () => {
      console.log("⚡ Socket connected. Joining transaction room...");
      socket.emit("joinTransactionRoom", tx_ref);
    };

    const onJoinedRoom = (roomName: string) => {
      console.log(`✅ Successfully joined transaction room: ${roomName}`);
    };

    const onPaymentSuccess = (data: any) => {
      console.log("🎉 Payment success received via WebSocket:", data);
      setStatus("SUCCESS");
    };

    socket.on("connect", onConnect);
    socket.on("joinedTransactionRoom", onJoinedRoom);
    socket.on("paymentSuccess", onPaymentSuccess);

    if (!socket.connected) {
      console.log("🔄 Connecting to socket server...");
      socket.connect();
    } else {
      console.log("⚡ Already connected, joining room directly.");
      onConnect();
    }

    // Start fallback API verification
    verifyPayment();

    return () => {
      console.log("🧹 Cleaning up listeners...");
      socket.off("connect", onConnect);
      socket.off("joinedTransactionRoom", onJoinedRoom);
      socket.off("paymentSuccess", onPaymentSuccess);
      socket.emit("leaveRoom", `transaction_${tx_ref}`);
    };
  }, [tx_ref]);

  const renderContent = () => {
    switch (status) {
      case "SUCCESS":
        return {
          icon: <IconCheck size={50} color="teal" />,
          title: "Payment Successful!",
          message: "Thank you for your purchase 🎉",
        };
      case "FAILED":
        return {
          icon: <IconX size={50} color="red" />,
          title: "Payment Failed",
          message: "Something went wrong. Please try again.",
        };
      default:
        return {
          icon: <IconQuestionMark size={50} color="gray" />,
          title: "Payment Pending",
          message: "We are confirming your payment...",
        };
    }
  };

  const { icon, title, message } = renderContent();

  return (
    <Container py="xl">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Center>{icon}</Center>
        <Title ta="center" mt="md">
          {title}
        </Title>
        <Text c="dimmed" size="lg" ta="center" mt="sm">
          {message}
        </Text>

        {status === "PENDING" && (
          <Center mt="lg">
            <Loader color="blue" size="lg" />
          </Center>
        )}

        <Center mt="xl">
          <Button component={Link} to="/" variant="default">
            Back to Home
          </Button>
        </Center>
      </Paper>
    </Container>
  );
};
