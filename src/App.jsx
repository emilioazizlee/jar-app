import { Toaster } from "@/components/ui/toaster"
import ErrorBoundary from './components/ErrorBoundary';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SettingsProvider } from '@/lib/settingsContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { lazy, Suspense } from 'react';

import AppLayout from './components/layout/AppLayout.jsx';

// Lazy-loaded pages — split into separate chunks to reduce initial bundle
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Tasks            = lazy(() => import('./pages/Tasks'));
const Spends           = lazy(() => import('./pages/Spends'));
const Subscriptions    = lazy(() => import('./pages/Subscriptions'));
const Payments         = lazy(() => import('./pages/Payments'));
const Insights         = lazy(() => import('./pages/Insights'));
const CalendarPage     = lazy(() => import('./pages/CalendarPage'));
const ProjectPage      = lazy(() => import('./pages/ProjectPage'));
const Diet             = lazy(() => import('./pages/Diet'));
const Groceries        = lazy(() => import('./pages/Groceries'));
const Leisure          = lazy(() => import('./pages/Leisure'));
const Finance          = lazy(() => import('./pages/Finance'));
const Favorites        = lazy(() => import('./pages/Favorites'));
const Settings         = lazy(() => import('./pages/Settings'));
const Help             = lazy(() => import('./pages/Help'));
const MyBrands         = lazy(() => import('./pages/MyBrands'));
const StepTemplateLibrary = lazy(() => import('./components/settings/StepTemplateLibrary'));
const TaskDetail       = lazy(() => import('./pages/TaskDetail'));
const Entries          = lazy(() => import('./pages/Entries'));
const PrivacyPolicy    = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService   = lazy(() => import('./pages/TermsOfService'));
const BudgetLimits     = lazy(() => import('./pages/BudgetLimits'));
const PlannerVisual    = lazy(() => import('./pages/PlannerVisual'));
const CategoryManager  = lazy(() => import('./pages/CategoryManager'));
const CustomFieldsManager = lazy(() => import('./pages/CustomFieldsManager'));
const ComponentMarketplace = lazy(() => import('./pages/ComponentMarketplace'));
const StarterPackBrowser = lazy(() => import('./pages/StarterPackBrowser'));
const AdvancedAnalytics = lazy(() => import('./pages/AdvancedAnalytics'));
const CurrencyRates    = lazy(() => import('./pages/CurrencyRates'));
const CloudSync        = lazy(() => import('./pages/CloudSync'));
const AccountantExport = lazy(() => import('./pages/AccountantExport'));
const JarsPage         = lazy(() => import('./pages/Jars'));

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
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-3xl font-bold text-primary tracking-widest">JAR</span>
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    }>
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
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App