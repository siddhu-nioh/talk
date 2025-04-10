import { FaHome, FaPlusCircle, FaSearch, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";
function Footer() {
      return (
            <footer className="footer">
                  <Link to="/talk" className="button-footer">
                        <div id="home" className="footer-item">
                              <FaHome />
                        </div>
                  </Link>
                  <Link to="/talk/new" className="button-footer">
                        <div id="upload" className="footer-item">
                              <FaPlusCircle />
                        </div>
                  </Link>
                  <Link to="/talk/search" className="button-footer">
                        <div id="search" className="footer-item">
                              <FaSearch />
                        </div>
                  </Link>
                  <Link to="/talk/user" className="button-footer">
                        <div id="account" className="footer-item">
                              <FaUser />
                        </div>
                  </Link>
            </footer>
      );
};

export default Footer;