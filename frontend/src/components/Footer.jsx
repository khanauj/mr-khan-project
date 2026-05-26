import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-lowest dark:bg-black w-full border-t border-outline-variant/20 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 py-12 max-w-[1200px] mx-auto gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="font-geist text-2xl font-black text-on-surface tracking-tighter">
            Skillence
          </div>
          <div className="font-sans text-xs text-on-surface-variant">
            © {currentYear} Skillence. Engineered by Data.
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 font-mono text-[12px] text-on-surface-variant">
          <Link to="/" className="hover:text-tertiary transition-colors duration-200">Home</Link>
          <Link to="/profile" className="hover:text-tertiary transition-colors duration-200">Profile</Link>
          <Link to="/dashboard" className="hover:text-tertiary transition-colors duration-200">Dashboard</Link>
          <Link to="/skill-gap" className="hover:text-tertiary transition-colors duration-200">Skill Gap</Link>
          <Link to="/resume-match" className="hover:text-tertiary transition-colors duration-200">Resume</Link>
          <Link to="/about" className="hover:text-tertiary transition-colors duration-200">About Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
