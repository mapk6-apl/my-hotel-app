export const normalizePropertyImageUrl = (url: string): string => {
  const imageUrl = url.trim();
  return imageUrl && !/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(imageUrl)
    ? `/${imageUrl}`
    : imageUrl;
};

export const getFallbackSvgDataUri = (title: string = 'Break-Away Hotel'): string => {
  const cleanTitle = title.replace(/[<>&'"]/g, '');
  return 'data:image/svg+xml;utf8,<svg width="800" height="533"><rect width="800" height="533" fill="%23CBD0B9"/><text x="400" y="270" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23514B23">' + cleanTitle + '</text></svg>';
};
