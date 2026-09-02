import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import SignIn from './pages/auth/SignIn';
import SignInVerification from './pages/auth/SignInVerification';
import AuthSuccess from './pages/auth/AuthSuccess';
import AmazonCallback from './pages/auth/AmazonCallback';
import ForgotPassword from './pages/auth/ForgotPassword';
import ForgotPasswordVerification from './pages/auth/ForgotPasswordVerification';
import CreateNewPassword from './pages/auth/CreateNewPassword';
import Registration from './pages/auth/Registration';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import BrandDetails from './pages/BrandDetails';
import AddStore from './pages/AddStore';
import Stores from './pages/Stores';
import AdsCallback from './pages/auth/AdsCallback';
import NotFound from './pages/NotFound';
import DashboardLayout from './layouts/DashboardLayout';
import { UserProfileProvider } from './context/UserProfileContext';
import { StoreProvider } from './context/StoreContext';
import { AUTH_COOKIE_KEY, getCookie } from "./utils/cookie";
import SyncOverlayWrapper from './components/ui/SyncOverlayWrapper';

import ASINList from './pages/ASINList';
import ASINGrouping from './pages/ASINGrouping';
import CampaignList from './pages/CampaignList';
import AdvertisedProduct from './pages/AdvertisedProduct';
import AdGroupPerformance from './pages/AdGroupPerformance';
import BudgetPacing from './pages/BudgetPacing';
import CampaignPerformance from './pages/CampaignPerformance';
import KeywordTargeting from './pages/KeywordTargeting';
import NegativeKeywordList from './pages/NegativeKeywordList';
import PlacementReport from './pages/PlacementReport';
import SearchTermReport from './pages/SearchTermReport';
import NegativeTargetList from './pages/NegativeTargetList';
import CreateRule from './pages/CreateRule';
import RuleList from './pages/RuleList';
import RuleDetails from './pages/RuleDetails';

const PrivateRoute = () => {
  const token = getCookie(AUTH_COOKIE_KEY);

  return token ? (
    <UserProfileProvider>
      <StoreProvider>
        <Outlet />
      </StoreProvider>
    </UserProfileProvider>
  ) : (
    <Navigate to="/sign-in" replace />
  );
};

const PublicRoute = () => {
  const token = getCookie(AUTH_COOKIE_KEY);

  return token ? <Navigate to="/" replace /> : <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-in/verification" element={<SignInVerification />} />
        <Route path="/sign-up" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/verification" element={<ForgotPasswordVerification />} />
        <Route path="/forgot-password/new-password" element={<CreateNewPassword />} />
      </Route>

      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/auth/callback" element={<AmazonCallback />} />

      <Route path="/" element={<PrivateRoute />}>
        <Route path="ads/callback" element={<AdsCallback />} />

        <Route element={<DashboardLayout />}>
          <Route
            element={
              <SyncOverlayWrapper>
                <Outlet />
              </SyncOverlayWrapper>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="rule-builder" element={<RuleList />} />
            <Route path="rule-builder/create" element={<CreateRule />} />
            <Route path="rule-builder/edit/:ruleId" element={<CreateRule />} />
            <Route path="rule-builder/details/:ruleId" element={<RuleDetails />} />

            <Route path="asin-list" element={<ASINList />} />
            <Route path="asin-grouping" element={<ASINGrouping />} />

            <Route path="reports/campaign-list" element={<CampaignList />} />
            <Route path="reports/advertised-product" element={<AdvertisedProduct />} />
            <Route path="reports/ad-group-performance" element={<AdGroupPerformance />} />
            <Route path="reports/budget-pacing" element={<BudgetPacing />} />
            <Route path="reports/campaign-performance" element={<CampaignPerformance />} />
            <Route path="reports/keyword-targeting" element={<KeywordTargeting />} />
            <Route path="reports/negative-keyword-list" element={<NegativeKeywordList />} />
            <Route path="reports/negative-target-list" element={<NegativeTargetList />} />
            <Route path="reports/placement-report" element={<PlacementReport />} />
            <Route path="reports/search-term-report" element={<SearchTermReport />} />
          </Route>

          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="brand-details" element={<BrandDetails />} />
          <Route path="stores" element={<Stores />} />
          <Route path="add-store" element={<AddStore />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
