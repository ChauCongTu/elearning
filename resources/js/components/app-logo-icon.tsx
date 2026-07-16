import BrandLogo from '@/components/public/brand-logo';
import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
    size?: number;
};

export default function AppLogoIcon({ size = 36, className, style, ...props }: Props) {
    return (
        <div className={className} style={style} {...props}>
            <BrandLogo height={size} maxWidth={Math.round(size * 0.75)} />
        </div>
    );
}
