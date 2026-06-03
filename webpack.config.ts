import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import path from 'path';
import grafanaConfig, { type Env } from './.config/webpack/webpack.config';
import { SOURCE_DIR } from './.config/webpack/constants';


const config = async (env: Env): Promise<Configuration> => {
    const baseConfig = await grafanaConfig(env);
    return merge(baseConfig, {
        resolve: {
            ...baseConfig.resolve,
            alias: {
                ...baseConfig.resolve?.alias,
                '@': path.resolve(process.cwd(), SOURCE_DIR),
            },
        }
    });
};

export default config;
