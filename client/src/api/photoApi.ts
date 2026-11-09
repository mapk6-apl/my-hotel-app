export const normalizePropertyImageUrl = (url: string): string => {
  const imageUrl = url.trim();
  return imageUrl && !/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(imageUrl)
    ? `/${imageUrl}`
    : imageUrl;
};

export const getFallbackSvgDataUri = (title: string = 'Break-Away Hotel'): string => {
  const cleanTitle = title.replace(/[<>&'"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="533" viewBox="0 0 800 533"><title>${cleanTitle} placeholder</title><rect width="800" height="533" fill="#e8e8dc"/><path d="M0 400h800v133H0z" fill="#cbd0b9"/><path d="M206 400V178l194-103 194 103v222z" fill="#f7f5ed"/><path d="M190 180 400 62l210 118v24H190z" fill="#656839"/><path d="M260 216h62v75h-62zM369 216h62v75h-62zM478 216h62v75h-62z" fill="#a9c5c6"/><path d="M260 316h62v84h-62zM369 316h62v84h-62zM478 316h62v84h-62z" fill="#a9c5c6"/><path d="M369 324h62v76h-62z" fill="#656839"/><path d="M90 400c20-54 44-74 69-85 25 11 49 31 69 85M582 400c20-54 44-74 69-85 25 11 49 31 69 85" fill="#87916c"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
