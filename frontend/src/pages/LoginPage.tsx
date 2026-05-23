import { LoginForm } from "@/components/auth/LoginForm";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return <LoginForm onSuccess={onLogin} />;
}
