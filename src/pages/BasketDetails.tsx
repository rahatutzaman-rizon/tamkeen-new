import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAtom } from 'jotai';
import { authAtom } from '../atoms/authAtom';
import toast, { Toaster } from 'react-hot-toast';

// Define TypeScript interfaces for type safety
interface PackageImage {
  id: number;
  image: string;
  package_id: number;
  created_at: string;
  updated_at: string;
}

interface Package {
  id: number;
  name: string;
  total_price: string;
  number_of_uses: number;
  store_id: number;
  image: string | null;
  images: PackageImage[];
  created_at: string;
  updated_at: string;
}

const BasketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [packageDetails, setPackageDetails] = useState<Package | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [auth] = useAtom(authAtom); // Access authentication state

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        const response = await fetch('https://api.tamkeen.center/api/packages');
        const packages: Package[] = await response.json();

        // Find the package that matches the ID from the URL
        const selectedPackage = packages.find(pkg => pkg.id === parseInt(id || '0'));

        if (selectedPackage) {
          setPackageDetails(selectedPackage);
        } else {
          setError('Package not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch package details');
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [id]);

  const handleAddToCart = () => {
    // Check if user is authenticated
    if (!auth.isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate("/login", { 
        state: { 
          from: window.location.pathname, 
          message: 'You need to log in to add products to your cart' 
        } 
      });
      return;
    }

    if (!packageDetails) return;

    // Retrieve existing basket or initialize empty
    const existingBasket = JSON.parse(localStorage.getItem('basket') || '[]');

    // Check if package is already in basket
    const isPackageInBasket = existingBasket.some((item: Package) => item.id === packageDetails.id);

    if (!isPackageInBasket) {
      // Add package to basket
      const updatedBasket = [...existingBasket, packageDetails];
      localStorage.setItem('basket', JSON.stringify(updatedBasket));
      toast.success(`${packageDetails.name} added to basket!`);
    } else {
      toast.error('Package is already in the basket');
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!packageDetails) return null;

  return (
    <div className="container mx-auto p-6 bg-gray-50 mt-24">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="grid md:grid-cols-2 gap-8 bg-white shadow-lg rounded-xl p-6">
        {/* Image Gallery */}
        <div className="space-y-4">
          {packageDetails.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {packageDetails.images.map((img) => (
                <img
                  key={img.id}
                  src={`https://api.tamkeen.center/${img.image}`}
                  alt={packageDetails.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
              No Image Available
            </div>
          )}
        </div>

        {/* Package Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">{packageDetails.name}</h1>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold text-green-600">
              ${packageDetails.total_price}
            </span>
            <span className="text-gray-600">
              Uses Remaining: {packageDetails.number_of_uses}
            </span>
          </div>

          <div className="bg-sky-100 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-sky-800">Package Details</h3>
            <p className="text-gray-700">Store ID: {packageDetails.store_id}</p>
            <p className="text-gray-700">
              Created: {new Date(packageDetails.created_at).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${
              auth.isAuthenticated
                ? 'bg-sky-500 text-white hover:bg-sky-600'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="mr-2" />
            {auth.isAuthenticated ? 'Add to Basket' : 'Login to Add to Basket'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasketDetailsPage;