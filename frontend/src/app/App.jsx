import AppProviders from './AppProviders';
import AppRoutes from '../routes/AppRoutes';
import PromoBanner from '../components/PromoBanner/PromoBanner';

export default function App() {
  return (
    <AppProviders>
      <PromoBanner />
      <AppRoutes />
    </AppProviders>
  );
}