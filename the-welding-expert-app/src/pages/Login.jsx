import LoginForm from "../features/authentication/LoginForm";
import AuthLayout from "../ui/AuthLayout";

function Login() {
  return (
    <AuthLayout
      eyebrow="Ekip yönetimi"
      title="Yönetim paneli girişi"
      description="Randevuları ve iş takvimini yönetmek için ekip hesabınızla giriş yapın.">
      <LoginForm />
    </AuthLayout>
  );
}

export default Login;
