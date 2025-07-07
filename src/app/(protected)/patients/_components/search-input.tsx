'use client';

import { SearchIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState, useTransition } from 'react';

import { Input } from '@/components/ui/input';

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const prevIsPendingRef = useRef(isPending);

  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  );

  useEffect(() => {
    if (prevIsPendingRef.current && !isPending) {
      inputRef.current?.focus();
    }
    prevIsPendingRef.current = isPending;
  }, [isPending]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchValue(newValue);

    if (newValue === '') {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');
      params.set('page', '1');

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchValue) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('search', searchValue);
    params.set('page', '1');

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative mb-4">
      <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Pesquisar por nome..."
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        value={searchValue}
        onChange={handleSearchChange}
        disabled={isPending}
      />
    </form>
  );
}
