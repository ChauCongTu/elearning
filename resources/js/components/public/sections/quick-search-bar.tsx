import { router } from '@inertiajs/react';
import { Box, Container, TextInput } from '@mantine/core';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function QuickSearchBar() {
    const [query, setQuery] = useState('');

    const submit = () => {
        router.get('/courses', query ? { q: query } : {});
    };

    return (
        <Box className="public-search-float" pb="md">
            <Container size="md">
                <Box className="public-search-shell">
                    <TextInput
                        size="md"
                        radius="xl"
                        variant="unstyled"
                        placeholder="Tìm khóa học phun xăm, chăm sóc da, gội đầu..."
                        leftSection={<Search size={18} color="var(--brand-primary)" />}
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                        rightSectionWidth={120}
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
                                    background: 'var(--brand-gradient)',
                                    color: '#fff',
                                    borderRadius: 999,
                                    padding: '8px 18px',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Tìm kiếm
                            </Box>
                        }
                    />
                </Box>
            </Container>
        </Box>
    );
}
