import React from 'react';
import { Navigate } from 'react-router-dom';
/**
 * ServicesPage has been removed in favor of a streamlined Pricing-first journey.
 * Redirecting to /pricing to maintain SEO and user flow.
 */
export default function ServicesPage() {
  return <Navigate to="/pricing" replace />;
}