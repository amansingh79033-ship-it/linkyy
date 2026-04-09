import React, { useEffect, useState } from 'react';
import { ExternalLink, Loader2, X, Image as ImageIcon, FileText, Globe } from 'lucide-react';

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  type: string;
}

interface LinkPreviewProps {
  url: string;
  onClose?: () => void;
  codename?: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url, onClose, codename }) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!url || !url.trim()) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Clean and validate URL
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }

        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(cleanUrl)}${codename ? `&codename=${codename}` : ''}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch link preview');
        }

        const data = await response.json();
        setMetadata(data);
      } catch (err: any) {
        console.error('Link preview error:', err);
        setError(err.message || 'Failed to load preview');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the fetch to avoid too many requests while typing
    const timeoutId = setTimeout(fetchMetadata, 500);
    return () => clearTimeout(timeoutId);
  }, [url, codename]);

  if (isLoading) {
    return (
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 flex items-center justify-center gap-3 animate-in fade-in">
        <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
        <span className="text-neutral-400 text-sm">Loading preview...</span>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="bg-neutral-900/50 border border-red-800/50 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
        <div className="flex-1">
          <p className="text-red-400 text-sm font-medium">Failed to load preview</p>
          <p className="text-neutral-500 text-xs mt-1">{error || 'Invalid URL'}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  const hasImage = metadata.image && metadata.image.trim() !== '';
  const hasTitle = metadata.title && metadata.title.trim() !== '';
  const hasDescription = metadata.description && metadata.description.trim() !== '';

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900/30">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Globe className="w-3.5 h-3.5" />
          <span>Link Preview</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors p-1 rounded hover:bg-neutral-800 touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preview Content */}
      <a 
        href={metadata.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group hover:bg-neutral-800/30 transition-colors"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Hero Image */}
          {hasImage ? (
            <div className="sm:w-48 h-48 sm:h-auto relative bg-neutral-800 flex-shrink-0">
              <img 
                src={metadata.image} 
                alt={metadata.title || 'Preview image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM0MDQwNDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>
          ) : (
            <div className="sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-sky-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-12 h-12 text-neutral-600" />
            </div>
          )}

          {/* Text Content */}
          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div className="space-y-2">
              {/* Site Name */}
              {metadata.siteName && (
                <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
                  {metadata.type === 'article' && <FileText className="w-3.5 h-3.5" />}
                  <span>{metadata.siteName}</span>
                </div>
              )}

              {/* Title */}
              {hasTitle && (
                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                  {metadata.title}
                </h3>
              )}

              {/* Description */}
              {hasDescription && (
                <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                  {metadata.description}
                </p>
              )}

              {/* URL */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 pt-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="truncate">{new URL(metadata.url).hostname}</span>
              </div>
            </div>
          </div>
        </div>
      </a>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{hasImage ? 'Image available' : 'No image'}</span>
        </div>
        <a
          href={metadata.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition-colors"
        >
          Visit Site
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default LinkPreview;
