// dashboard-web/src/types/vite-plugin-imagemin.d.ts
declare module 'vite-plugin-imagemin' {
  import { Plugin } from 'vite';

  interface ImageminOptions {
    gifsicle?: any;
    mozjpeg?: any;
    pngquant?: any;
    svgo?: any;
  }

  export default function imagemin(options?: ImageminOptions): Plugin;
}

// dashboard-web/src/types/vite-plugin-webp.d.ts
declare module 'vite-plugin-webp' {
  import { Plugin } from 'vite';

  export default function webp(): Plugin;
}