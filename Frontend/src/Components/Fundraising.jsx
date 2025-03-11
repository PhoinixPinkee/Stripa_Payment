import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const FundraisingPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", amount: "", campaign: "Save the Children" });

  // Detect payment success after redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setPaymentSuccess(true);
      // Clean URL by removing query parameters
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (!formData.name || !formData.amount) {
      alert("Please enter your name and amount.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: formData }),
      });
  
      const session = await response.json();
  
      if (!session.id) {
        throw new Error("Invalid session ID received from server");
      }
  
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Payment failed. Please try again.");
    }
  };
  
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full text-center">
          <h2 className="text-2xl font-semibold text-green-700">Payment Successful!</h2>
          <p className="text-gray-700 mt-2">Thank you for your donation to {formData.campaign}!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      {!showForm ? (
        <div className="relative bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center">
          <img 
            src="https://donorbox.org/nonprofit-blog/wp-content/uploads/2019/01/balloons-charity-colorful-1409716.jpg" 
            alt="Emotional campaign" 
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Support Our Campaign</h2>
          <p className="text-gray-600">Join us in making a difference by donating to our cause.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Donate to Campaign
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Donate to {formData.campaign}</h3>
          <div className="mb-4">
            <label className="block text-gray-700 text-left mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-left mb-1">Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCheckout}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 w-full"
          >
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
};

export default FundraisingPage;
