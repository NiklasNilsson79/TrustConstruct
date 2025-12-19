type AppLogoProps = {
  showText?: boolean;
};

export default function AppLogo({ showText = true }: AppLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>

      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          TrustConstruct
        </span>
      )}
    </div>
  );
}
