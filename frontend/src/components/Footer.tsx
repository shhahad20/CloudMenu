import "../styles/footer.scss";

const Footer: React.FC = () => {
  const cureentYear = new Date().getFullYear();
  return (
    <section id="footer-section">
      <footer className="footer">
        <div className="footer-container">
          {/* Footer content */}
          <div className="flex-wrap">
            {/* Company Column */}
            <div>
              <h3 className="">Company</h3>
              <ul className="">
                <li>
                  <a href="#" className="">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="">
                    Customers
                  </a>
                </li>
                <li>
                  <a href="#" className="">
                    About us
                  </a>
                </li>
              </ul>
            </div>
            {/* Product Column */}
            <div>
              <h3 className="">Product</h3>
              <ul className="">
                <li>
                  <a href="/faqs" className="">
                    How to Start
                  </a>
                </li>
                <li>
                  <a href="/contact" className="">
                    Request Design ↗
                  </a>
                </li>
                <li>
                  <a href="/menus" className="">
                    Menu Templates ↗
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="">Resources</h3>
              <ul className="">
                <li>
                  <a href="#" className="">
                    Docs ↗
                  </a>
                </li>
                <li>
                  <a href="#" className="">
                    Star us on GitHub ↗
                  </a>
                </li>
                <li>
                  <a href="#" className="">
                    Newsletter
                  </a>
                </li>
                <li>
                  <a href="/contact" className="">
                    Support
                  </a>
                </li>
                {/* Social Media Icons */}
                {/* <div className="icons-container">
                  <a href="#" className="">
                    <img
                      src="/githubIcon.svg"
                      alt="GitHub Icon"
                    />
                  </a>
                  <a href="#" className="">
                    <img
                      src="/linkedinIcon.svg"
                      alt="LinkedIn Icon"
                    />
                  </a>
                </div> */}
              </ul>
            </div>
          </div>

          {/* Footer bottom content */}
          <div className="footer-bottom">
            <div className="">
              © {cureentYear} SHAHAD ALTHARWA. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default Footer;