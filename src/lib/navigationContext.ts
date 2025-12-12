const CONTEXT_KEY = 'tervis_navigation_context';

export interface NavigationContext {
  returnUrl?: string;
  searchQuery?: string;
  timestamp: number;
}

export function saveNavigationContext(context: Omit<NavigationContext, 'timestamp'>) {
  const fullContext: NavigationContext = {
    ...context,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(fullContext));
}

export function getNavigationContext(): NavigationContext | null {
  const stored = sessionStorage.getItem(CONTEXT_KEY);
  if (!stored) return null;

  try {
    const context = JSON.parse(stored) as NavigationContext;
    const age = Date.now() - context.timestamp;
    if (age > 10 * 60 * 1000) {
      clearNavigationContext();
      return null;
    }
    return context;
  } catch {
    clearNavigationContext();
    return null;
  }
}

export function clearNavigationContext() {
  sessionStorage.removeItem(CONTEXT_KEY);
}
