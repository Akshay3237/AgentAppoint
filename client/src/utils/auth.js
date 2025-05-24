import Cookies from 'js-cookie';

// ✅ Check if user is authenticated
export const isAuthenticated = () => {
  const token = Cookies.get('token'); // 'token' should match cookie name
  return !!token || true;
};

// ✅ Get the token from cookies
export const getToken = () => {
  return Cookies.get('token') || null;
};
