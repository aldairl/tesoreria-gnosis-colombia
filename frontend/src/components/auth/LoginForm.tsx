import { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "@/api/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  Input,
} from "@/components/ui";

interface LoginFields {
  username: string;
  password: string;
}

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>();

  async function onSubmit(values: LoginFields) {
    setLoading(true);
    setServerError("");
    try {
      await login(values.username, values.password);
      onSuccess();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <CardTitle className="text-center">Tesorería Local</CardTitle>
            <p className="text-sm text-slate-500 text-center">
              Iniciá sesión para continuar
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Usuario" error={errors.username?.message} required>
              <Input
                {...register("username", { required: "Requerido" })}
                placeholder="tesoreria"
                autoComplete="username"
              />
            </Field>
            <Field label="Contraseña" error={errors.password?.message} required>
              <Input
                {...register("password", { required: "Requerido" })}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>

            {serverError && (
              <p className="text-sm text-red-500 text-center">{serverError}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading ? "Entrando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
