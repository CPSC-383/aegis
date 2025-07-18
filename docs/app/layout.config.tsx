import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import { AlbumIcon, Book, CircleAlert } from 'lucide-react';
import Image from 'next/image';
import Logo from "./favicon.ico"

export const linkItems: LinkItemType[] = [
  {
    text: 'Docs',
    url: '/docs',
    icon: <Book />,
    active: 'nested-url',
  },
  {
    icon: <AlbumIcon />,
    text: 'Guides',
    url: '/guides',
    active: 'nested-url',
  },
  {
    text: 'Common Errors',
    url: '/errors',
    icon: <CircleAlert />,
    active: 'nested-url',
  },
];

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Image
          src={Logo}
          alt="Aegis Logo"
          width={18}
          height={18}
          className="mr-2 inline-block" />
        Aegis Docs
      </>
    ),
  },
  links: linkItems
};
