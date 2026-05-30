import type { Request, Response, NextFunction } from 'express';

const ASSET_COOKIE = 'wc_assets=dashboard; Path=/; SameSite=Lax; Max-Age=86400';
const STATIC_ASSET_PATH = /\.(js|mjs|css|map|woff2?|ttf|eot|otf|ico|svg|png|jpe?g|gif|webp|json)$/i;

export function markDashboardAssetCookie(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.method === 'GET' && isHtmlDocumentRequest(req)) {
    res.append('Set-Cookie', ASSET_COOKIE);
  }
  next();
}

export function rejectMissingStaticAsset(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (STATIC_ASSET_PATH.test(req.path)) {
    res.status(404).type('text/plain').send('Not found');
    return;
  }
  next();
}

function isHtmlDocumentRequest(req: Request): boolean {
  const secFetchDest = req.get('Sec-Fetch-Dest');
  if (secFetchDest === 'document') {
    return true;
  }
  const accept = req.get('Accept') ?? '';
  return accept.includes('text/html') && !STATIC_ASSET_PATH.test(req.path);
}
