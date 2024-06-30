import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    address?: string;
    user: DefaultSession['user'];
  }
}

declare module 'react-textfit' {
  export interface TextfitProps {
    children: React.ReactNode;
    mode?: 'single' | 'multi';
    min?: number;
    max?: number;
    forceSingleModeWidth?: boolean;
  }
  export function Textfit(props: TextfitProps): JSX.Element;
}
