import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styled from "styled-components";

import Button from "../../ui/Button";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import FormRow from "../../ui/FormRow";
import PasswordInput from "../../ui/PasswordInput";
import { login } from "../../services/apiAuth";

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

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      queryClient.removeQueries({ queryKey: ["admin-profile"] });

      const requestedLocation = location.state?.from;
      const destination = requestedLocation
        ? `${requestedLocation.pathname}${requestedLocation.search || ""}${
            requestedLocation.hash || ""
          }`
        : "/admin/bookings";

      navigate(destination, { replace: true });
    },
    onError: (error) => toast.error(error.message),
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (!email || !password) return;
    mutate({ email, password });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="E-posta">
        <Input
          type="email"
          id="email"
          autoComplete="username"
          placeholder="admin@ornek.com"
          value={email}
          required
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormRow>
      <FormRow label="Şifre">
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Şifrenizi girin"
          value={password}
          required
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormRow>
      <FormRow>
        <Button size="large" disabled={isLoading}>
          {isLoading ? "Giriş yapılıyor..." : "Giriş yap"}
        </Button>
      </FormRow>
      <LinkRow>
        Hesabınız yok mu?
        <StyledLink to="/signup">Admin hesabı oluştur</StyledLink>
      </LinkRow>
    </Form>
  );
}

export default LoginForm;
