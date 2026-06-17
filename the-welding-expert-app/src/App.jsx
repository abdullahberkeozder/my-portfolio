import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import GlobalStyles from "./styles/GlobalStyles";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Availability from "./pages/Availability";
import CustomerBooking from "./pages/CustomerBooking";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PageNotFound from "./pages/PageNotFound";
import AppLayout from "./ui/AppLayout";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <GlobalStyles />
        <BrowserRouter>
          <Routes>
            <Route
              index
              element={
                <Navigate
                  replace
                  to="/appointment"
                />
              }
            />
            <Route
              path="appointment"
              element={<CustomerBooking />}
            />
            <Route
              path="gallery"
              element={<Gallery />}
            />

            <Route
              path="admin"
              element={<AppLayout />}>
              <Route
                index
                element={
                  <Navigate
                    replace
                    to="dashboard"
                  />
                }
              />
              <Route
                path="dashboard"
                element={<Dashboard />}
              />
              <Route
                path="bookings"
                element={<Bookings />}
              />
              <Route
                path="availability"
                element={<Availability />}
              />
            </Route>

            <Route
              path="dashboard"
              element={
                <Navigate
                  replace
                  to="/admin/dashboard"
                />
              }
            />
            <Route
              path="bookings"
              element={
                <Navigate
                  replace
                  to="/admin/bookings"
                />
              }
            />

            <Route
              path="login"
              element={<Login />}
            />
            <Route
              path="signup"
              element={<Signup />}
            />
            <Route
              path="*"
              element={<PageNotFound />}
            />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
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
    </>
  );
}

export default App;
