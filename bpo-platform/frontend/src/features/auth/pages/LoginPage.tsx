import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const tokens = await authService.login(data);

      // Store tokens first so the interceptor can use them
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token);

      // Get current user info (now with valid auth header)
      const user = await authService.getCurrentUser();

      setAuth({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: user.full_name,
          employeeId: user.employee_id,
          isActive: user.is_active,
          isSuperuser: user.is_superuser,
          role: user.role,
          permissions: user.permissions,
        },
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });

      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign in
      </Button>

      <p className="text-center text-sm text-surface-500">
        Demo credentials: admin@example.com / password123
      </p>
    </form>
  );
}
