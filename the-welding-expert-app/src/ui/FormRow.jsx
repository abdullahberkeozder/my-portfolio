import styled from "styled-components";

const StyledFormRow = styled.div`
  display: grid;
  gap: 0.7rem;

  &:has(> button) {
    margin-top: 0.4rem;

    & > button {
      width: 100%;
    }
  }
`;

const Label = styled.label`
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
`;

const Error = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-red-700);

`;

function FormRow({ label, error, children }) {
  return (
    <StyledFormRow>
      {label && (
        <Label htmlFor={children.props.id}>{label}</Label>
      )}
      {children}
      {error && <Error>{error}</Error>}
    </StyledFormRow>
  );
}
export default FormRow;
