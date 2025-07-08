/**
 * Pixabay API Integration
 * For high-quality stock photos of seniors
 */

const PIXABAY_API_KEY = '51222989-657ccb44f46767beb02ac663c';

export interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
  user: string;
  views: number;
  downloads: number;
  likes: number;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

export class PixabayService {
  private baseUrl = 'https://pixabay.com/api/';

  async searchImages(query: string, category: string = 'people', minWidth: number = 1920): Promise<PixabayImage[]> {
    const params = new URLSearchParams({
      key: PIXABAY_API_KEY,
      q: query,
      image_type: 'photo',
      category,
      min_width: minWidth.toString(),
      per_page: '20',
      safesearch: 'true',
      order: 'popular'
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data: PixabayResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      return data.hits;
    } catch (error) {
      console.error('Error fetching from Pixabay:', error);
      throw error;
    }
  }

  async getHeroImages(): Promise<PixabayImage[]> {
    return this.searchImages('happy seniors elderly activities social', 'people', 1920);
  }
}

export const pixabayService = new PixabayService();