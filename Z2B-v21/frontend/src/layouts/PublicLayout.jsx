/**
 * Public Layout
 * Layout for public pages (landing, login, register)
 */

import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import './PublicLayout.css';

const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-main">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
