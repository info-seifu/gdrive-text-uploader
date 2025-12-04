declare module 'react' {
  export type ReactNode = any;
  export type ReactElement = any;
  export type FormEvent = any;
  export type Dispatch<T> = (value: T) => void;

  export function useState<T>(initialState: T): [T, Dispatch<T>];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;

  export const StrictMode: (props: { children?: ReactNode }) => ReactElement;

  const React: {
    StrictMode: typeof StrictMode;
    useState: typeof useState;
    useEffect: typeof useEffect;
  };
  export default React;
}

declare module 'react-dom/client' {
  import type { ReactElement } from 'react';
  export function createRoot(container: Element | DocumentFragment): {
    render(children: ReactElement): void;
  };

  const client: {
    createRoot: typeof createRoot;
  };
  export default client;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
