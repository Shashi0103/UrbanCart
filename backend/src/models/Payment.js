import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  stripePaymentIntentId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'usd' },
  status: { type: String, required: true }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
