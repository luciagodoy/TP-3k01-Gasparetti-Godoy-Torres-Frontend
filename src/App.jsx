import { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import RoomCategories from './pages/RoomCategories';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchRooms from './pages/SearchRooms';
import NotFound from './pages/NotFound';
import { ADMIN_ROLES, STAFF_ROLES } from './models';
import './styles/global.scss';
import './App.scss';

const Reservations = lazy(() => import('./pages/Reservations'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Guests = lazy(() => import('./pages/Guests'));
const CheckInOut = lazy(() => import('./pages/CheckInOut'));
const Amenities = lazy(() => import('./pages/Amenities'));
const Employees = lazy(() => import('./pages/Employees'));
const Provinces = lazy(() => import('./pages/Provinces'));
const Cities = lazy(() => import('./pages/Cities'));
const AmenityQuotas = lazy(() => import('./pages/AmenityQuotas'));
const AmenityPrices = lazy(() => import('./pages/AmenityPrices'));
const ReservationAmenities = lazy(() => import('./pages/ReservationAmenities'));
const PricingRules = lazy(() => import('./pages/PricingRules'));
const Users = lazy(() => import('./pages/Users'));
const MyReservations = lazy(() => import('./pages/MyReservations'));
const BookRoom = lazy(() => import('./pages/BookRoom'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<SearchRooms />} />
          <Route path="room-categories" element={<RoomCategories />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          {/* Same levels as the backend: auth.staff (employee or admin) for the
              hotel operation and auth.admin only for accounts and staff. */}
          <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
            <Route path="reservations" element={<Reservations />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="guests" element={<Guests />} />
            <Route path="check-in" element={<CheckInOut />} />
            <Route path="amenities" element={<Amenities />} />
            <Route path="provinces" element={<Provinces />} />
            <Route path="cities" element={<Cities />} />
            <Route path="amenity-quotas" element={<AmenityQuotas />} />
            <Route path="amenity-prices" element={<AmenityPrices />} />
            <Route path="reservation-amenities" element={<ReservationAmenities />} />
            <Route path="pricing-rules" element={<PricingRules />} />
          </Route>
          <Route element={<ProtectedRoute roles={ADMIN_ROLES} />}>
            <Route path="employees" element={<Employees />} />
            <Route path="users" element={<Users />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="my-reservations" element={<MyReservations />} />
            <Route path="book" element={<BookRoom />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
