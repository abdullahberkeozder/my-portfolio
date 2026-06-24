import LoginForm from "../features/authentication/LoginForm";
import AuthLayout from "../ui/AuthLayout";

function Login() {
  return (
    <AuthLayout
      eyebrow="Yönetim paneli"
      title="Admin girişi"
      description="Randevuları ve müsaitlik takvimini yönetmek için hesabınızla giriş yapın.">
      <LoginForm />
    </AuthLayout>
  );
}

export default Login;
