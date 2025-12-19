import AppLogo from './brand/AppLogo';
import { UserMenu } from '../auth/UserMenu';

export default function AppHeader() {
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <AppLogo />

        <UserMenu />
      </div>
    </header>
  );
}
