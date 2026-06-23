import supabase from "./supabase";

const AUTH_ERROR_MESSAGES = [
  ["invalid login credentials", "E-posta adresi veya şifre hatalı."],
  ["email not confirmed", "Giriş yapmadan önce e-posta adresinizi doğrulayın."],
  ["user already registered", "Bu e-posta adresiyle daha önce hesap açılmış."],
  ["password should be", "Şifre güvenlik koşullarını karşılamıyor."],
  ["signup is disabled", "Yeni hesap oluşturma şu anda kullanılamıyor."],
  ["email rate limit exceeded", "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin."],
];

function getAuthErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase() || "";
  const translatedMessage = AUTH_ERROR_MESSAGES.find(([key]) =>
    message.includes(key),
  );

  return translatedMessage?.[1] || fallbackMessage;
}

export async function signup({ fullName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw new Error(
      getAuthErrorMessage(error, "Hesap oluşturulamadı. Lütfen tekrar deneyin."),
    );
  }

  return data.user;
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(
      getAuthErrorMessage(error, "Giriş yapılamadı. Lütfen tekrar deneyin."),
    );
  }

  return data.user;
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error("Oturum bilgisi doğrulanamadı.");
  }

  return data.user;
}

export async function getAdminProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("user_id, full_name, email, role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error("Admin profil bilgisi okunamadı.");
  }

  return {
    user,
    profile: data,
    isAdmin: data?.role === "admin" && data?.is_active,
  };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Çıkış işlemi tamamlanamadı.");
  }
}
