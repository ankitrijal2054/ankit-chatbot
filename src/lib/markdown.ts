import { Components } from 'react-markdown';
import DOMPurify from 'dompurify';
import { createElement } from 'react';

export const markdownComponents: Components = {
  a: ({ href, children, ...props }) => 
    createElement('a', {
      href,
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'text-primary underline underline-offset-2 hover:text-primary/80 transition-colors',
      ...props
    }, children),
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    return createElement('code', {
      className: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
      ...props
    }, children);
  },
  pre: ({ children, ...props }) => 
    createElement('pre', {
      className: 'mb-4 mt-6 overflow-x-auto rounded-lg bg-muted p-4 text-sm',
      ...props
    }, children),
  p: ({ children, ...props }) => 
    createElement('p', {
      className: 'mb-3 last:mb-0',
      ...props
    }, children),
  ul: ({ children, ...props }) => 
    createElement('ul', {
      className: 'my-3 ml-6 list-disc [&>li]:mt-1',
      ...props
    }, children),
  ol: ({ children, ...props }) => 
    createElement('ol', {
      className: 'my-3 ml-6 list-decimal [&>li]:mt-1',
      ...props
    }, children),
  blockquote: ({ children, ...props }) => 
    createElement('blockquote', {
      className: 'mt-6 border-l-2 border-muted-foreground pl-6 italic',
      ...props
    }, children),
  h1: ({ children, ...props }) => 
    createElement('h1', {
      className: 'mt-6 mb-4 text-2xl font-bold tracking-tight first:mt-0',
      ...props
    }, children),
  h2: ({ children, ...props }) => 
    createElement('h2', {
      className: 'mt-6 mb-4 text-xl font-bold tracking-tight first:mt-0',
      ...props
    }, children),
  h3: ({ children, ...props }) => 
    createElement('h3', {
      className: 'mt-6 mb-4 text-lg font-bold tracking-tight first:mt-0',
      ...props
    }, children),
  table: ({ children, ...props }) => 
    createElement('div', { className: 'my-4 overflow-x-auto' },
      createElement('table', {
        className: 'w-full border-collapse border border-border',
        ...props
      }, children)
    ),
  th: ({ children, ...props }) => 
    createElement('th', {
      className: 'border border-border bg-muted p-2 text-left font-semibold',
      ...props
    }, children),
  td: ({ children, ...props }) => 
    createElement('td', {
      className: 'border border-border p-2',
      ...props
    }, children),
};

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'code', 'pre', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'th', 'td', 'tr', 'thead', 'tbody'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}