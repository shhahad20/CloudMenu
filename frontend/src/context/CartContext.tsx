import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useUser } from "../hooks/useUser";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isPlan?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeOne: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const json = localStorage.getItem("cartItems");
    return json ? (JSON.parse(json) as CartItem[]) : [];
  });

  const { data: userProfile } = useUser();

  const PLAN_IDS = new Set(["plan-Pro", "plan-Enterprise", "plan-Free"]);

  // Separate effect for localStorage - runs on every items change
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
  }, [items]);

  const validatePlanAddition = (item: CartItem): string | null => {
    if (!PLAN_IDS.has(item.id)) return null;

    const existing = items.find((i) => PLAN_IDS.has(i.id));
    const targetPlan = item.id.replace("plan-", "") as
      | "Free"
      | "Pro"
      | "Enterprise";

    if (existing) {
      return existing.id === item.id
        ? "You already added this plan to your cart."
        : "You already have a different plan in your cart. Remove it first.";
    }

    if (userProfile) {
      if (userProfile.plan === targetPlan) {
        return `You already have the ${targetPlan} plan on your account.`;
      }
      // if (userProfile.plan !== 'Free' && targetPlan !== 'Free') {
      //   return `You’re on the ${userProfile.plan} plan. To switch to ${targetPlan}, contact support.`;
      // }
    }

    return null;
  };

  // Add or increase
  const addItem = (item: CartItem) => {
    const err = validatePlanAddition(item);
    if (err) return alert(err);

    setItems((prev) => {
      if (PLAN_IDS.has(item.id)) {
        return [...prev, { ...item, quantity: 1 }];
      }

      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  // Decrease by one, or remove if it hits zero
  const removeOne = (id: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  // Remove entire line
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeOne,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
