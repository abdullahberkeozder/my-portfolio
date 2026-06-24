import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled from "styled-components";

import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import PasswordInput from "../../ui/PasswordInput";
import { signup } from "../../services/apiAuth";

const HelperText = styled.p`
  border: 1px solid var(--color-brand-100);
  border-radius: var(--border-radius-sm);
  padding: 1.2rem;
  color: var(--color-grey-600);
  background: var(--color-brand-50);
  font-size: var(--font-size-sm);
`;

const LinkRow = styled.p`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
`;

const StyledLink = styled(Link)`
  color: var(--color-brand-700);
  font-weight: var(--font-weight-bold);

  &:hover {
    color: var(--color-brand-800);
  }
`;

function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { mutate, isLoading } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success(
        "Üyelik oluşturuldu. Admin yetkisi için yönetici onayı gerekiyor.",
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
    },
    onError: (error) => toast.error(error.message),
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (!fullName || !email || !password) return;

    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    mutate({ fullName, email, password });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <HelperText>
        Yeni hesaplar güvenlik nedeniyle onay bekler. Aktif bir yönetici hesabı
        üyeliğinizi onayladığında panel erişiminiz açılır.
      </HelperText>

      <FormRow label="Ad soyad">
        <Input
          id="fullName"
          value={fullName}
          autoComplete="name"
          placeholder="Adınız ve soyadınız"
          required
          onChange={(event) => setFullName(event.target.value)}
        />
      </FormRow>

      <FormRow label="E-posta">
        <Input
          id="email"
          type="email"
          value={email}
          autoComplete="username"
          placeholder="admin@ornek.com"
          required
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormRow>

      <FormRow label="Şifre">
        <PasswordInput
          id="password"
          value={password}
          autoComplete="new-password"
          placeholder="En az 6 karakter"
          minLength={6}
          required
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormRow>

      <FormRow label="Şifre tekrar">
        <PasswordInput
          id="passwordConfirm"
          value={passwordConfirm}
          autoComplete="new-password"
          placeholder="Şifrenizi tekrar girin"
          minLength={6}
          required
          onChange={(event) => setPasswordConfirm(event.target.value)}
        />
      </FormRow>

      <FormRow>
        <Button size="large" disabled={isLoading}>
          {isLoading ? "Hesap oluşturuluyor..." : "Hesap oluştur"}
        </Button>
      </FormRow>

      <LinkRow>
        Zaten hesabınız var mı?
        <StyledLink to="/login">Giriş yap</StyledLink>
      </LinkRow>
    </Form>
  );
}

export default SignupForm;
