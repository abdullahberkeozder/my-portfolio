import SignupForm from "../features/authentication/SignupForm";
import AuthLayout from "../ui/AuthLayout";

function Signup() {
  return (
    <AuthLayout
      eyebrow="Yeni yönetici hesabı"
      title="Admin üyeliği oluştur"
      description="Bilgilerinizi girin. Hesabınız, yetkili bir yönetici tarafından onaylandıktan sonra kullanıma açılır.">
      <SignupForm />
    </AuthLayout>
  );
}

export default Signup;
