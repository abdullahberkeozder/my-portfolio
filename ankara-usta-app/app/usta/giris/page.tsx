import AuthForm from '../../components/AuthForm';
import {safeNextPath} from '../../lib/authRedirect';
export default async function AuthPage({searchParams}:{searchParams:Promise<{next?:string}>}) {
  return <AuthForm audience="tradesperson" initialMode="sign-in" nextPath={safeNextPath((await searchParams).next)}/>;
}
