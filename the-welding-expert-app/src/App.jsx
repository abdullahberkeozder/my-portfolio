import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import GlobalStyles from "./styles/GlobalStyles";
import RouteFallback from "./ui/RouteFallback";
import { ROUTE_ROLES } from "./utils/adminPermissions";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Availability = lazy(() => import("./pages/Availability"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const GalleryAdmin = lazy(() => import("./pages/GalleryAdmin"));
const ServiceConfigs = lazy(() => import("./pages/ServiceConfigs"));
const CustomerBooking = lazy(() => import("./pages/CustomerBooking"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const AppLayout = lazy(() => import("./ui/AppLayout"));
const ProtectedRoute = lazy(() => import("./ui/ProtectedRoute"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route index element={<Navigate replace to="/appointment" />} />
        <Route path="appointment" element={<CustomerBooking />} />
        <Route path="gallery" element={<Gallery />} />

        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<AppLayout />}>
            <Route index element={<Navigate replace to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route element={<ProtectedRoute allowedRoles={ROUTE_ROLES.bookings} />}>
              <Route path="bookings" element={<Bookings />} />
            </Route>
            <Route
              element={<ProtectedRoute allowedRoles={ROUTE_ROLES.availability} />}>
              <Route path="availability" element={<Availability />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={ROUTE_ROLES.gallery} />}>
              <Route path="gallery" element={<GalleryAdmin />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={ROUTE_ROLES.users} />}>
              <Route path="users" element={<AdminUsers />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={ROUTE_ROLES.services} />}>
              <Route path="services" element={<ServiceConfigs />} />
            </Route>
          </Route>
        </Route>

        <Route path="dashboard" element={<Navigate replace to="/admin/dashboard" />} />
        <Route path="bookings" element={<Navigate replace to="/admin/bookings" />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "12px 16px",
            backgroundColor: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
