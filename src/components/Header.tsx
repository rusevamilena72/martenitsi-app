import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LogIn, ShoppingCart, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { user, profile, signOut } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { path: '/', label: 'Начало' },
    { path: '/komplekti', label: 'Комплекти' },
    { path: '/unikalni', label: 'Уникални' },
    { path: '/grivni', label: 'Гривни' },
    { path: '/cvetya', label: 'Цветя' },
    { path: '/zhivotni', label: 'Животни' },
    { path: '/detski', label: 'Детски' },
    { path: '/gerdani', label: 'Гердани' },
    { path: '/contact', label: 'Свържи се с нас' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-white rounded-full"></div>
            <span className="text-xl font-bold text-gray-800">Мартеници</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Търси..."
                className="w-36 lg:w-48 pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </form>

            <Link
              to="/order"
              className="relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <ShoppingCart size={18} />
              Поръчай
              {totalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User size={18} />
                  <span>{profile?.username || 'Потребител'}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} />
                      Моят профил
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} />
                      Изход
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogIn size={18} />
                Вход
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <form onSubmit={handleSearchSubmit} className="relative px-4 mb-3">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Търси..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/order"
              onClick={() => setIsMenuOpen(false)}
              className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-md mx-4"
            >
              <ShoppingCart size={18} />
              Поръчай
              {totalCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>
            <div className="border-t mt-2 pt-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <User size={18} />
                    {profile?.username || 'Моят профил'}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Изход
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-md"
                >
                  <LogIn size={18} />
                  Вход
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
