import { bio, stats, links, testimonials } from '@/data/content/about.json';
import { basics } from '@/data/cv/resume.json';

export const GET = async () => {
  const data = {
    name: basics.name,
    label: basics.label,
    image: basics.image,
    summary: basics.summary,
    bio: bio.join(' '),
    stats,
    testimonials,
    links,
    profiles: basics.profiles,
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
