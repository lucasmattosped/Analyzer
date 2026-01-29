/**
 * Blueberry Math Analyzer 3.0 - Enhanced Login Form Component
 *
 * This component handles direct authentication using Blueberry Math credentials.
 * Stores ALL response headers for subsequent API requests.
 * 
 * IMPORTANT: If JWT token alone doesn't work, users can optionally provide
 * cookies captured from their browser to ensure full API compatibility.
 *
 * SECURITY:
 * - Token is stored ONLY in memory (not localStorage)
 * - User must re-login after page refresh
 * - NO passwords are stored
 */

'use client';

import { useState } from 'react';
import { Lock, Mail, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

interface BlueberryCredentials {
  token: string | null;
  cookies: string | null;
  userAgent: string | null;
  baggage: string | null;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cookies, setCookies] = useState('');
  const [showCookies, setShowCookies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email.trim()) {
      setError('O email é obrigatório');
      return;
    }

    if (!password.trim()) {
      setError('A senha é obrigatória');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);

    try {
      // Direct login with Blueberry Math API
      const response = await fetch('/api/blueberry/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha na autenticação');
      }

      // Store credentials in memory
      const credentials: BlueberryCredentials = {
        token: data.data.token,
        cookies: data.data.cookies || cookies.trim() || null,
        userAgent: data.data.userAgent || null,
        baggage: data.data.baggage || null
      };

      setAuth(credentials, data.data.userName);

      // Notify parent of successful login
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Blueberry Math Analyzer 3.0
          </CardTitle>
          <CardDescription className="text-center">
            Análise Pedagógica Fiel à API Blueberry Math
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Faça login com suas credenciais da Blueberry Math.
                {showCookies ? (
                  <p className="mt-2">
                    Se o login automático não funcionar, você pode fornecer cookies manualmente
                    abrindo o dashboard da Blueberry Math e copiando os cookies
                  do Developer Tools (F12).
                  </p>
                ) : (
                  <p className="mt-2">
                    O sistema usa o token JWT para autenticação.
                  </p>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@escola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCookies(!showCookies)}
                disabled={isLoading}
              >
                {showCookies ? 'Ocultar' : 'Mostrar'} Cookies (Opcional)
              </Button>
              <div className="text-xs text-muted-foreground flex-1">
                Apenas se o login automático não funcionar
              </div>
            </div>

            {showCookies && (
              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="cookies" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Cookies (Opcional)
                </Label>
                <Textarea
                  id="cookies"
                  placeholder="analytics_session_id=...; ajs_user_id=...; ..."
                  value={cookies}
                  onChange={(e) => setCookies(e.target.value)}
                  rows={2}
                  className="font-mono text-xs"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Copie os cookies do Developer Tools (F12) → Application → Cookies
                  depois de fazer login no dashboard da Blueberry Math.
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="pt-4 border-t text-xs text-muted-foreground space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">Segurança Garantida:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Seu login é feito diretamente na API oficial da Blueberry Math</li>
                    <li>As credenciais NÃO são armazenadas em nenhum banco de dados</li>
                    <li>Você precisará fazer login novamente após fechar o navegador</li>
                    <li>Credenciais ficam apenas na memória da sessão atual</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
