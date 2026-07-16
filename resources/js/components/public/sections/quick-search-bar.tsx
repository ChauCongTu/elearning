import { router } from '@inertiajs/react';
import { Box, Container, TextInput } from '@mantine/core';
import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { brandGradients } from '@/theme/brand';

export default function QuickSearchBar() {
    const [query, setQuery] = useState('');

    const submit = () => {
        router.get('/courses', query ? { q: query } : {});
    };

    return (
        <Box className="public-search-float" pb="md">
            <Container size="md">
                <Box
                    className="public-glass"
                    p="sm"
                    style={{ borderRadius: 999 }}
                >
                    <TextInput
                        size="md"
                        radius="xl"
                        variant="unstyled"
                        placeholder="Tìm khóa học phun xăm, chăm sóc da, gội đầu..."
                        leftSection={<Search size={18} color="var(--mantine-color-pink-6)" />}
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                        rightSectionWidth={130}
                        styles={{
                            input: {
                                paddingLeft: 40,
                                fontSize: 15,
                            },
                        }}
                        rightSection={
                            <Box
                                component="button"
                                onClick={submit}
                                style={{
                                    border: 'none',
                                    background: brandGradients.primary,
                                    color: '#fff',
                                    borderRadius: 999,
                                    padding: '8px 18px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    boxShadow: 'var(--brand-shadow-soft)',
                                }}
                            >
                                <Sparkles size={14} />
                                Tìm kiếm
                            </Box>
                        }
                    />
                </Box>
            </Container>
        </Box>
    );
}
