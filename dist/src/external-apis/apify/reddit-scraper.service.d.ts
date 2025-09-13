import { ApifyClientService } from './apify-client.service';
export interface RedditScrapingInput {
    subreddits: string[];
    search_terms: string[];
    post_types: ('posts' | 'comments')[];
    time_filter: '24h' | '7d' | '30d';
}
export interface RedditPost {
    id: string;
    title: string;
    selfText: string;
    url: string;
    subreddit: string;
    author: string;
    score: number;
    upvoteRatio: number;
    numberOfComments: number;
    createdAt: string;
    flair?: string;
    isStickied: boolean;
    isLocked: boolean;
    awards: number;
    comments?: RedditComment[];
    foodRelevant?: boolean;
    locationMentioned?: boolean;
    engagementScore?: number;
    recommendationPost?: boolean;
}
export interface RedditComment {
    id: string;
    body: string;
    author: string;
    score: number;
    createdAt: string;
    isSubmitter: boolean;
    replies: RedditComment[];
}
export interface RedditIntelligenceData {
    discussions_analyzed: number;
    hot_topics: string[];
    community_recommendations: string[];
    upvote_sentiment: number;
    subreddit_activity: {
        [subreddit: string]: {
            post_count: number;
            engagement_score: number;
        };
    };
    popular_discussions: Array<{
        title: string;
        subreddit: string;
        score: number;
        url: string;
        engagement: number;
    }>;
    community_insights: {
        recommendation_threads: Array<{
            title: string;
            top_recommendation: string;
            consensus_score: number;
        }>;
        debate_topics: string[];
        expert_opinions: Array<{
            author: string;
            opinion: string;
            credibility_score: number;
        }>;
    };
}
export declare class RedditScraperService {
    private readonly apifyClient;
    private readonly logger;
    private readonly ACTOR_ID;
    constructor(apifyClient: ApifyClientService);
    scrapeRedditFoodDiscussions(location: string, categories?: string[]): Promise<RedditIntelligenceData>;
    private generateRelevantSubreddits;
    private generateSearchTerms;
    private analyzeRedditData;
    private extractHotTopics;
    private extractRecommendations;
    private extractMentions;
    private analyzeSubredditActivity;
    private findRecommendationThreads;
    private extractTopRecommendationFromComments;
    private identifyDebateTopics;
    private extractExpertOpinions;
    private getFallbackData;
}
