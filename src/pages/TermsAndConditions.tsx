
import Header from '../components/Header';
import Footer from '../pages/Home/Footer';

const TermsAndConditions = () => (
  <>
    <Header />
  <div className="container mx-auto px-4 py-8 max-w-3xl bg-[#f0f5ec] rounded-lg shadow-md mt-8 mb-12">
  <h1 className="text-3xl font-bold mb-4 text-[#133215]">Terms and Conditions</h1>
    <p className="mb-2">Welcome to our e-commerce website. By accessing or using our site, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">1. Use of the Site</h2>
    <p className="mb-2">You agree to use the site for lawful purposes only and not to engage in any activity that could harm the site or its users.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">2. Intellectual Property</h2>
    <p className="mb-2">All content on this site, including text, graphics, logos, and images, is the property of the company and protected by copyright laws.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">3. Orders and Payments</h2>
  <p className="mb-2">All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">4. Payment Gateway</h2>
  <p className="mb-2">We use Razorpay as our trusted payment gateway partner. All payments are processed securely through Razorpay. We do not store your card or payment details on our servers. For more information, please refer to <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Razorpay's Privacy Policy</a>.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">5. Refunds and Cancellations</h2>
  <p className="mb-2">Refunds and cancellations are subject to our company policy. If you wish to request a refund or cancel an order, please contact our support team within 7 days of purchase. Approved refunds will be processed to your original payment method via Razorpay within 7-10 business days.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">6. Limitation of Liability</h2>
  <p className="mb-2">We are not liable for any damages arising from the use of this site or the products sold on it.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">7. Changes to Terms</h2>
  <p className="mb-2">We reserve the right to update these Terms and Conditions at any time. Continued use of the site constitutes acceptance of the new terms.</p>

    <p className="mt-6">If you have any questions, please contact us.</p>
    </div>
    <Footer />
  </>
);

export default TermsAndConditions;
