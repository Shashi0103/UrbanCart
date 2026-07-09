import Stripe from 'stripe';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

// Initialize Stripe (handles fallback gracefully)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2023-10-16',
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId).populate('orderItems.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.product.title,
          images: item.product.images ? [item.product.images[0]] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents/paise
      },
      quantity: item.quantity,
    }));

    // Add delivery charges to line items if applicable
    if (order.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Delivery Charges',
          },
          unit_amount: Math.round(order.shippingPrice * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${order._id}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout?step=3`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    // If stripe is unconfigured or errors out, fallback to returning successful indicator for direct mock checkout
    res.status(500).json({ 
      message: 'Stripe configuration failed. Use fallback checkout confirmation.',
      error: error.message 
    });
  }
};

// @desc    Direct mock payment confirmation for testing & sandbox runs
// @route   POST /api/payments/confirm
// @access  Private
export const confirmOrderPayment = async (req, res) => {
  const { orderId, paymentIntentId } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: paymentIntentId || `mock_stripe_pi_${Date.now()}`,
      status: 'succeeded',
      email_address: req.user.email,
    };
    order.status = 'Confirmed';
    order.trackingHistory.push({ status: 'Confirmed', timestamp: new Date() });

    await order.save();

    // Create Payment log record
    await Payment.create({
      user: req.user._id,
      order: order._id,
      stripePaymentIntentId: order.paymentResult.id,
      amount: order.totalPrice,
      currency: 'inr',
      status: 'succeeded',
    });

    // Send real-time notification
    await Notification.create({
      user: req.user._id,
      title: 'Payment Successful',
      message: `Your payment of ₹${order.totalPrice} for Order #${order._id} was received.`,
      type: 'Payment',
    });

    res.json({ message: 'Order payment confirmed successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stripe Webhook Listener (Handles stripe webhook event calls)
// @route   POST /api/payments/webhook
// @access  Public
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // If webhook secret isn't provided, mock parsing for development
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      const payload = req.body;
      if (payload && payload.type === 'checkout.session.completed') {
        const session = payload.data.object;
        const orderId = session.metadata.orderId;
        const userId = session.metadata.userId;

        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: session.payment_intent || 'webhook_intent',
            status: 'succeeded',
            email_address: session.customer_details ? session.customer_details.email : 'stripe_webhook',
          };
          order.status = 'Confirmed';
          order.trackingHistory.push({ status: 'Confirmed', timestamp: new Date() });
          await order.save();

          await Payment.create({
            user: userId,
            order: order._id,
            stripePaymentIntentId: order.paymentResult.id,
            amount: order.totalPrice,
            currency: 'inr',
            status: 'succeeded',
          });

          await Notification.create({
            user: userId,
            title: 'Payment Received',
            message: `Your Stripe checkout payment for Order #${order._id} succeeded!`,
            type: 'Payment',
          });
        }
      }
      return res.status(200).send({ received: true, mock: true });
    }

    event = stripe.webhooks.constructEvent(
      req.body, // Expects raw buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    const userId = session.metadata.userId;

    try {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: session.payment_intent,
          status: 'succeeded',
          email_address: session.customer_details.email,
        };
        order.status = 'Confirmed';
        order.trackingHistory.push({ status: 'Confirmed', timestamp: new Date() });
        await order.save();

        await Payment.create({
          user: userId,
          order: order._id,
          stripePaymentIntentId: session.payment_intent,
          amount: order.totalPrice,
          currency: 'inr',
          status: 'succeeded',
        });

        await Notification.create({
          user: userId,
          title: 'Payment Successful',
          message: `Your checkout payment for Order #${order._id} was processed.`,
          type: 'Payment',
        });
      }
    } catch (error) {
      console.error('Webhook DB Update Error:', error);
      return res.status(500).send(error);
    }
  }

  res.json({ received: true });
};
