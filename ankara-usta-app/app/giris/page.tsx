import AuthForm from '../components/AuthForm';
import {safeNextPath} from '../lib/authRedirect';
export default async function SignInPage({searchParams}:{searchParams:Promise<{next?:string}>}) {
  return <AuthForm nextPath={safeNextPath((await searchParams).next)}/>;
}
