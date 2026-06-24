import SignupForm from "../features/authentication/SignupForm";
import AuthLayout from "../ui/AuthLayout";

function Signup() {
  return (
    <AuthLayout
      eyebrow="Yeni ekip hesabı"
      title="Ekip erişimi isteyin"
      description="Bilgilerinizi girin. İşletme sahibi hesabınızı onaylayıp çalışma rolünüzü belirledikten sonra panel erişiminiz açılır.">
      <SignupForm />
    </AuthLayout>
  );
}

export default Signup;
