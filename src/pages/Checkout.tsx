import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, CreditCard, Check } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import AddressModal from './AddressModal';

interface Product {
  product_id: number;
  product_name: string;
  product_cover_image: string | null;
  product_price: string;
  quantity: number;
  product_total: number;
}

interface Store {
  store_id: number;
  store_name: string;
  store_image: string;
  products: Product[];
  store_total_price: number;
}

interface CartData {
  cart_total_price: number;
  stores: Store[];
}

const CheckoutPage: React.FC = () => {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>('51');
  const [error, setError] = useState<string | null>(null);
  const [checkoutProgress, setCheckoutProgress] = useState<{[key: number]: 'pending' | 'success' | 'failed'}>({});
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState<string>('');

  const paymentMethodOptions = [
    { 
      id: '51', 
      name: 'Cash on Delivery', 
      icon: <CreditCard className="text-orange-500 mr-2" />
    }
  ];

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const bearerToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('token'))
          ?.split('=')[1];

        if (!bearerToken) {
          throw new Error('No bearer token found');
        }

        const response = await axios.get('https://api.tamkeen.center/api/view-cart', {
          headers: { 
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
          }
        });

        setCartData(response.data.cart);
        
        const initialProgress = response.data.cart.stores.reduce((acc, store) => {
          acc[store.store_id] = 'pending';
          return acc;
        }, {});
        setCheckoutProgress(initialProgress);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error('Failed to load cart data');
      }
    };

    fetchCartData();
  }, []);

  const handleMultiStoreCheckout = async () => {
    if (!selectedPaymentMethodId) {
      toast.error('Please select a payment method');
      return;
    }

    if (!address) {
      toast.error('Please add an address');
      return;
    }

    if (!cartData || cartData.stores.length === 0) {
      toast.error('No stores in cart');
      return;
    }

    const checkoutPromise = async () => {
      const bearerToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token'))
        ?.split('=')[1];

      if (!bearerToken) {
        throw new Error('No bearer token found');
      }

      const storesToCheckout = [...cartData.stores];
      let allCheckoutsSuccessful = true;

      for (const store of storesToCheckout) {
        try {
          const checkoutData = {
            store_id: store.store_id.toString(),
            payment_method_id: selectedPaymentMethodId,
            address: address
          };

          const response = await axios.post(
            'https://api.tamkeen.center/api/cart/checkout', 
            checkoutData,
            { 
              headers: { 
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
              } 
            }
          );

          setCheckoutProgress(prev => ({
            ...prev, 
            [store.store_id]: response.data.success ? 'success' : 'failed'
          }));

          if (!response.data.success) {
            allCheckoutsSuccessful = false;
          }

          // Reduced delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (storeErr) {
          setCheckoutProgress(prev => ({
            ...prev, 
            [store.store_id]: 'failed'
          }));
          allCheckoutsSuccessful = false;
          console.error(storeErr);
        }
      }

      if (!allCheckoutsSuccessful) {
        throw new Error('Some orders failed');
      }
    };

    toast.promise(
      checkoutPromise(),
      {
        loading: 'Processing your order...',
        success: 'All orders placed successfully!',
        error: 'Some orders failed. Please check and retry.',
      }
    );
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <ShoppingCart className="mr-3" /> Checkout
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Order Summary */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          
          {cartData?.stores.map((store) => (
            <div key={store.store_id} className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{store.store_name}</h3>
                {checkoutProgress[store.store_id] === 'success' && (
                  <span className="text-green-500">✓ Checkout Complete</span>
                )}
                {checkoutProgress[store.store_id] === 'failed' && (
                  <span className="text-red-500">✗ Checkout Failed</span>
                )}
              </div>
              {store.products.map((product) => (
                <div 
                  key={product.product_id} 
                  className="flex justify-between items-center mb-2"
                >
                  <div className="flex items-center">
                    <img 
                      src={product.product_cover_image || '/placeholder-product.png'}
                      alt={product.product_name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <span>{product.product_name}</span>
                  </div>
                  <div>
                    <span>{product.quantity} x ${product.product_price}</span>
                  </div>
                </div>
              ))}
              <div className="text-right font-bold">
                Store Total: ${store.store_total_price.toFixed(2)}
              </div>
            </div>
          ))}

          <div className="mt-4 border-t pt-4 text-right">
            <span className="text-xl font-bold">
              Total: ${cartData?.cart_total_price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Right Column: Checkout Details */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            Payment Method
          </h2>
          
          {paymentMethodOptions.map((method) => (
            <div 
              key={method.id}
              onClick={() => setSelectedPaymentMethodId(method.id)}
              className={`p-4 border rounded-lg mb-3 cursor-pointer flex items-center ${
                selectedPaymentMethodId === method.id 
                  ? 'border-green-500 bg-green-50' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {method.icon}
              <div className="flex-grow">
                {method.name}
              </div>
              {selectedPaymentMethodId === method.id && (
                <Check className="ml-auto text-green-500" />
              )}
            </div>
          ))}

          {address && (
            <div className="mb-4 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Current Address:</h3>
              <p>{address}</p>
            </div>
          )}

          <button 
            onClick={() => setIsAddressModalOpen(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors"
          >
            Add New Address
          </button>

          <button 
            onClick={handleMultiStoreCheckout}
            className="w-full bg-green-600 text-white py-3 rounded-lg mt-4 hover:bg-green-700 transition-colors flex items-center justify-center"
            disabled={!selectedPaymentMethodId || !address}
          >
            <Check className="mr-2" /> Complete Multi-Store Order
          </button>
        </div>
      </div>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSave={(newAddress: string) => {
          setAddress(newAddress);
          setIsAddressModalOpen(false);
          toast.success('Address added successfully');
        }}
      />
    </div>
  );
};

export default CheckoutPage;

