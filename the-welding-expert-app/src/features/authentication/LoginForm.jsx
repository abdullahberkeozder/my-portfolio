import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
      <FormRow label="E-posta">
        <Input
          type="email"
          id="email"
          // This makes this form better for password managers
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormRow>
      <FormRow label="Şifre">
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
          {isLoading ? "Giriş yapılıyor..." : "Giriş yap"}
        </Button>
      </FormRow>
      <LinkRow>
        <StyledLink to="/signup">Yeni admin hesabı oluştur</StyledLink>
      </LinkRow>
    </Form>
  );
}

export default LoginForm;
