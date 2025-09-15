// src/payments/payments.service.ts
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { User } from '../../generated/prisma';
import { ChatGateway } from '../chat/chat.gateway';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DirectChargeDto } from './dto/direct-charge.dto';
import * as FormData from 'form-data';

@Injectable()
export class PaymentsService {
  private readonly chapaSecretKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private chatGateway: ChatGateway,
    private eventEmitter: EventEmitter2,
  ) {
    this.chapaSecretKey = this.config.get<string>('CHAPA_SECRET_KEY');
  }
// in src/payments/payments.service.ts

async initiateDirectCharge(dto: DirectChargeDto, buyer: User) {
    // 1. Correctly destructure all required fields from the DTO
    const { serviceId, phoneNumber, paymentMethod } = dto;

    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Service not found');

    const tx_ref = `skillconnect-charge-${serviceId}-${buyer.id}-${Date.now()}`;

    const transaction = await this.prisma.transaction.create({
        data: { tx_ref, amount: service.price, status: 'PENDING', serviceId, buyerId: buyer.id },
    });

    const formData = new FormData();
    formData.append('amount', service.price.toString());
    formData.append('currency', 'ETB');
    formData.append('email', buyer.email);
    formData.append('first_name', buyer.firstName || 'Anonymous');
    formData.append('last_name', buyer.lastName || 'User');
    formData.append('tx_ref', tx_ref);
    formData.append('mobile', phoneNumber);
    
    try {
        const response = await axios.post(
            // 2. Use backticks so the paymentMethod variable is correctly inserted
            `https://api.chapa.co/v1/charges?type=${paymentMethod}`, 
            formData,
            { 
                headers: { 
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${this.chapaSecretKey}` 
                }
            },
        );
        
        // 3. Correctly return the tx_ref and use backticks for the message
        return { 
            status: 'pending', 
            message: `Please approve the transaction on your phone via ${paymentMethod}.`,
            tx_ref: transaction.tx_ref
        };

    } catch (error) {
        console.error('Chapa direct charge failed:', error);
        throw new InternalServerErrorException('Failed to initiate direct charge');
    }
}
  async initializePayment(serviceId: number, buyer: User) {
    // 1. Find the service to be purchased
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // 2. Generate a unique transaction reference
    const tx_ref = `skillconnect-${serviceId}-${buyer.id}-${Date.now()}`;

    // 3. Create a PENDING transaction record in our database
    const transaction = await this.prisma.transaction.create({
      data: {
        tx_ref,
        amount: service.price,
        status: 'PENDING',
        serviceId: service.id,
        buyerId: buyer.id,
      },
    });

    // 4. Prepare the payload for Chapa
    const chapaPayload = {
      amount: service.price.toString(),
      currency: 'ETB',
      email: buyer.email,
      first_name: buyer.firstName || 'User',
      last_name: buyer.lastName || '',
      tx_ref: tx_ref,
      // New, correct version
      // Correct version
      return_url: `http://localhost:5173/payment/verify?tx_ref=${tx_ref}`, // Frontend URL
      // We will set up the real webhook callback_url later
      callback_url: `https://a2b82d6244dd.ngrok-free.app/payments/webhook`,
    };

    // 5. Make the API call to Chapa
    try {
      const response = await axios.post(
        'https://api.chapa.co/v1/transaction/initialize',
        chapaPayload,
        { headers: { Authorization: `Bearer ${this.chapaSecretKey}` } },
      );

      // 6. Return Chapa's response (which includes the checkout_url)
      return response.data;
    } catch (error) {
      console.error('Chapa initialization failed:', error.response?.data);
      throw new InternalServerErrorException('Failed to initialize payment');
    }
  }
async verifyPayment(tx_ref: string) {
  try {
    // 1. Verify payment with Chapa
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      { headers: { Authorization: `Bearer ${this.chapaSecretKey}` } },
    );

    const roomName = `transaction_${tx_ref}`;

    if (response.data.status === 'success') {
      // 2. Update transaction in DB
      const updatedTransaction = await this.prisma.transaction.update({
        where: { tx_ref },
        data: { status: 'SUCCESS' },
      });

      // 3. Broadcast once
      console.log(`✅ Broadcasting paymentSuccess to ${roomName}`);
      this.chatGateway.server.to(roomName).emit('paymentSuccess', updatedTransaction);

      return { status: 'success', data: updatedTransaction };
    } else {
      // Failed payment
      await this.prisma.transaction.update({
        where: { tx_ref },
        data: { status: 'FAILED' },
      });
      this.chatGateway.server.to(roomName).emit('paymentFailed', { tx_ref });

      return { status: 'failed' };
    }
  } catch (error) {
    console.error('❌ Chapa verification failed:', error.response?.data);
    throw new InternalServerErrorException('Payment verification failed');
  }
}

 async getPaymentStatus(tx_ref: string, userId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { tx_ref },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (transaction.buyerId !== userId) {
      throw new UnauthorizedException();
    }
    return { status: transaction.status };
  }
}
