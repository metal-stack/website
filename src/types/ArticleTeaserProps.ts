export interface ArticleTeaserProps {
    id: string
    slug: string
    title: string
    description: string
    date: Date
    firstAuthor: {
        name: string
        url: string
    }
}