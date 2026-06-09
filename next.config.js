/** @type {import('next').NextConfig} */
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: [
            'javascript',
            'typescript',
            'python',
            'java',
            'cpp',
            'csharp',
            'html',
            'css',
            'go',
            'rust',
            'ruby',
            'php',
            'sql',
            'json',
            'xml',
            'yaml',
            'markdown',
            'shell',
          ],
          features: [
            '!codelens',
            '!gotoError',
            '!gotoLine',
            '!toggleHighContrast',
            '!toggleTabFocusMode',
            '!inspectTokens',
          ],
        })
      )
    }
    return config
  },
}

module.exports = nextConfig
