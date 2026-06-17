import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styled from "styled-components";

import Button from "../../ui/Button";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import FormRow from "../../ui/FormRow";
import { login } from "../../services/apiAuth";

const LinkRow = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 1.4rem;
`;

const StyledLink = styled(Link)`
  color: var(--color-brand-700);
  font-weight: 700;
`;

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      navigate("/admin/bookings", { replace: true });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleSubmit(event) {
    event.preventDefault();

    if (!email || !password) return;

    mutate({ email, password });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Email">
        <Input
          type="email"
          id="email"
          // This makes this form better for password managers
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormRow>
      <FormRow label="Sifre">
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormRow>
      <FormRow>
        <Button
          size="large"
          disabled={isLoading}>
          {isLoading ? "Giris yapiliyor..." : "Giris yap"}
        </Button>
      </FormRow>
      <LinkRow>
        <StyledLink to="/signup">Yeni admin hesabi olustur</StyledLink>
      </LinkRow>
    </Form>
  );
}

export default LoginForm;
