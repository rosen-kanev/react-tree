import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';

export default {
    plugins: [reactRefresh()],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/Tree.jsx'),
            name: 'ReactTree',
        },
        rollupOptions: {
            external: ['react'],
            output: {
                globals: {
                    react: 'React',
                },
            },
        },
    },
};
