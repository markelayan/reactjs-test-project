import React from 'react';

const ThankYou = React.lazy(() => import('./views/dashboard/ThankYou'));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/thankyou', name: 'Thank You', component: ThankYou },
];

export default routes;
