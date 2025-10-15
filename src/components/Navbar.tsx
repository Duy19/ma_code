import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: "Free Scheduler", path: "/free-scheduler" },
    { name: "Chapter 1", path: "/chapter-1" },
    { name: "Chapter 2", path: "/chapter-2" },
    { name: "Chapter 3", path: "/chapter-3" },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 text-white px-6 py-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight hover:text-blue-400 transition-colors"
        >
          Real-Time Games
        </Link>

        <div className="flex space-x-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative pb-1 transition-colors hover:text-blue-300 ${
                location.pathname === link.path ? "text-blue-400" : "text-gray-200"
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <span className="absolute left-0 -bottom-0.5 h-[2px] w-full bg-blue-400 rounded-full"></span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
