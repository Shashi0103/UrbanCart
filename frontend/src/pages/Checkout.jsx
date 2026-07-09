import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice.js';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { 
  MapPin, 
  Truck, 
  CreditCard, 
  Eye, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  CircleDot,
  Lock
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { token, user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);

  // Active step (1: Shipping, 2: Delivery, 3: Payment, 4: Review, 5: Confirmation)
  const [step, setStep] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Step 1: Address selection states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddressForm, setNewAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');

  // Step 2: Delivery method state
  const [deliveryMethod, setDeliveryMethod] = useState('standard'); // standard, express, cod

  // Step 3: Payment form states
  const [paymentMethod, setPaymentMethod] = useState('Stripe'); // Stripe, COD
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState('Securing connection...');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Sync saved addresses on load if logged in
  useEffect(() => {
    if (!token) {
      dispatch(addToast({ text: 'Please login to checkout', type: 'warning' }));
      navigate('/login?redirect=checkout');
      return;
    }

    if (cart.items.length === 0 && step < 5) {
      navigate('/cart');
      return;
    }

    apiService.users.getAddresses()
      .then((addrs) => {
        setAddresses(addrs);
        const def = addrs.find(a => a.isDefault);
        if (def) setSelectedAddress(def);
        else if (addrs.length > 0) setSelectedAddress(addrs[0]);
      })
      .catch(err => console.error(err));
  }, [token, cart.items, navigate, dispatch]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode) return;

    try {
      const updatedAddrs = await apiService.users.addAddress({
        street, city, state, postalCode, country, isDefault: addresses.length === 0
      });
      setAddresses(updatedAddrs);
      setSelectedAddress(updatedAddrs[updatedAddrs.length - 1]);
      setNewAddressForm(false);
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      dispatch(addToast({ text: 'Address added successfully', type: 'success' }));
    } catch (err) {
      console.error(err);
      dispatch(addToast({ text: 'Failed to add address', type: 'error' }));
    }
  };

  const nextStep = () => setStep(prev => Math.min(5, prev + 1));
  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  // Step 4 logic: Submit Order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      dispatch(addToast({ text: 'Please select a shipping address', type: 'warning' }));
      setStep(1);
      return;
    }

    setIsProcessingPayment(true);
    setPaymentSuccess(false);
    setPaymentStatusText('Securing encrypted connection...');
    
    try {
      // Calculate delivery surcharge
      const extraShippingFee = deliveryMethod === 'express' ? 200.00 : 0.00;
      const shippingPrice = cart.shippingPrice + extraShippingFee;
      const totalPrice = parseFloat((cart.totalPrice + extraShippingFee).toFixed(2));

      // 1. Create pending order in DB
      const orderData = {
        orderItems: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.product.price * (1 - (item.product.discountPercentage || 0) / 100)
        })),
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country
        },
        paymentMethod: deliveryMethod === 'cod' ? 'Cash on Delivery' : 'Stripe',
        itemsPrice: cart.itemsPrice,
        taxPrice: cart.taxPrice,
        shippingPrice: shippingPrice,
        totalPrice: totalPrice
      };

      const order = await apiService.orders.create(orderData);

      let finalOrder = order;
      if (deliveryMethod === 'cod') {
        await new Promise(resolve => {
          setTimeout(() => {
            setPaymentStatusText('Finalizing order records...');
            resolve();
          }, 1200);
        });
      } else {
        await new Promise(resolve => {
          setTimeout(() => {
            setPaymentStatusText('Authorizing card transaction...');
            resolve();
          }, 800);
        });

        await new Promise(resolve => {
          setTimeout(() => {
            setPaymentStatusText('Verifying with bank networks...');
            resolve();
          }, 800);
        });

        // Stripe credit card fallback (directly confirm payment via mock API)
        const paymentResult = await apiService.payments.confirmMock(
          order._id,
          `mock_pi_stripe_${Date.now()}`
        );
        finalOrder = paymentResult.order;

        await new Promise(resolve => {
          setTimeout(() => {
            setPaymentStatusText('Payment authorized! Creating invoice...');
            resolve();
          }, 800);
        });
      }

      // Show Stripe Success Checkmark Animation!
      setPaymentSuccess(true);
      setPaymentStatusText('Payment Successful!');
      
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 1800);
      });

      setPlacedOrder(finalOrder);
      dispatch(clearCart());
      setStep(5);
      dispatch(addToast({ text: 'Order placed successfully!', type: 'success' }));
    } catch (err) {
      console.error(err);
      dispatch(addToast({ text: 'Order processing failed', type: 'error' }));
    } finally {
      setIsProcessingPayment(false);
      setPaymentSuccess(false);
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* Full-screen Premium Payment Processing Animation */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center select-none text-center">
          <div className="relative flex flex-col items-center justify-center p-8 bg-[#1A1F2C] border border-slate-800 rounded-2xl max-w-sm mx-4 flat-shadow animate-scale-up">
            
            {paymentSuccess ? (
              /* Stripe Success checkmark wrapper */
              <div className="w-24 h-24 mb-8 flex items-center justify-center">
                <svg className="w-20 h-20 text-green-500" viewBox="0 0 52 52">
                  <circle 
                    className="stroke-green-500 fill-none animate-circle" 
                    cx="26" cy="26" r="25" 
                    strokeWidth="3"
                  />
                  <path 
                    className="stroke-green-500 fill-none animate-checkmark" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8" 
                  />
                </svg>
              </div>
            ) : (
              /* Spinning & Pulsing Card Graphic */
              <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-75" />
                {/* Inner glowing spinner */}
                <div className="absolute inset-2 rounded-full border-t-2 border-l-2 border-primary animate-spin" />
                
                {/* Rotating Credit Card Graphic */}
                <div className="w-14 h-9 bg-gradient-to-tr from-primary to-[#FF6B6B] rounded-md flex flex-col justify-between p-1.5 shadow-xl relative animate-pulse">
                  {/* Gold chip */}
                  <div className="w-3 h-2.5 bg-amber-400/90 rounded-[2px]" />
                  {/* Card lines */}
                  <div className="space-y-0.5 mt-1">
                    <div className="w-8 h-1 bg-white/40 rounded-full" />
                    <div className="w-5 h-1 bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Glowing Text Indicators */}
            <h3 className="text-white font-bold text-lg tracking-tight mb-2">
              {paymentSuccess ? 'Order Confirmed' : 'Processing Payment'}
            </h3>
            <p className="text-primary/95 text-sm font-semibold animate-pulse h-6">
              {paymentStatusText}
            </p>
            <p className="text-gray-400 text-[10px] mt-4 max-w-[200px] leading-relaxed">
              Please do not refresh the page or close your browser session.
            </p>
          </div>
        </div>
      )}

      <Breadcrumbs paths={[{ name: 'Home', url: '/' }, { name: 'Checkout', url: '/checkout' }]} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Step Indicators */}
        <div className="mb-8 flex justify-between text-xs font-bold text-gray-400 select-none">
          {['Shipping', 'Delivery', 'Payment', 'Review', 'Confirm'].map((name, idx) => {
            const currentIdx = idx + 1;
            const isCompleted = step > currentIdx;
            const isActive = step === currentIdx;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted ? 'bg-primary border-primary text-secondary' : 
                  isActive ? 'border-primary text-primary bg-primary/5' : 'border-slate-200 bg-white'
                }`}>
                  {isCompleted ? '✓' : currentIdx}
                </div>
                <span className={isActive || isCompleted ? 'text-gray-900' : ''}>{name}</span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: Shipping Address Selection */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flat-shadow space-y-6">
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 select-none">
              <MapPin className="w-5 h-5 text-primary" /> Select Shipping Address
            </h2>

            {/* Address cards list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`border p-4 rounded-xl cursor-pointer transition-all flex justify-between items-start ${
                    selectedAddress?._id === addr._id 
                      ? 'border-primary ring-2 ring-primary/5 bg-primary/5' 
                      : 'border-slate-200 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                      {addr.isDefault && <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded uppercase">Default</span>}
                      Delivery Point
                    </p>
                    <p className="text-xs text-gray-600 font-medium">{addr.street}</p>
                    <p className="text-xs text-gray-400 font-medium">{addr.city}, {addr.state} - {addr.postalCode}</p>
                    <p className="text-xs text-gray-400 font-medium">{addr.country}</p>
                  </div>
                  <CircleDot className={`w-4 h-4 shrink-0 ${selectedAddress?._id === addr._id ? 'text-primary' : 'text-slate-300'}`} />
                </div>
              ))}
            </div>

            {/* Toggle Add New Address form */}
            {!newAddressForm ? (
              <button
                onClick={() => setNewAddressForm(true)}
                className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="123 Main St..."
                    className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                  />
                </div>
                <div className="col-span-2 flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setNewAddressForm(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-secondary px-5 py-2 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={nextStep}
                disabled={!selectedAddress}
                className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/95 disabled:bg-slate-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Delivery Method <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Delivery Method Selection */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flat-shadow space-y-6">
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 select-none">
              <Truck className="w-5 h-5 text-primary" /> Select Delivery Option
            </h2>

            <div className="space-y-4">
              {/* Standard */}
              <div
                onClick={() => setDeliveryMethod('standard')}
                className={`border p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                  deliveryMethod === 'standard' ? 'border-primary ring-2 ring-primary/5 bg-primary/5' : 'border-slate-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex gap-3">
                  <CircleDot className={`w-5 h-5 shrink-0 ${deliveryMethod === 'standard' ? 'text-primary' : 'text-slate-300'}`} />
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Standard Delivery</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Delivery in 3-5 business days.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">{cart.shippingPrice === 0 ? 'FREE' : `₹${cart.shippingPrice}`}</span>
              </div>

              {/* Express */}
              <div
                onClick={() => setDeliveryMethod('express')}
                className={`border p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                  deliveryMethod === 'express' ? 'border-primary ring-2 ring-primary/5 bg-primary/5' : 'border-slate-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex gap-3">
                  <CircleDot className={`w-5 h-5 shrink-0 ${deliveryMethod === 'express' ? 'text-primary' : 'text-slate-300'}`} />
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Express Next-Day Shipping</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Express delivery within 24 hours.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">₹{(cart.shippingPrice + 200).toFixed(2)}</span>
              </div>

              {/* Cash On Delivery */}
              <div
                onClick={() => setDeliveryMethod('cod')}
                className={`border p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                  deliveryMethod === 'cod' ? 'border-primary ring-2 ring-primary/5 bg-primary/5' : 'border-slate-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex gap-3">
                  <CircleDot className={`w-5 h-5 shrink-0 ${deliveryMethod === 'cod' ? 'text-primary' : 'text-slate-300'}`} />
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Cash on Delivery (COD)</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Pay in cash when package arrives.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">FREE</span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Shipping Address
              </button>
              <button
                onClick={nextStep}
                className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flat-shadow space-y-6">
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 select-none">
              <CreditCard className="w-5 h-5 text-primary" /> Credit Card Details
            </h2>

            {deliveryMethod === 'cod' ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center text-green-800 select-none">
                <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-base">Cash on Delivery Selected</h3>
                <p className="text-xs mt-1 text-green-700">No advance payment card required. Click review to confirm order placement.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl text-xs flex flex-col gap-1.5 select-none">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-bold">Stripe Sandbox Mode Enabled</span>
                  </div>
                  <p className="text-[11px] text-blue-700/90 leading-relaxed font-medium">
                    You can enter any dummy/mock credit card credentials to proceed (e.g., Card Number: <strong>4242 4242 4242 4242</strong>, Expiry: <strong>12/29</strong>, CVC: <strong>123</strong>). No real charges will be made.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Card Holder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        required
                        placeholder="•••"
                        maxLength={3}
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value)}
                        className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Delivery Option
              </button>
              <button
                onClick={nextStep}
                disabled={deliveryMethod !== 'cod' && (!cardName || !cardNumber || !cardExpiry || !cardCVC)}
                className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/95 disabled:bg-slate-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Review Order <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review Order */}
        {step === 4 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flat-shadow space-y-6">
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 select-none">
              <Eye className="w-5 h-5 text-primary" /> Review Order Details
            </h2>

            <div className="space-y-4 text-xs">
              
              {/* Address review */}
              <div className="border border-slate-100 rounded-xl p-4 space-y-1">
                <h3 className="font-bold text-gray-900">Shipping Address</h3>
                <p className="text-gray-600 font-medium">{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}</p>
                <p className="text-gray-500 font-medium">{selectedAddress.country}</p>
              </div>

              {/* Delivery info review */}
              <div className="border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">Delivery Speed</h3>
                  <p className="text-gray-500 mt-0.5 uppercase tracking-wider font-semibold">
                    {deliveryMethod === 'standard' ? 'Standard Delivery' : 
                     deliveryMethod === 'express' ? 'Express 24H Shipping' : 'Cash on Delivery'}
                  </p>
                </div>
                <span className="font-bold text-gray-800">
                  {deliveryMethod === 'express' ? `₹${(cart.shippingPrice + 200).toFixed(2)}` : 
                   deliveryMethod === 'cod' ? 'FREE' : 
                   cart.shippingPrice === 0 ? 'FREE' : `₹${cart.shippingPrice}`}
                </span>
              </div>

              {/* Price summary details */}
              <div className="border border-slate-100 rounded-xl p-4 space-y-2 text-gray-600">
                <h3 className="font-bold text-gray-900 mb-1 border-b border-slate-50 pb-1.5">Final Cost</h3>
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span>₹{cart.itemsPrice.toFixed(2)}</span>
                </div>
                {cart.discountPrice > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{cart.discountPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span>
                    {deliveryMethod === 'express' ? `₹${(cart.shippingPrice + 200).toFixed(2)}` : 
                     deliveryMethod === 'cod' ? 'FREE' : 
                     cart.shippingPrice === 0 ? 'FREE' : `₹${cart.shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span>₹{cart.taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-50 pt-2 flex justify-between font-bold text-sm text-gray-900">
                  <span>Final Total</span>
                  <span>
                    ₹{(
                      cart.totalPrice + 
                      (deliveryMethod === 'express' ? 200.00 : 0.00)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Payment
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessingPayment}
                className="bg-primary text-secondary px-8 py-3 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:bg-slate-200 disabled:text-gray-400"
              >
                {isProcessingPayment ? 'Processing...' : 'Place Order Now'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Order Confirmation */}
        {step === 5 && placedOrder && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flat-shadow text-center space-y-6 animate-scale-up select-none">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-950">Thank You For Your Order!</h2>
              <p className="text-sm text-gray-400">Your order has been placed and confirmed.</p>
              <p className="text-xs text-primary font-bold pt-1">Order Ref: #{placedOrder._id}</p>
            </div>

            <div className="border border-slate-50 rounded-xl p-4 bg-slate-50 text-xs text-gray-500 text-left max-w-sm mx-auto leading-relaxed">
              <p className="font-semibold text-gray-800 mb-1">What Happens Next?</p>
              <p>1. We sent a copy of this order summary to <strong>{user?.email}</strong>.</p>
              <p className="mt-1">2. You can track this shipment status directly in your dashboard.</p>
            </div>

            <div className="flex gap-4 justify-center pt-2">
              <button
                onClick={() => navigate('/dashboard/orders')}
                className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-all flat-shadow cursor-pointer"
              >
                Track Order
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-[#F5F5F5] hover:bg-slate-200 text-gray-800 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
