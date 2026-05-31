import * as React from 'react';
import { cn } from '@/shared/lib/utils';

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

function useDropdownMenu() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used within DropdownMenu');
  return ctx;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  const { setOpen } = useDropdownMenu();
  return (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className="inline-flex items-center justify-center"
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  align = 'end',
}: {
  children: React.ReactNode;
  align?: 'start' | 'end';
}) {
  const { open, setOpen } = useDropdownMenu();
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      <div
        className={cn(
          'absolute z-20 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 shadow-md',
          align === 'end' ? 'right-0' : 'left-0',
        )}
      >
        {children}
      </div>
    </>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const { setOpen } = useDropdownMenu();
  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
