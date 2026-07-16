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
};

export type MaintenanceInfo = {
    enabled: boolean;
    title: string;
    message: string;
};
