import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

export default function GoogleLoginButton({ onSuccess }) {
  const { loginWithGoogle } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('❌ Google login failed:', err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error('❌ Google login popup failed')}
    />
  );
}