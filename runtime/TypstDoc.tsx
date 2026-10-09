import type { ReactElement } from 'react';

export interface TypstDocProps {
  html: string;
  className?: string;
  /** Reserved for future client-side TOC enhancements. */
  toc?: Array<{ id: string; text: string; depth: number }>;
}

/**
 * Renders Typst experimental HTML export inside the Rspress doc shell.
 */
export function TypstDoc({
  html,
  className = 'rspress-typst',
}: TypstDocProps): ReactElement {
  return (
    <div
      className={`rp-doc ${className}`}
      // Typst emits trusted HTML for the local documentation source tree.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default TypstDoc;
