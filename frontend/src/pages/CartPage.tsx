import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import '../styles/cart.scss';
import { useCart } from "../context/CartContext";

interface ServiceOption {
  id: string;
  label: string;
  sublabel: string;
  cost: number;
}

export const CartPage: React.FC = () => {
  const { items, addItem, removeOne, removeItem } = useCart();
  const navigate = useNavigate();
  // default service
  const [selectedService, setSelectedService] = useState<ServiceOption>({
    id: "nothing",
    label: "No Extra Service Needed",
    sublabel: "Free",
    cost: 0,
  });

  const serviceOptions: ServiceOption[] = [
    {
      id: "nothing",
      label: "No Extra Service Needed",
      sublabel: "Free",
      cost: 0,
    },
    {
      id: "assistant",
      label: "Assistant Designer",
      sublabel: "+50 SAR",
      cost: 50,
    },
    {
      id: "ai",
      label: "AI Assistant",
      sublabel: "+100 SAR",
      cost: 100,
    },
    {
      id: "printing",
      label: "Menu Printing",
      sublabel: "Cost will be calculated after contact",
      cost: 0,
    },
  ];

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + selectedService.cost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
        <h1 className="text-2xl font-semibold">Your Cart is Empty</h1>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => navigate("/menus")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">My Cart</h1>
        <button
          className="px-4 py-2"
          style={{
            background: "#f5f5f5",
            color: "#333",
            border: "1px solid #ccc",
            borderRadius: "4px",
            transition: "background 0.2s",
          }}
          onClick={() => navigate("/menus")}
          onMouseOver={(e) => (e.currentTarget.style.background = "#e5e5e5")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#f5f5f5")}
        >
          ← Continue shopping
        </button>
      </div>
      {/* Items Header */}
      <div className="hidden sm:flex items-center px-4  rounded-t text-gray-600 font-medium">
        <div className="flex-1">Product</div>
        <div className="w-24 text-center">Price</div>
        <div className="w-32 text-center">Qty</div>
        <div className="w-24 text-center">Total</div>
        <div className="w-8" /> {/* for the “×” remove button column */}
      </div>
      {/* Items List */}
      <div className="space-y-4">
        {items.map((i) => (
          <div
            key={i.id}
            className="
        flex flex-col sm:flex-row
        items-start sm:items-center
        sm:justify-between
        bg-white shadow-sm rounded
        p-4
      "
          >
            {/* Product Info + Mobile Controls */}
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded" />
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-gray-500">#{i.id}</div>
                </div>
              </div>

              {/* Mobile-only Qty & Total side-by-side */}
              <div className="mt-3 flex items-center space-x-6 sm:hidden">
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Qty:</span>
                  <span>{i.quantity}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Total:</span>
                  <span>{(i.price * i.quantity).toFixed(2)} SAR</span>
                </div>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="mt-4 sm:mt-0 flex items-center sm:space-x-4 w-full sm:w-auto">
              {/* Price (hide on mobile) */}
              <div className="hidden sm:block w-24 text-center">
                {i.price.toFixed(2)} SAR
              </div>

              {/* Quantity buttons */}
              <div className="flex items-center border rounded mr-4 sm:mr-0">
                <button
                  onClick={() => removeOne(i.id)}
                  className="px-2 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-3">{i.quantity}</span>
                <button
                  onClick={() =>
                    addItem({
                      id: i.id,
                      name: i.name,
                      price: i.price,
                      quantity: 1,
                    })
                  }
                  className="px-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              {/* Total (desktop only) */}
              <div className="hidden sm:block w-24 text-center">
                {(i.price * i.quantity).toFixed(2)} SAR
              </div>

              {/* Remove button */}
                <button
                onClick={() => removeItem(i.id)}
                className=" text-gray-400 hover:text-red-600 text-xl"
                >
                ×
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Service Options + Summary */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Service Options */}
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-semibold">Choose additional service:</h2>
          <div className="space-y-2">
            {serviceOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center p-3 border rounded cursor-pointer hover:shadow ${
                  selectedService.id === opt.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  className="form-radio h-5 w-5 text-blue-600"
                  checked={selectedService.id === opt.id}
                  onChange={() => setSelectedService(opt)}
                />
                <div className="ml-3">
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-gray-500">{opt.sublabel}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 bg-white shadow p-6 rounded space-y-4">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span>{subtotal.toFixed(2)} SAR</span>
          </div>
          <div className="flex justify-between">
            <span>SERVICE</span>
            <span>
              {selectedService.cost === 0
                ? "Free"
                : `${selectedService.cost.toFixed(2)} SAR`}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>TOTAL</span>
            <span>{total.toFixed(2)} SAR</span>
          </div>
          <button
            className="w-full py-3 bg-[#1e1e1e] text-white rounded transition flex items-center justify-center"
            onClick={() => navigate("/checkout")}
          >
            Checkout
            <span className="ml-2 font-medium">{total.toFixed(2)} SAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
