export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
}

export interface SidebarNavItem extends NavItem {
  items?: NavItemWithChildren[];
}

export type TableOfContentsItem = {
  level: number;
  text: string;
  slug: string;
  children?: TableOfContentsItem[];
};
