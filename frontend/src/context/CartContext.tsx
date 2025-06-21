import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { apiFetch } from "../hooks/useApiCall";

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
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const PLAN_IDS = new Set(["plan-Pro", "plan-Enterprise", "plan-Free"]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
    (async () => {
      try {
        const res = await apiFetch("/profiles/me");
        if (res.status === 401) {
          // not signed in (or token expired & refresh failed)
         window.alert("You have to signin.");
        }
        if (!res.ok) throw new Error("Failed to load profile");
        const profile = (await res.json()) as { plan?: string };
        setCurrentPlanId(profile.plan ?? null);
      } catch {
        setCurrentPlanId(null);
      }
    })();
  }, [items]);

  // Add or increase
  const addItem = (item: CartItem) => {
    const isPlan = PLAN_IDS.has(item.id);
    const inCartPlan = items.find((i) => PLAN_IDS.has(i.id));

    // 2) If they already have that plan in their profile:
    if (isPlan && item.id === currentPlanId) {
      window.alert("You already have that plan active on your account.");
      return;
    }

    // 3) If they have a **different** plan active in profile:
    if (isPlan && currentPlanId && item.id !== currentPlanId) {
      window.alert(
        `You’re currently on the ${currentPlanId.replace(
          "plan-",
          ""
        )} plan. To switch, please contact support or remove your existing subscription first.`
      );
      return;
    }

    // 4) If they already added a plan to the cart:
    if (isPlan && inCartPlan) {
      window.alert(
        "Your cart already has a plan. You can only have one plan at a time."
      );
      return;
    }
    setItems((prev) => {
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
      value={{ items, addItem, removeOne, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
