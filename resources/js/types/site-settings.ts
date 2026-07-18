export type SiteTheme = {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    surface: string;
    gradientFrom: string;
    gradientVia: string;
    gradientTo: string;
};

export type SiteSettings = {
    name: string;
    shortName: string;
    tagline: string;
    logoUrl: string;
    logoAlt: string;
    hotline: string;
    hotlineHref: string;
    zaloUrl: string;
    zaloNumber: string;
    facebookUrl: string;
    address: string;
    hours: string;
    theme: SiteTheme;
};

export type MaintenanceInfo = {
    enabled: boolean;
    title: string;
    message: string;
};
