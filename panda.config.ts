import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors: {
          background: { value: '#ffffff' },
          foreground: { value: '#171717' },
          'zinc-50': { value: '#fafafa' },
          'zinc-400': { value: '#a1a1a1' },
          'zinc-600': { value: '#52525b' },
          'zinc-950': { value: '#09090b' },
          black: { value: '#000000' },
        },
      },
    },
  },
  patterns: {
    extend: {
      flex: {
        properties: { display: 'flex' },
      },
      'flex-col': {
        properties: { display: 'flex', flexDirection: 'column' },
      },
      'flex-1': {
        properties: { flex: '1' },
      },
      'items-center': {
        properties: { alignItems: 'center' },
      },
      'justify-center': {
        properties: { justifyContent: 'center' },
      },
      'justify-between': {
        properties: { justifyContent: 'space-between' },
      },
      'gap-4': {
        properties: { gap: '1rem' },
      },
      'gap-6': {
        properties: { gap: '1.5rem' },
      },
      'py-32': {
        properties: { paddingTop: '8rem', paddingBottom: '8rem' },
      },
      'px-16': {
        properties: { paddingLeft: '4rem', paddingRight: '4rem' },
      },
      'w-full': {
        properties: { width: '100%' },
      },
      'max-w-3xl': {
        properties: { maxWidth: '48rem' },
      },
      'h-full': {
        properties: { height: '100%' },
      },
      'min-h-full': {
        properties: { minHeight: '100%' },
      },
      'rounded-full': {
        properties: { borderRadius: '9999px' },
      },
    },
  },
  output: 'styled-system',
  jsxFramework: 'react',
});
