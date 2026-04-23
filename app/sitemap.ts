import type { MetadataRoute } from 'next';
import { getAvailableDates } from '@/lib/schedule';

const BASE_URL = 'https://anyandallsports.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const availableDates = getAvailableDates();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/preferences`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/archive`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Generate date pages from available schedules
  const datePages: MetadataRoute.Sitemap = availableDates.map((date) => {
    // Determine priority based on how recent the date is
    const today = new Date();
    const pageDate = new Date(date);
    const diffDays = Math.abs(
      Math.floor((today.getTime() - pageDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    let priority = 0.8;
    let changeFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily';

    if (diffDays === 0) {
      priority = 0.9;
      changeFrequency = 'hourly';
    } else if (diffDays <= 7) {
      priority = 0.7;
      changeFrequency = 'daily';
    } else if (diffDays <= 30) {
      priority = 0.5;
      changeFrequency = 'weekly';
    } else {
      priority = 0.3;
      changeFrequency = 'monthly';
    }

    return {
      url: `${BASE_URL}/${date}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    };
  });

  return [...staticPages, ...datePages];
}
