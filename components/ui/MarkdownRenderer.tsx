
import React, { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const formattedContent = useMemo(() => {
    let html = content
      // Handle bold and italic together
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Handle bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
       // Handle inline code
      .replace(/`(.*?)`/g, '<code>$1</code>');

    // Handle lists (unordered)
    if (html.includes('\n- ')) {
        html = html.replace(/(\n- (.*))+/g, (match) => {
            const items = match.trim().split('\n- ').slice(1);
            return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        });
    }

    // Handle lists (ordered)
    if (html.match(/\n\d+\. /)) {
        html = html.replace(/(\n\d+\. (.*))+/g, (match) => {
            const items = match.trim().split(/\n\d+\. /).slice(1);
            return `<ol>${items.map(item => `<li>${item}</li>`).join('')}</ol>`;
        });
    }

    // Handle line breaks
    html = html.replace(/\n/g, '<br />');

    return { __html: html };
  }, [content]);

  return <div dangerouslySetInnerHTML={formattedContent} />;
};

export default MarkdownRenderer;
