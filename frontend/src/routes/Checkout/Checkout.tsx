import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutForm } from '../../components/CheckoutForm/CheckoutForm';

const stripe = loadStripe("pk_test_1b7TDT5I1aLlj6UAhEejbqrh");

const Checkout = () => (
  <Elements stripe={stripe}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
