import SignupForm from "../features/authentication/SignupForm";
import AuthLayout from "../ui/AuthLayout";
import SEO from "../ui/SEO";

function Signup() {
  return (
    <>
      <SEO title="Kaydol | Umut Usta Yönetim" description="Ekip erişimi isteyin." />
      <AuthLayout
        eyebrow="Yeni ekip hesabı"
        title="Ekip erişimi isteyin"
        description="Bilgilerinizi girin. İşletme sahibi hesabınızı onaylayıp çalışma rolünüzü belirledikten sonra panel erişiminiz açılır.">
        <SignupForm />
      </AuthLayout>
    </>
  );
}

export default Signup;
