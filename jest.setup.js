// Jest setup file
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sun: ({ className, ...props }: any) => <div data-testid="mock-sun-icon" className={className} {...props} />,
  Moon: ({ className, ...props }: any) => <div data-testid="mock-moon-icon" className={className} {...props} />,
  TrendingUp: ({ className, ...props }: any) => <div data-testid="mock-trending-icon" className={className} {...props} />,
  Star: ({ className, ...props }: any) => <div data-testid="mock-star-icon" className={className} {...props} />,
  Zap: ({ className, ...props }: any) => <div data-testid="mock-zap-icon" className={className} {...props} />,
  Circle: ({ className, ...props }: any) => <div data-testid="mock-circle-icon" className={className} {...props} />,
  Sparkles: ({ className, ...props }: any) => <div data-testid="mock-sparkles-icon" className={className} {...props} />,
  ArrowLeft: ({ className, ...props }: any) => <div data-testid="mock-arrow-icon" className={className} {...props} />,
  LoaderCircle: ({ className, ...props }: any) => <div data-testid="mock-loader-icon" className={className} {...props} />,
  Calendar: ({ className, ...props }: any) => <div data-testid="mock-calendar-icon" className={className} {...props} />,
  Clock: ({ className, ...props }: any) => <div data-testid="mock-clock-icon" className={className} {...props} />,
  MapPin: ({ className, ...props }: any) => <div data-testid="mock-mappin-icon" className={className} {...props} />,
  AlertTriangle: ({ className, ...props }: any) => <div data-testid="mock-alert-icon" className={className} {...props} />,
  RefreshCw: ({ className, ...props }: any) => <div data-testid="mock-refresh-icon" className={className} {...props} />,
}));

// Mock CSS modules
jest.mock('../src/styles/premium-theme.css', () => ({}));
jest.mock('../src/app/globals.css', () => ({}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Setup console.error to fail tests on unhandled promise rejections
console.error = (...args) => {
  throw new Error(`Console error: ${args.join(' ')}`);
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});