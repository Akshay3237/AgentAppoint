import Cookies from 'js-cookie';
export const isAuthenticated = () => {
  const token = Cookies.get('token'); // 'token' should match cookie name
  return !!token||true;
};
