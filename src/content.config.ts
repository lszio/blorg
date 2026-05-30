import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown, MDX, and Org files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx,org}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.preprocess((data: any) => {
      // Handle Org-mode date mapping
      if (!data.createTime && data.date) {
        data.createTime = data.date;
      }
      return data;
    }, z.object({
			title: z.string(),
			summary: z.string().optional(),
			// Transform string to Date object
			createTime: z.coerce.date(),
			modifyTime: z.coerce.date().optional(),
			image: z.optional(image()),
			labels: z.preprocess((val) => {
        if (typeof val === 'string') return val.split(/[\s,:]+/).filter(Boolean);
        return val;
      }, z.array(z.string()).default([])),
			draft: z.preprocess((val) => {
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return val;
      }, z.boolean().default(false)),
		})),
});

export const collections = { blog };
