import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { OverviewTab } from '../../components/dashboard/OverviewTab';
import { CategoriesTab } from '../../components/dashboard/CategoriesTab';
import { ProductsTab } from '../../components/dashboard/ProductsTab';
import { AppearanceTab } from '../../components/dashboard/AppearanceTab';
import { QRCodeTab } from '../../components/dashboard/QRCodeTab';
import { SubscriptionTab } from '../../components/dashboard/SubscriptionTab';
import { TeamTab } from '../../components/dashboard/TeamTab';
import { SupportTab } from '../../components/dashboard/SupportTab';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onNavigateTab={setActiveTab} />;
      case 'categories':
        return <CategoriesTab />;
      case 'products':
        return <ProductsTab />;
      case 'appearance':
        return <AppearanceTab />;
      case 'qr':
        return <QRCodeTab />;
      case 'subscriptions':
        return <SubscriptionTab />;
      case 'team':
        return <TeamTab />;
      case 'support':
        return <SupportTab />;
      default:
        return <OverviewTab onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};
