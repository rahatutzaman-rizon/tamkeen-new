import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Minus, Plus, Gift, Truck, Barcode, QrCode, Scale, Box, Ruler, Palette, Shirt, Tag } from 'lucide-react';

// Type definitions
interface Category {
  id: number;
  category_name: string;
  color: string;
}

interface ProductVariant {
  id: number;
  name: string;
  price: string;
  stock: number;
  size: string | null;
  color: string | null;
  weight: string | null;
}

interface Product {
  id: number;
  store_id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  cover_image: string;
  background_image: string | null;
  discount_type: string | null;
  discount_value: string | null;
  discounted_price: string;
  rating: string | null;
  barcode: string | null;
  qr_code: string | null;
  serial_number: string | null;
  track_stock: number;
  track_stock_number: string | null;
  size: string | null;
  color: string | null;
  material: string | null;
  style: string | null;
  gender: string | null;
  capacity: string | null;
  weight: string | null;
  created_at: string;
  updated_at: string;
  images: string[];
  ratings: any[];
  categories: Category[];
  variants: ProductVariant[];
  in_wishlist?: boolean;
}

const colorNameToHex: { [key: string]: string } = {
  red: '#FF0000',
  blue: '#0000FF',
  green: '#00FF00',
  // Add more color mappings as needed
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
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

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const token = Cookies.get('token');
      await axios.post('https://api.tamkeen.center/api/cart/add', 
        {
          cartItems: [
            {
              store_id: product.store_id,
              product_id: selectedVariant ? selectedVariant.id : product.id,
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

  const handleWishlistToggle = async () => {
    if (!product) return;
    try {
      const token = Cookies.get('token');
      if (isInWishlist) {
        await axios.delete(`https://api.tamkeen.center/api/wishlists/remove/${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Removed from wishlist');
        setIsInWishlist(false);
      } else {
        await axios.post('https://api.tamkeen.center/api/wishlists/add', 
          { product_id: product.id },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Added to wishlist');
        setIsInWishlist(true);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => prev === 0 ? product.images.length - 1 : prev - 1);
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const getColorHex = (colorName: string) => {
    return colorNameToHex[colorName.toLowerCase()] || colorName;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-sky-100 to-sky-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-sky-50 text-sky-800">
        No product found
      </div>
    );
  }

  const renderDescription = () => {
    const maxLength = 8;
    const description = product.description;

    if (description.length <= maxLength) {
      return <p className="text-gray-600 leading-relaxed">{description}</p>;
    }

    return (
      <div>
        <p className="text-gray-600 leading-relaxed">
          {isDescriptionExpanded ? description : `${description.slice(0, maxLength)}...`}
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Image Gallery Section */}
          <div className="relative">
            <div className="w-full h-[500px] bg-sky-100 rounded-2xl overflow-hidden relative group">
              <img 
                src={`https://api.tamkeen.center/${product.images[currentImageIndex] || product.cover_image}`}
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {product.background_image && (
                <img 
                  src={`https://api.tamkeen.center/${product.background_image}`}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              )}
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
            </div>
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
                      src={`https://api.tamkeen.center/${img}`}
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
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {product.categories.map(category => (
                <span 
                  key={category.id}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: category.color,
                    color: '#ffffff'
                  }}
                >
                  {category.category_name}
                </span>
              ))}
            </div>

            {/* Product Name & Rating */}
            <div>
              <h1 className="text-4xl font-bold text-sky-800 mb-2">{product.name}</h1>
              {product.rating && (
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-6 w-6 ${i < Math.round(parseFloat(product.rating || '0')) ? 'fill-current' : 'stroke-current'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 ml-2">({product.rating})</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              {renderDescription()}
            </div>

            {/* Pricing & Discount */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-sky-700">
                ${parseFloat(selectedVariant?.price || product.discounted_price).toFixed(2)}
              </span>
              {product.discount_type && product.discount_value && (
                <div className="flex items-center space-x-2">
                  <span className="line-through text-gray-400 text-xl">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm">
                    {product.discount_type === 'percentage' ? `${product.discount_value}% OFF` : `$${product.discount_value} OFF`}
                  </span>
                </div>
              )}
            </div>

            {/* Product Specifications */}
            <div className="grid grid-cols-2 gap-4 border-t border-sky-100 pt-4">
              {(selectedVariant?.size || product.size) && (
                <div className="flex items-center space-x-2">
                  <Ruler className="text-sky-500 h-5 w-5" />
                  <span>Size: {selectedVariant?.size || product.size}</span>
                </div>
              )}
              {(selectedVariant?.color || product.color) && (
                <div className="flex items-center space-x-2">
                  <Palette className="text-sky-500 h-5 w-5" />
                  <span>Color: </span>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300" 
                    style={{ backgroundColor: getColorHex(selectedVariant?.color || product.color || '') }}
                  ></div>
                </div>
              )}
              {(selectedVariant?.weight || product.weight) && (
                <div className="flex items-center space-x-2">
                  <Scale className="text-sky-500 h-5 w-5" />
                  <span>Weight: {selectedVariant?.weight || product.weight} </span>
                </div>
              )}
              {product.material && (
                <div className="flex items-center space-x-2">
                  <Box className="text-sky-500 h-5 w-5" />
                  <span>Material: {product.material}</span>
                </div>
              )}
              {product.style && (
                <div className="flex items-center space-x-2">
                  <Shirt className="text-sky-500 h-5 w-5" />
                  <span>Style: {product.style}</span>
                </div>
              )}
            </div>

            {/* Product Identifiers */}
            <div className="grid grid-cols-2 gap-4 border-t border-sky-100 pt-4">
              {product.barcode && (
                <div className="flex items-center space-x-2">
                  <Barcode className="text-sky-500 h-5 w-5" />
                  <span>Barcode: {product.barcode}</span>
                </div>
              )}
              {product.qr_code && (
                <div className="flex items-center space-x-2">
                  <QrCode className="text-sky-500 h-5 w-5" />
                  <span>QR Code: {product.qr_code}</span>
                </div>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="border-t border-sky-100 pt-4">
                <h3 className="font-semibold mb-2">Available Variants</h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedVariant?.id === variant.id 
                          ? 'border-sky-500 bg-sky-50' 
                          : 'border-gray-200 hover:border-sky-200'
                      }`}
                    >
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-sm text-gray-500">Stock: {variant.stock}</div>
                      <div className="text-sky-600">${parseFloat(variant.price).toFixed(2)}</div>
                      {variant.color && (
                        <div className="flex items-center mt-2">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: getColorHex(variant.color) }}
                          ></div>
                          <span>{variant.color}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 border-t border-sky-100 pt-4">
              <div className="flex items-center border-2 border-sky-200 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-sky-600 hover:bg-sky-100"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="px-4 py-2 font-semibold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min((selectedVariant?.stock || product.stock), quantity + 1))}
                  className="px-4 py-2 text-sky-600 hover:bg-sky-100"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <span className="text-gray-500">
                {selectedVariant?.stock || product.stock} items in stock
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 border-t border-sky-100 pt-4">
              <button 
                onClick={handleAddToCart}
                disabled={(selectedVariant?.stock || product.stock) === 0}
                className="flex-1 bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 
                         transition flex items-center justify-center space-x-2 
                         transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{(selectedVariant?.stock || product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
              <button 
                onClick={handleWishlistToggle}
                className={`bg-sky-100 text-sky-600 p-3 rounded-lg hover:bg-sky-200 
                         transition transform hover:scale-110 active:scale-95
                         ${isInWishlist ? 'text-red-500 bg-red-50' : ''}`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 border-t border-sky-100 pt-4">
              <div className="flex items-center space-x-2">
                <Truck className="text-sky-500 h-5 w-5" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="text-sky-500 h-5 w-5" />
                <span>Gift Wrap Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

