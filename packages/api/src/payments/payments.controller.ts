// src/payments/payments.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get, Param} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '../../generated/prisma';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { DirectChargeDto } from './dto/direct-charge.dto';
import { ChapaGuard } from './guards/chapa.guard'; 

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  initialize(
    @Body() dto: InitializePaymentDto,
    @GetUser() buyer: User,
  ) {
    return this.paymentsService.initializePayment(dto.serviceId, buyer);
  }
  @Post('webhook')
  @UseGuards(ChapaGuard) 
  @HttpCode(HttpStatus.OK) // Always respond with 200 OK to Chapa
  handleWebhook(@Body() payload: any) {
    console.log('[Controller] ChapaGuard passed. Handling webhook for tx_ref:', payload.tx_ref);
    console.log('Webhook received!');
    console.log('Payload:', payload);

    // We received the notification, now we trigger the verification
    // In a real production app, you might add this to a queue for reliability
    if (payload.tx_ref) {
      this.paymentsService.verifyPayment(payload.tx_ref).catch(err => {
          // It's important to catch errors here so the webhook doesn't crash the server
          console.error(`Webhook verification failed for tx_ref: ${payload.tx_ref}`, err);
      });
    }
    
    // We don't wait for verification to finish. We just acknowledge receipt.
    return { status: 'received' };
  }
  @Get('status/:tx_ref')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getPaymentStatus(
    @Param('tx_ref') tx_ref: string,
    @GetUser('id') userId: number,
  ) {
    return this.paymentsService.getPaymentStatus(tx_ref, userId);
  }
  @Post('charge')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  directCharge(
    @Body() dto: DirectChargeDto,
    @GetUser() buyer: User,
  ) {
    return this.paymentsService.initiateDirectCharge(dto, buyer);
  }
}
