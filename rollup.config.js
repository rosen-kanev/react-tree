import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const input = 'src/Tree.jsx';
const name = 'react-tree';

const getBabelConfig = (runtime) => {
    return {
        babelHelpers: 'bundled',
        presets: [
            [
                '@babel/preset-env',
                {
                    loose: true,
                    modules: false,
                },
            ],
            ['@babel/preset-react', { runtime }],
        ],
    };
};

export default [
    {
        input,
        output: [
            { file: `dist/${name}.cjs.js`, format: 'cjs', exports: 'default' },
            { file: `dist/${name}.esm.js`, format: 'esm' },
        ],
        external: ['react', 'react/jsx-runtime', 'prop-types'],
        plugins: [babel(getBabelConfig('automatic')), resolve(), commonjs()],
    },
    {
        input,
        output: {
            file: `dist/${name}.umd.js`,
            format: 'umd',
            name: 'ReactTree',
            globals: { react: 'React', 'prop-types': 'PropTypes' },
        },
        external: ['react', 'prop-types'],
        plugins: [
            replace({
                values: {
                    'process.env.NODE_ENV': JSON.stringify('development'),
                },
                preventAssignment: true,
            }),
            babel(getBabelConfig('classic')),
            resolve(),
            commonjs(),
        ],
    },
    {
        input,
        output: {
            file: `dist/${name}.umd.min.js`,
            format: 'umd',
            name: 'ReactTree',
            globals: { react: 'React', 'prop-types': 'PropTypes' },
            sourcemap: true,
        },
        external: ['react', 'prop-types'],
        plugins: [
            replace({
                values: {
                    'process.env.NODE_ENV': JSON.stringify('production'),
                },
                preventAssignment: true,
            }),
            babel(getBabelConfig('classic')),
            resolve(),
            commonjs(),
            terser(),
        ],
    },
];
