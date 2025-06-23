import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
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
  userProfile: UserProfile | null;
  addItem: (item: CartItem) => void;
  removeOne: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  refreshProfile: () => Promise<void>;
}
interface UserProfile {
  id: string;
  email: string;
  plan: string;
  updatedAt: string;
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
  // const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const PLAN_IDS = new Set(["plan-Pro", "plan-Enterprise", "plan-Free"]);

  // Separate effect for localStorage - runs on every items change
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
  }, [items]);

  // Fetch user profile (with caching)
  const fetchProfile = useCallback(
    async (force: boolean = false) => {
      if (isLoadingProfile && !force) return;

      setIsLoadingProfile(true);
      try {
        const res = await apiFetch("/api/profiles/me");
        if (res.status === 401) {
          setUserProfile(null);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch profile");

        const profile = await res.json();
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setUserProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    },
    [isLoadingProfile]
  );

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Manual refresh function
  const refreshProfile = () => fetchProfile(true);

  // Optimistic client-side validation
  const validatePlanAddition = (item: CartItem): string | null => {
    const isPlan = PLAN_IDS.has(item.id);
    if (!isPlan) return null; // Non-plan items are always ok

    // Check: multiple plans in cart
    const inCartPlan = items.find((i) => PLAN_IDS.has(i.id));
    if (inCartPlan) {
      return "Your cart already has a plan. You can only have one plan at a time.";
    }

    // Check: user already has this plan (if profile loaded)
    if (userProfile) {
      const targetPlan = item.id.replace("plan-", "");
      if (userProfile.plan === targetPlan) {
        return `You already have the ${targetPlan} plan active on your account.`;
      }

      // Check: trying to switch between paid plans
      if (
        userProfile.plan &&
        userProfile.plan !== "Free" &&
        targetPlan !== "Free"
      ) {
        return `You're currently on the ${userProfile.plan} plan. To switch, please contact support.`;
      }
    }

    return null; // Validation passed
  };

  // Add or increase
  const addItem = (item: CartItem) => {
    const validationError = validatePlanAddition(item);
    if (validationError) {
      alert(validationError);
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
      value={{
        items,
        userProfile,
        addItem,
        removeOne,
        removeItem,
        clearCart,
        refreshProfile,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
