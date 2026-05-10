import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SettingsProvider } from '@/lib/settingsContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout.jsx';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Spends from './pages/Spends';
import Subscriptions from './pages/Subscriptions';
import Payments from './pages/Payments';
import Insights from './pages/Insights';
import CalendarPage from './pages/CalendarPage';
import ProjectPage from './pages/ProjectPage';
import Diet from './pages/Diet';
import Groceries from './pages/Groceries';
import Health from './pages/Health';
import Leisure from './pages/Leisure';
import Finance from './pages/Finance';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import Help from './pages/Help';
import MyBrands from './pages/MyBrands';
import StepTemplateLibrary from './components/settings/StepTemplateLibrary';
import TaskDetail from './pages/TaskDetail';
import Entries from './pages/Entries';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import BudgetLimits from './pages/BudgetLimits';
import PlannerVisual from './pages/PlannerVisual';
import CategoryManager from './pages/CategoryManager';
import CustomFieldsManager from './pages/CustomFieldsManager';
import ComponentMarketplace from './pages/ComponentMarketplace';
import StarterPackBrowser from './pages/StarterPackBrowser';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import CurrencyRates from './pages/CurrencyRates';
import CloudSync from './pages/CloudSync';
import AccountantExport from './pages/AccountantExport';
import JarsPage from './pages/Jars';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-3xl font-bold text-primary tracking-widest">JAR</span>
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:taskId" element={<TaskDetail />} />
        <Route path="/spends" element={<Spends />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/groceries" element={<Groceries />} />
        <Route path="/health" element={<Health />} />
        <Route path="/leisure" element={<Leisure />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/brands" element={<MyBrands />} />
        <Route path="/settings/templates" element={<StepTemplateLibrary />} />
        <Route path="/help" element={<Help />} />
        <Route path="/entries" element={<Entries />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/settings/budgets" element={<BudgetLimits />} />
        <Route path="/premium/planner" element={<PlannerVisual />} />
        <Route path="/premium/analytics" element={<AdvancedAnalytics />} />
        <Route path="/premium/currency" element={<CurrencyRates />} />
        <Route path="/premium/sync" element={<CloudSync />} />
        <Route path="/premium/export" element={<AccountantExport />} />
        <Route path="/settings/categories" element={<CategoryManager />} />
        <Route path="/settings/custom-fields" element={<CustomFieldsManager />} />
        <Route path="/marketplace" element={<ComponentMarketplace />} />
        <Route path="/starter" element={<StarterPackBrowser />} />
        <Route path="/jars" element={<JarsPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App