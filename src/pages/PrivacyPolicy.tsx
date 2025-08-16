
import Header from '../components/Header';
import Footer from '../pages/Home/Footer';

const PrivacyPolicy = () => (
  <>
    <Header />
  <div className="container mx-auto px-4 py-8 max-w-3xl bg-[#f0f5ec] rounded-lg shadow-md mt-8 mb-12">
  <h1 className="text-3xl font-bold mb-4 text-[#133215]">Privacy Policy</h1>
    <p className="mb-2">Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">1. Information We Collect</h2>
    <p className="mb-2">We collect information you provide when you register, place an order, or contact us. This may include your name, email, address, and payment details.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">2. How We Use Your Information</h2>
  <p className="mb-2">We use your information to process orders, provide customer service, and improve our website. We do not sell your information to third parties.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">3. Payment Information</h2>
  <p className="mb-2">We use Razorpay to process payments. Your payment details are handled securely by Razorpay and are not stored on our servers. For more information, please refer to <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Razorpay's Privacy Policy</a>.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">4. Cookies</h2>
  <p className="mb-2">We use cookies to enhance your experience on our site. You can disable cookies in your browser settings.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">5. Data Security</h2>
  <p className="mb-2">We implement security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
  <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">6. Your Rights</h2>
  <p className="mb-2">You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us using the information provided on our website.</p>

    <h2 className="text-xl font-semibold mt-6 mb-2 text-[#29402a]">7. Changes to This Policy</h2>
    <p className="mb-2">We may update this Privacy Policy from time to time. Please review it periodically for changes.</p>
    <p className="mt-6">If you have any questions about our Privacy Policy, please contact us.</p>
    </div>
    <Footer />
  </>
);

export default PrivacyPolicy;
