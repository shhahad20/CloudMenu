import React from "react";
import { motion, Variants } from "framer-motion";
import "../styles/ourServices.scss";

interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const services: Service[] = [
  {
    icon: (
      <span className="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M20 7H17.8486C17.3511 7 17 6.49751 17 6C17 4.34315 15.6569 3 14 3C12.3431 3 11 4.34315 11 6C11 6.49751 10.6488 7 10.1513 7H8C7.44771 7 7 7.44772 7 8V10.1513C7 10.6488 6.49751 11 6 11C4.34315 11 3 12.3431 3 14C3 15.6569 4.34315 17 6 17C6.49751 17 7 17.3511 7 17.8486V20C7 20.5523 7.44771 21 8 21L20 21C20.5523 21 21 20.5523 21 20V17.8486C21 17.3511 20.4975 17 20 17C18.3431 17 17 15.6569 17 14C17 12.3431 18.3431 11 20 11C20.4975 11 21 10.6488 21 10.1513L21 8C21 7.44772 20.5523 7 20 7Z"
            stroke="#1E1E1E"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    ),
    title: "Custom Digital Menus",
    description:
      "Design and deploy personalized menus for cafes and restaurants using QR codes.",
  },
  {
    icon: (
      <span className="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M11.2348 2.37392C10.8672 2.52616 10.5377 2.85565 9.8788 3.51457C9.22003 4.17335 8.8904 4.50298 8.73818 4.87047C8.53519 5.36053 8.53519 5.91121 8.73818 6.40126C8.89042 6.76881 9.21989 7.09828 9.87883 7.75722C10.5374 8.41578 10.8673 8.74568 11.2347 8.89788C11.7248 9.10086 12.2755 9.10086 12.7655 8.89787C13.1331 8.74563 13.4625 8.41616 14.1215 7.75722C14.7804 7.09828 15.1089 6.76881 15.2612 6.40126C15.4641 5.91121 15.4641 5.36053 15.2612 4.87047C15.1089 4.50293 14.7804 4.17351 14.1215 3.51457C13.4625 2.85564 13.1331 2.52616 12.7655 2.37392C12.2755 2.17093 11.7248 2.17093 11.2348 2.37392Z"
            stroke="#1E1E1E"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4.8705 8.73769C4.50296 8.88993 4.17348 9.21941 3.51455 9.87834C2.85579 10.5371 2.52614 10.8668 2.37392 11.2342C2.17093 11.7243 2.17093 12.275 2.37392 12.765C2.52616 13.1326 2.85564 13.4621 3.51457 14.121C4.17314 14.7796 4.50303 15.1094 4.87047 15.2616C5.36053 15.4646 5.91121 15.4646 6.40126 15.2616C6.76881 15.1094 7.09828 14.7799 7.75722 14.121C8.41616 13.4621 8.74466 13.1326 8.8969 12.765C9.09989 12.275 9.09989 11.7243 8.8969 11.2342C8.74466 10.8667 8.41616 10.5373 7.75722 9.87834C7.09828 9.2194 6.76881 8.88993 6.40126 8.73769C5.91121 8.5347 5.36056 8.5347 4.8705 8.73769Z"
            stroke="#1E1E1E"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16.2431 9.87834C15.5843 10.5371 15.2547 10.8667 15.1024 11.2342C14.8994 11.7243 14.8994 12.275 15.1024 12.765C15.2547 13.1326 15.5842 13.462 16.2431 14.121C16.9016 14.7795 17.2316 15.1094 17.599 15.2616C18.089 15.4646 18.6397 15.4646 19.1298 15.2616C19.4973 15.1094 19.8268 14.7799 20.4857 14.121C21.1447 13.4621 21.4732 13.1326 21.6254 12.765C21.8284 12.275 21.8284 11.7243 21.6254 11.2342C21.4732 10.8667 21.1447 10.5373 20.4857 9.87834C19.8268 9.21941 19.4973 8.88993 19.1298 8.73769C18.6397 8.5347 18.0891 8.5347 17.599 8.73769C17.2315 8.88993 16.902 9.21941 16.2431 9.87834Z"
            stroke="#1E1E1E"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M11.2348 15.1019C10.8672 15.2542 10.5377 15.5837 9.8788 16.2426C9.22004 16.9014 8.8904 17.231 8.73818 17.5985C8.53519 18.0886 8.53519 18.6392 8.73818 19.1293C8.89042 19.4968 9.21989 19.8263 9.87883 20.4852C10.5374 21.1438 10.8673 21.4737 11.2347 21.6259C11.7248 21.8289 12.2755 21.8289 12.7655 21.6259C13.1331 21.4737 13.4625 21.1442 14.1215 20.4852C14.7804 19.8263 15.1089 19.4968 15.2612 19.1293C15.4641 18.6392 15.4641 18.0886 15.2612 17.5985C15.1089 17.231 14.7804 16.9015 14.1215 16.2426C13.4625 15.5837 13.1331 15.2542 12.7655 15.1019C12.2755 14.899 11.7248 14.899 11.2348 15.1019Z"
            stroke="#1E1E1E"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    ),
    title: "Instant Menu Templates",
    description:
      "Choose from professionally designed templates and launch your menu in minutes.",
  },
  {
    icon: (
      <span className="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M13.6006 21.0761L19.0608 17.9236C19.6437 17.5871 19.9346 17.4188 20.1465 17.1834C20.3341 16.9751 20.4759 16.7297 20.5625 16.4632C20.6602 16.1626 20.6602 15.8267 20.6602 15.1568V8.84268C20.6602 8.17277 20.6602 7.83694 20.5625 7.53638C20.4759 7.26982 20.3341 7.02428 20.1465 6.816C19.9355 6.58161 19.6453 6.41405 19.0674 6.08043L13.5996 2.92359C13.0167 2.58706 12.7259 2.41913 12.416 2.35328C12.1419 2.295 11.8584 2.295 11.5843 2.35328C11.2744 2.41914 10.9826 2.58706 10.3997 2.92359L4.93843 6.07666C4.35623 6.41279 4.06535 6.58073 3.85352 6.816C3.66597 7.02428 3.52434 7.26982 3.43773 7.53638C3.33984 7.83765 3.33984 8.17436 3.33984 8.84742V15.1524C3.33984 15.8254 3.33984 16.1619 3.43773 16.4632C3.52434 16.7297 3.66597 16.9751 3.85352 17.1834C4.06548 17.4188 4.35657 17.5871 4.93945 17.9236L10.3997 21.0761C10.9826 21.4126 11.2744 21.5806 11.5843 21.6465C11.8584 21.7047 12.1419 21.7047 12.416 21.6465C12.7259 21.5806 13.0177 21.4126 13.6006 21.0761Z"
            stroke="#1E1E1E"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 11.9998C9 13.6566 10.3431 14.9998 12 14.9998C13.6569 14.9998 15 13.6566 15 11.9998C15 10.3429 13.6569 8.99976 12 8.99976C10.3431 8.99976 9 10.3429 9 11.9998Z"
            stroke="#1E1E1E"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    ),
    title: "AI Employees",
    description:
      "Increase your team productivity by leveraging our native AI employees.",
  },
  {
    icon: (
      <span className="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M9.23047 9H7.2002C6.08009 9 5.51962 9 5.0918 9.21799C4.71547 9.40973 4.40973 9.71547 4.21799 10.0918C4 10.5196 4 11.0801 4 12.2002V17.8002C4 18.9203 4 19.4801 4.21799 19.9079C4.40973 20.2842 4.71547 20.5905 5.0918 20.7822C5.5192 21 6.07902 21 7.19694 21H16.8031C17.921 21 18.48 21 18.9074 20.7822C19.2837 20.5905 19.5905 20.2842 19.7822 19.9079C20 19.4805 20 18.9215 20 17.8036V12.1969C20 11.079 20 10.5192 19.7822 10.0918C19.5905 9.71547 19.2837 9.40973 18.9074 9.21799C18.4796 9 17.9203 9 16.8002 9H14.7689M9.23047 9H14.7689M9.23047 9C9.10302 9 9 8.89668 9 8.76923V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V8.76923C15 8.89668 14.8964 9 14.7689 9"
            stroke="#1E1E1E"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    ),
    title: "Secure Hosting",
    description:
      "Your menus are hosted securely and reliably with fast loading times.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.2,
      duration: 0.6,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const OurServices: React.FC = () => (
  <motion.section className="our-services" id="services"     initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={containerVariants}>
    <motion.h1 className="section-title" variants={itemVariants}>Value Driven Services</motion.h1>
    <motion.div
      className="services-grid"
    >
      {services.map((svc, i) => (
        <motion.div key={i} className="service-card" variants={itemVariants}>
          <div className="service-header">
            <div className="service-icon">{svc.icon}</div>
            <h3 className="service-title">{svc.title}</h3>
          </div>
          <p className="service-desc">{svc.description}</p>
        </motion.div>
      ))}
    </motion.div>

    {/* <div className="services-grid">
      <div className="service-card">
        <div className="service-header">
          <div className="service-icon"></div>
          <h3 className="service-title">Custom Digital Menus</h3>
        </div>
        <p className="service-desc">
          Design and deploy personalized menus for cafes and restaurants using
          QR codes.
        </p>
      </div>
    </div> */}
  </motion.section>
);

export default OurServices;
