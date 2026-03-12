import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductFormPage from './pages/ProductFormPage'
import MyProductsPage from './pages/MyProductsPage'
import CartPage from './pages/CartPage'
import MyOrdersPage from './pages/MyOrdersPage'
import SalesOrdersPage from './pages/SalesOrdersPage'
import AllOrdersPage from './pages/AllOrdersPage'
import AdminUsersPage from './pages/AdminUsersPage'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={
            <ProtectedRoute roles={['SELLER']}>
              <ProductFormPage />
            </ProtectedRoute>
          } />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id/edit" element={
            <ProtectedRoute roles={['SELLER', 'ADMIN']}>
              <ProductFormPage />
            </ProtectedRoute>
          } />
          <Route path="/my-products" element={
            <ProtectedRoute roles={['SELLER']}>
              <MyProductsPage />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute roles={['BUYER']}>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/my" element={
            <ProtectedRoute roles={['BUYER']}>
              <MyOrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/sales" element={
            <ProtectedRoute roles={['SELLER']}>
              <SalesOrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/all" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AllOrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  )
}
