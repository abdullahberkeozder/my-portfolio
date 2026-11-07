import LoginForm from "../features/authentication/LoginForm";
import AuthLayout from "../ui/AuthLayout";
import SEO from "../ui/SEO";

function Login() {
  return (
    <>
      <SEO
        title="Giriş Yap | Umut Usta Yönetim"
        description="Yönetim paneli girişi."
        canonicalPath="/login"
        noIndex
      />
      <AuthLayout
        eyebrow="Ekip yönetimi"
        title="Yönetim paneli girişi"
        description="Randevuları ve iş takvimini yönetmek için ekip hesabınızla giriş yapın.">
        <LoginForm />
      </AuthLayout>
    </>
  );
}

export default Login;
