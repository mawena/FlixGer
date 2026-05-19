const adminNav = [
  {
    title: 'Tableau de bord',
    icon: { icon: 'tabler-layout-dashboard' },
    to: 'flixger-admin-dashboard',
  },
  {
    title: 'Plateformes',
    icon: { icon: 'tabler-brand-netflix' },
    to: 'flixger-admin-platforms',
  },
  {
    title: 'Comptes maîtres',
    icon: { icon: 'tabler-key' },
    to: 'flixger-admin-accounts',
  },
  {
    title: 'Profils / Écrans',
    icon: { icon: 'tabler-user-circle' },
    to: 'flixger-admin-profiles',
  },
  {
    title: 'Commandes',
    icon: { icon: 'tabler-shopping-cart' },
    to: 'flixger-admin-orders',
  },
]

const clientNav = [
  {
    title: 'Mon espace',
    icon: { icon: 'tabler-home' },
    to: 'flixger-client-dashboard',
  },
  {
    title: 'Mes abonnements',
    icon: { icon: 'tabler-device-tv' },
    to: 'flixger-client-orders',
  },
  {
    title: 'Catalogue',
    icon: { icon: 'tabler-apps' },
    to: 'flixger-catalog',
  },
]

export default (userData) => {
  return userData?.role === 'admin' ? adminNav : clientNav
}
