import { onAuthStateChanged } from "firebase/auth";
import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Loader from "./components/Loader";
import Navbar from "./components/NavBar";
import ProtectedRoute from "./components/protectedRoute";
import { auth } from "./firebase";
import { getUser } from "./redux/api/userAPI";
import { userExist, userNotExist } from "./redux/reducer/userSlice";
import { RootState } from "./redux/store";
const Home = lazy(() => import("./pages/Home"));
const Cart = lazy(() => import("./pages/Cart"));
const Search = lazy(() => import("./pages/Search"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Not logged in route
const Login = lazy(() => import("./pages/Login"));

// Logged in user routes
const Shipping = lazy(() => import("./pages/Shipping"));
const Orders = lazy(() => import("./pages/Orders"));

const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const Products = lazy(() => import("./pages/admin/products"));
const Customers = lazy(() => import("./pages/admin/customers"));
const Transaction = lazy(() => import("./pages/admin/transaction"));
const Barcharts = lazy(() => import("./pages/admin/charts/barcharts"));
const Piecharts = lazy(() => import("./pages/admin/charts/piecharts"));
const Linecharts = lazy(() => import("./pages/admin/charts/linecharts"));
const Coupon = lazy(() => import("./pages/admin/apps/coupon"));
const Stopwatch = lazy(() => import("./pages/admin/apps/stopwatch"));
const Toss = lazy(() => import("./pages/admin/apps/toss"));
const NewProduct = lazy(() => import("./pages/admin/management/newproduct"));
const ProductManagement = lazy(
  () => import("./pages/admin/management/productmanagement")
);
const TransactionManagement = lazy(
  () => import("./pages/admin/management/transactionmanagement")
);
const CouponManagement = lazy(
  () => import("./pages/admin/management/couponmanagement")
);
const Discount = lazy(
  () => import("./pages/Discount")
);
const NewCoupon = lazy(
  () => import("./pages/admin/management/newcoupon")
);

const App = () => {
  const { user, loading } = useSelector(
    (state: RootState) => state.userReducer
  );
  const dispatch = useDispatch();
  
  const [loadingAuthState, setLoadingAuthState] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getUser(user.uid);
        dispatch(userExist(data.user));
      } else {
        dispatch(userNotExist());
      }
      setLoadingAuthState(false); // Auth check complete
    });

    return () => unsubscribe(); // Clean up subscription
  }, [dispatch]);

  if (loadingAuthState || loading) {
    return <Loader />; // Show loader while checking auth state
  }

  return (
    <Router>
      <Navbar user={user} />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route
            path="/login"
            element={
              <ProtectedRoute isAuthenticated={!user}>
                <Login />
              </ProtectedRoute>
            }
          />

          {/* Logged in routes  */}
          <Route
            element={<ProtectedRoute isAuthenticated={!!user} />}
          >
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* Admin routes */}
          <Route
            element={
              <ProtectedRoute
                isAuthenticated={!!user}
                adminOnly={true}
                admin={user?.role === "admin"}
              />
            }
          >
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/product" element={<Products />} />
            <Route path="/admin/customer" element={<Customers />} />
            <Route path="/admin/transaction" element={<Transaction />} />
            <Route path="/admin/coupons" element={<Discount />} />
          </Route>

          {/* Charts */}
          <Route path="/admin/chart/bar" element={<Barcharts />} />
          <Route path="/admin/chart/pie" element={<Piecharts />} />
          <Route path="/admin/chart/line" element={<Linecharts />} />

          {/* Apps */}
          <Route path="/admin/app/coupon" element={<Coupon />} />
          <Route path="/admin/app/stopwatch" element={<Stopwatch />} />
          <Route path="/admin/app/toss" element={<Toss />} />

          {/* Management */}
          <Route path="/admin/product/new" element={<NewProduct />} />
          <Route path="/admin/product/:id" element={<ProductManagement />} />
          <Route path="/admin/coupon/new" element={<NewCoupon />} />
          <Route path="/admin/coupon/:id" element={<CouponManagement />} />
          <Route
            path="/admin/transaction/:id"
            element={<TransactionManagement />}
          />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-center" />
    </Router>
  );
};

export default App;
