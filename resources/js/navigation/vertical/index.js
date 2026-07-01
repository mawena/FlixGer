const adminNav = [
  {
    title: 'Tableau de bord',
    icon: { icon: 'tabler-layout-dashboard' },
    to: 'admin-dashboard',
  },
  {
    title: 'Plateformes',
    icon: { icon: 'tabler-brand-netflix' },
    to: 'admin-platforms',
  },
  {
    title: 'Comptes maîtres',
    icon: { icon: 'tabler-key' },
    to: 'admin-accounts',
  },
  {
    title: 'Profils / Écrans',
    icon: { icon: 'tabler-user-circle' },
    to: 'admin-profiles',
  },
  {
    title: 'Commandes',
    icon: { icon: 'tabler-shopping-cart' },
    to: 'admin-orders',
  },
  {
    title: 'Utilisateurs',
    icon: { icon: 'tabler-users' },
    to: 'admin-users',
  },
]

const clientNav = [
  {
    title: 'Mon espace',
    icon: { icon: 'tabler-home' },
    to: 'client-dashboard',
  },
  {
    title: 'Mes abonnements',
    icon: { icon: 'tabler-device-tv' },
    to: 'client-orders',
  },
  {
    title: 'Catalogue',
    icon: { icon: 'tabler-apps' },
    to: 'catalog',
  },
]

export default (userData) => {
  return userData?.role === 'admin' ? adminNav : clientNav
}
