import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('products');
      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const hasProductIndex = products.findIndex(
        productIndex => product.id === productIndex.id,
      );
      let newListProducts = [];
      if (hasProductIndex < 0) {
        const productAdd: Product = product;
        productAdd.quantity = 1;
        newListProducts = [...products, productAdd];
        setProducts([...newListProducts]);
        console.log(products);
      } else {
        const productToAddQuantity = products[hasProductIndex];
        productToAddQuantity.quantity += 1;
        products[hasProductIndex] = productToAddQuantity;
        newListProducts = [...products];
        setProducts([...products]);
      }
      console.log(products);
      await AsyncStorage.setItem('products', JSON.stringify(newListProducts));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const hasProductIndex = products.findIndex(
        productIndex => id === productIndex.id,
      );
      const productToAddQuantity = products[hasProductIndex];
      productToAddQuantity.quantity += 1;
      products[hasProductIndex] = productToAddQuantity;

      setProducts([...products]);
      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const hasProductIndex = products.findIndex(
        productIndex => id === productIndex.id,
      );
      const productToAddQuantity = products[hasProductIndex];
      if (productToAddQuantity.quantity === 1) {
        products.splice(hasProductIndex, 1);
      } else {
        productToAddQuantity.quantity -= 1;
        products[hasProductIndex] = productToAddQuantity;
      }
      setProducts([...products]);
      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
