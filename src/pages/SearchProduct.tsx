import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, 
  Minus, Plus, Gift, Truck 
} from 'lucide-react';
import Cookies from 'js-cookie';

// Product Type Definition
interface Product {
  id: number;
  store_id: number;
  name: string;
  description: string;
  price: string;
  discounted_price: string;
  stock: number;
  size?: string;
  color?: string;
  rating: string;
  images: string[];
  variants: any[];
  in_wishlist?: boolean;
}

const ProductDetailPage: React.FC = () => {
  // Get dynamic ID from URL
  const { id } = useParams<{ id: string }>();
  
  // State Management
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Fetch Product Details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Get authentication token from cookies
        const token = Cookies.get('token');
        
        const response = await axios.get(`https://api.tamkeen.center/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setProduct(response.data.product);
        setIsInWishlist(response.data.product.in_wishlist || false);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load product');
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Add to Cart Handler
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const token = Cookies.get('token');
      
      await axios.post('https://api.tamkeen.center/api/cart/add', 
        {
          cartItems: [
            {
              store_id: product.store_id,
              product_id: product.id,
              quantity: quantity
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  // Wishlist Handler
  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
      const token = Cookies.get('token');
      
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`https://api.tamkeen.center/api/wishlists/remove/${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        toast.success('Removed from wishlist', {
          style: {
            background: '#334155',
            color: '#fff',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        });
        setIsInWishlist(false);
      } else {
        // Add to wishlist
        await axios.post('https://api.tamkeen.center/api/wishlists/add', 
          {
            product_id: product.id
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        toast.success('Added to wishlist', {
          style: {
            background: '#0f172a',
            color: '#fff',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        });
        setIsInWishlist(true);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  // Image Navigation
  const nextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % product.images.length
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  // Description Expansion Logic
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-sky-100 to-sky-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-600"></div>
      </div>
    );
  }

  // No Product Found
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-sky-50 text-sky-800">
        No product found
      </div>
    );
  }

  // Description Rendering with Show More/Less
  const renderDescription = () => {
    const maxLength = 4;
    const description = product.description;

    if (description.length <= maxLength) {
      return (
        <p className="text-gray-600 leading-relaxed">{description}</p>
      );
    }

    return (
      <div>
        <p className="text-gray-600 leading-relaxed">
          {isDescriptionExpanded 
            ? description 
            : `${description.slice(0, maxLength)}...`}
        </p>
        <button 
          onClick={toggleDescription}
          className="text-sky-600 hover:text-sky-700 font-semibold mt-2"
        >
          {isDescriptionExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden grid md:grid-cols-2 gap-8 p-8">
        {/* Product Image Section */}
        <div className="relative">
          {/* Main Image */}
          <div className="w-full h-[500px] bg-sky-100 rounded-2xl overflow-hidden relative group">
            {/* Image Navigation Buttons */}
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 p-2 rounded-full z-10"
                >
                  <ChevronLeft className="text-sky-600" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 p-2 rounded-full z-10"
                >
                  <ChevronRight className="text-sky-600" />
                </button>
              </>
            )}
            
            {/* Product Image or Placeholder */}
            
              <img 
               src={`https://api.tamkeen.center/${product?.cover_image}`}
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            {/* ) : (
              <div className="flex items-center justify-center h-full text-sky-500">
                No Image Available
              </div>
            )} */}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 mt-4 justify-center">
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer 
                    ${index === currentImageIndex ? 'border-2 border-sky-500' : 'opacity-60 hover:opacity-100'}`}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          {/* Product Name & Rating */}
          <div>
            <h1 className="text-4xl font-bold text-sky-800 mb-2">{product.name}</h1>
      
            <div className="flex items-center">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-6 w-6 ${i < Math.round(parseFloat(product.rating)) ? 'fill-current' : 'stroke-current'}`} 
                  />
                ))}
              </div>
              <span className="text-gray-600 ml-2">({product.rating})</span>
            </div>
          </div>

          {/* Description with Show More/Less */}
          <div>
            {renderDescription()}
          </div>

          {/* Pricing */}
          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold text-sky-700">
              ${parseFloat(product.discounted_price).toFixed(2)}
            </span>
            {product.price !== product.discounted_price && (
              <span className="line-through text-gray-400 text-xl">
                ${parseFloat(product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center border-2 border-sky-200 rounded-lg">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-sky-600 hover:bg-sky-100"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 font-semibold">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 text-sky-600 hover:bg-sky-100"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <span className="text-gray-500">
              {product.stock} items in stock
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 
                         transition flex items-center justify-center space-x-2 
                         transform hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
            <button 
              onClick={handleWishlistToggle}
              className={`bg-sky-100 text-sky-600 p-3 rounded-lg hover:bg-sky-200 
                         transition transform hover:scale-110 active:scale-95
                         ${isInWishlist ? 'text-red-500 bg-red-50' : ''}`}
            >
              <Heart 
                className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} 
              />
            </button>
          </div>

          {/* Additional Product Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-sky-100">
            <div className="flex items-center space-x-2">
              <Truck className="text-sky-500 h-5 w-5" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gift className="text-sky-500 h-5 w-5" />
              <span>Gift Wrap Available</span>
            </div>
          </div>

          {/* Color and Size */}
          {(product.color || product.size) && (
            <div className="pt-4 border-t border-sky-100">
              {product.color && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-gray-600">Color:</span>
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-sky-200" 
                    style={{ backgroundColor: product.color }}
                  ></div>
                </div>
              )}
              {product.size && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Size:</span>
                  <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
                    {product.size}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;