import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BackgroundProvider from './components/BackgroundProvider';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import KomplektiPage from './pages/KomplektiPage';
import UnikalniPage from './pages/UnikalniPage';
import GrivniPage from './pages/GrivniPage';
import CvetyaPage from './pages/CvetyaPage';
import ZhivotniPage from './pages/ZhivotniPage';
import DetskiPage from './pages/DetskiPage';
import GerdaniPage from './pages/GerdaniPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NewListingPage from './pages/NewListingPage';
import EditListingPage from './pages/EditListingPage';
import ContactPage from './pages/ContactPage';
import OrderPage from './pages/OrderPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <BackgroundProvider>
          <div className="flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/komplekti" element={<KomplektiPage />} />
              <Route path="/unikalni" element={<UnikalniPage />} />
              <Route path="/grivni" element={<GrivniPage />} />
              <Route path="/cvetya" element={<CvetyaPage />} />
              <Route path="/zhivotni" element={<ZhivotniPage />} />
              <Route path="/detski" element={<DetskiPage />} />
              <Route path="/gerdani" element={<GerdaniPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/listings/new"
                element={
                  <ProtectedRoute>
                    <NewListingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/listings/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditListingPage />
                  </ProtectedRoute>
                }
              />
              </Routes>
            </main>
            <Footer />
          </div>
        </BackgroundProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
