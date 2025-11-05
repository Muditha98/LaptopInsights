import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private cdnBaseUrl = environment.imageCDN.baseUrl;
  private fallbackImage = environment.imageCDN.fallbackImage;

  // Product image mapping with realistic laptop placeholders
  // Using placehold.co for better-looking placeholders with brand colors
  private productImageMap: { [key: string]: string } = {
    // HP Products - Blue theme (#0096D6)
    'HP-PROBOOK-440-G11': 'https://hp.widen.net/content/nvis9ku9m2/png/nvis9ku9m2.png?w=1659&h=1246&dpi=72&color=ffffff00',
    'HP-PROBOOK-445-G11': 'https://hp.widen.net/content/c40qt0htzw/png/c40qt0htzw.png?w=1659&h=1246&dpi=72&color=ffffff00',
    'HP-PROBOOK-460-G11': 'https://hp.widen.net/content/unjtb6odfl/png/unjtb6odfl.png?w=1659&h=1246&dpi=72&color=ffffff00',
    'HP-PROBOOK-465-G11': 'https://hp.widen.net/content/gugbcrjptm/png/gugbcrjptm.png?w=1659&h=1246&dpi=72&color=ffffff00',
    'HP-PROBOOK-4-G1I-NOTEBOOK': 'https://hp.widen.net/content/8fvfwqxcr7/png/8fvfwqxcr7.png?w=1659&h=1246&dpi=72&color=ffffff00',
    // Lenovo Products - Red theme (#E2231A)
    'LENOVO-THINKPAD-E14-GEN7-AMD': 'https://p4-ofp.static.pub//fes/cms/2025/04/24/jls8h1pucdwg467jpbdz7l806ji15y152166.png',
    'LENOVO-THINKPAD-E14-GEN6-AMD': 'https://p2-ofp.static.pub//fes/cms/2024/04/01/dr07ur4ocsbpn2l9pu8doajktf16ev299382.png',
    'LENOVO-THINKPAD-E16-GEN2-AMD': 'https://p1-ofp.static.pub//fes/cms/2024/04/01/i5b9963juc0ok6omsp1pqlkv4svss1553510.png',
    'LENOVO-THINKPAD-T16-GEN4-INTEL': 'https://p1-ofp.static.pub/medias/27261342132_ThinkPadT16G4_202504270433321749489850150.png',
    'LENOVO-THINKPAD-E14-GEN7-INTEL': 'https://p1-ofp.static.pub/medias/26998848815_ThinkPad_E14_7_eclipse_black_202502180248361748237542965.png'
  };

  constructor() {}

  /**
   * Get product image URL
   */
  getProductImage(productId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const imageUrl = this.productImageMap[productId];

    if (imageUrl) {
      // If we have a direct URL, use it with size parameter
      return this.resizeImageUrl(imageUrl, size);
    }

    // Generate a dynamic placeholder based on product ID if not in map
    return this.generateDynamicPlaceholder(productId, size);
  }

  /**
   * Resize image URL based on size
   */
  private resizeImageUrl(url: string, size: 'small' | 'medium' | 'large'): string {
    const dimensions = {
      small: '400x267',
      medium: '600x400',
      large: '800x533'
    };

    // Replace dimensions in placehold.co URLs
    return url.replace(/\d+x\d+/, dimensions[size]);
  }

  /**
   * Generate dynamic placeholder for unmapped products
   */
  private generateDynamicPlaceholder(productId: string, size: 'small' | 'medium' | 'large'): string {
    const dimensions = {
      small: '400x267',
      medium: '600x400',
      large: '800x533'
    };

    // Determine brand color from product ID
    const isHP = productId.toUpperCase().includes('HP');
    const color = isHP ? '0096D6' : 'E2231A';

    // Format product name for display
    const displayName = productId.replace(/-/g, ' ').replace(/_/g, ' ');
    const encodedName = encodeURIComponent(displayName);

    return `https://placehold.co/${dimensions[size]}/${color}/FFFFFF/png?text=${encodedName}&font=roboto`;
  }

  /**
   * Get fallback image
   */
  getFallbackImage(): string {
    return this.fallbackImage;
  }

  /**
   * Get brand logo URL
   */
  getBrandLogo(brand: string): string {
    const brandLower = brand.toLowerCase();

    switch (brandLower) {
      case 'hp':
        return 'https://logo.clearbit.com/hp.com';
      case 'lenovo':
        return 'https://logo.clearbit.com/lenovo.com';
      default:
        return '/assets/images/brand-placeholder.png';
    }
  }

  /**
   * Get brand color
   */
  getBrandColor(brand: string): string {
    const brandLower = brand.toLowerCase();

    switch (brandLower) {
      case 'hp':
        return '#0096D6'; // HP Blue
      case 'lenovo':
        return '#E2231A'; // Lenovo Red
      default:
        return '#64748b'; // Default gray
    }
  }

  /**
   * Preload image
   */
  preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    });
  }

  /**
   * Preload multiple images
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url));
    await Promise.all(promises);
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(productId: string): string {
    return this.getProductImage(productId, 'small');
  }

  /**
   * Get full size image URL
   */
  getFullSizeImageUrl(productId: string): string {
    return this.getProductImage(productId, 'large');
  }

  /**
   * Check if image URL is valid
   */
  isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get optimized image URL based on viewport
   */
  getOptimizedImageUrl(productId: string, viewportWidth: number): string {
    if (viewportWidth <= 768) {
      return this.getProductImage(productId, 'small');
    } else if (viewportWidth <= 1024) {
      return this.getProductImage(productId, 'medium');
    } else {
      return this.getProductImage(productId, 'large');
    }
  }
}
