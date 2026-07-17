export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header className={variant === 'small' ? '' : 'mb-2 space-y-1'}>
            <h2
                className={
                    variant === 'small'
                        ? 'mb-0.5 text-base font-semibold text-gray-900'
                        : 'text-2xl font-semibold tracking-tight text-gray-900'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="text-sm leading-relaxed text-gray-500">{description}</p>
            )}
        </header>
    );
}
