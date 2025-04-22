import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/faqs.scss";

// speed‑tuned variants
const listVariants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.15 }, // faster fade out
  },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.02, // very tight stagger
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }, // faster fade out of old list
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -5 }, // smaller movement
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" }, // shorter transition
  },
  exit: {
    opacity: 0,
    y: 5,
    transition: { duration: 0.1, ease: "easeIn" }, // quick exit
  },
};

export interface FAQ {
  category: string;
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    category: "General",
    question: "Do you offer customer support?",
    answer:
      "Yes, our support team is available 24/7 via email and chat to assist you.",
  },
  {
    category: "General",
    question: "How secure is my data?",
    answer:
      "We use industry-standard encryption and security protocols to protect your data.",
  },
  {
    category: "Payment",
    question: "What payment methods do you accept?",
    answer: "We accept Visa, MasterCard, American Express, and PayPal.",
  },
  {
    category: "Payment",
    question: "Can I get a refund?",
    answer:
      "Refunds are handled on a case‑by‑case basis—please contact support within 30 days.",
  },
  {
    category: "Billing",
    question: "Where can I view my invoices?",
    answer:
      "All invoices are available in the “Billing” section of your account dashboard.",
  },
  {
    category: "Billing",
    question: "How do I update my billing info?",
    answer:
      "Click “Edit Payment Method” on the billing page and enter your new card details.",
  },
  // …add more categories / questions as needed
];

const FAQItem: React.FC<{
  faq: FAQ;
  isOpen: boolean;
  onClick: () => void;
}> = ({ faq, isOpen, onClick }) => (
  <motion.div layout className="faq-item">
    <div className="faq-question" onClick={onClick}>
      <span>{faq.question}</span>
      <motion.span
        className="icon"
        initial={{ rotate: 0 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        +
      </motion.span>
    </div>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          className="faq-answer"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { height: "auto", opacity: 1 },
            collapsed: { height: 0, opacity: 0 },
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <p>{faq.answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const FAQs: React.FC = () => {
  // derive unique categories
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  const [selectedCat, setSelectedCat] = useState(categories[0]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // close any open item when switching tabs
  useEffect(() => {
    setOpenIndex(null);
  }, [selectedCat]);

  const filtered = faqs.filter((f) => f.category === selectedCat);

  return (
    <div className="faqs-container">
      <h1 className="faqs-header">Frequently Asked Questions</h1>

      {/* Tabs */}
      <div className="faq-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tab-button ${cat === selectedCat ? "active" : ""}`}
            onClick={() => setSelectedCat(cat)}
          >
            {cat}
          </button>
        ))}

        {/* sliding underline */}
        <motion.div className="tab-indicator" layoutId="tabIndicator" />
      </div>

      {/* FAQ items */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={selectedCat}
          variants={listVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="faq-list"
        >
          {filtered.map((faq, i) => (
            <motion.div key={i} variants={itemVariants}>
              <FAQItem
                faq={faq}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FAQs;
