import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import styled from "styled-components";

import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import { signup } from "../../services/apiAuth";

const HelperText = styled.p`
  color: var(--color-grey-500);
  font-size: 1.4rem;
  line-height: 1.5;
`;

const LinkRow = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 1.4rem;
`;

const StyledLink = styled(Link)`
  color: var(--color-brand-700);
  font-weight: 700;
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
        "Uyelik olusturuldu. Admin yetkisi icin Supabase uzerinden onay gerekiyor.",
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleSubmit(event) {
    event.preventDefault();

    if (!fullName || !email || !password) return;

    if (password.length < 6) {
      toast.error("Sifre en az 6 karakter olmali.");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Sifreler eslesmiyor.");
      return;
    }

    mutate({ fullName, email, password });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <HelperText>
        Yeni hesaplar once beklemede kalir. Supabase SQL Editor uzerinden
        kullaniciya admin rolu verdikten sonra panel verileri acilir.
      </HelperText>

      <FormRow label="Ad soyad">
        <Input
          id="fullName"
          value={fullName}
          autoComplete="name"
          onChange={(event) => setFullName(event.target.value)}
        />
      </FormRow>

      <FormRow label="Email">
        <Input
          id="email"
          type="email"
          value={email}
          autoComplete="username"
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormRow>

      <FormRow label="Sifre">
        <Input
          id="password"
          type="password"
          value={password}
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormRow>

      <FormRow label="Sifre tekrar">
        <Input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          autoComplete="new-password"
          onChange={(event) => setPasswordConfirm(event.target.value)}
        />
      </FormRow>

      <FormRow>
        <Button
          size="large"
          disabled={isLoading}>
          {isLoading ? "Olusturuluyor..." : "Uye ol"}
        </Button>
      </FormRow>

      <LinkRow>
        <StyledLink to="/login">Zaten hesabim var</StyledLink>
      </LinkRow>
    </Form>
  );
}

export default SignupForm;
