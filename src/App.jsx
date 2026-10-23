import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AuthProvider } from '@/context/AuthContext'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ManageBookings from '@/pages/admin/ManageBookings'
import ManageTrips from '@/pages/admin/ManageTrips'
import TripEdit from '@/pages/admin/TripEdit'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import BookingDetails from '@/pages/booking/BookingDetails'
import BookingSubmitted from '@/pages/booking/BookingSubmitted'
import Checkout from '@/pages/booking/Checkout'
import CustomerDashboard from '@/pages/customer/Dashboard'
import MyBookings from '@/pages/customer/MyBookings'
import Profile from '@/pages/customer/Profile'
import NotFound from '@/pages/NotFound'
import Cancellation from '@/pages/public/Cancellation'
import Contact from '@/pages/public/Contact'
import Home from '@/pages/public/Home'
import Privacy from '@/pages/public/Privacy'
import Terms from '@/pages/public/Terms'
import TripDetail from '@/pages/public/TripDetail'
import Trips from '@/pages/public/Trips'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PageWrapper />}>
              <Route index element={<Home />} />
              <Route path="trips" element={<Trips />} />
              <Route path="trips/:slug" element={<TripDetail />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="cancellation" element={<Cancellation />} />

              <Route
                path="login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="signup"
                element={
                  <GuestRoute>
                    <Signup />
                  </GuestRoute>
                }
              />

              <Route
                path="checkout/:tripId"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="booking/submitted"
                element={
                  <ProtectedRoute>
                    <BookingSubmitted />
                  </ProtectedRoute>
                }
              />
              <Route
                path="booking/:id"
                element={
                  <ProtectedRoute>
                    <BookingDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/trips"
                element={
                  <ProtectedRoute requireAdmin>
                    <ManageTrips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/trips/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <TripEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/trips/:tripId/edit"
                element={
                  <ProtectedRoute requireAdmin>
                    <TripEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/bookings"
                element={
                  <ProtectedRoute requireAdmin>
                    <ManageBookings />
                  </ProtectedRoute>
                }
              />

              <Route path="home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
