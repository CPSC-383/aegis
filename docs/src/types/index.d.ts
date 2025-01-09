export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
}

export interface NavItemWithChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}

export type TableOfContentsItem = {
  level: number;
  text: string;
  slug: string;
  children?: TableOfContentsItem[];
};
