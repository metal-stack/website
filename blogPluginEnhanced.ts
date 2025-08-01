import type { LoadContext, Plugin } from '@docusaurus/types';
import blogPlugin, { type BlogContent } from '@docusaurus/plugin-content-blog';
import type { PluginOptions as BlogPluginOptions } from '@docusaurus/plugin-content-blog';

// @ts-expect-error: fixed in v3.8, see https://github.com/facebook/docusaurus/pull/10929
export { validateOptions } from '@docusaurus/plugin-content-blog';

export default async function blogPluginEnhanced(
    context: LoadContext,
    options: BlogPluginOptions
): Promise<Plugin<BlogContent>> {
    const blogPluginInstance = await blogPlugin(context, options);
    return {
        ...blogPluginInstance,
        async contentLoaded({ content, actions }) {
            await blogPluginInstance.contentLoaded({ content, actions });

            const latestPosts = [...content.blogPosts]
                .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())
                .slice(0, 3)
                .map(post => ({
                    id: post.id,
                    slug: post.metadata.permalink,
                    title: post.metadata.title,
                    description: post.metadata.description,
                    date: post.metadata.date,
                    firstAuthor: {
                        name: post.metadata.authors[0]?.name,
                        url: post.metadata.authors[0]?.imageURL,
                    },
                }))

            actions.setGlobalData({
                latestBlogPosts: latestPosts,
            });
        },
    };
}
