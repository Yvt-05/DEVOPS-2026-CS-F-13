import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-5">
      <Link to="/" className="font-semibold tracking-widest">
        BUILDSYNC
      </Link>

      <div className="flex gap-6 text-sm">
        <Link to="/projects">Projects</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  );
}

export default Navbar;