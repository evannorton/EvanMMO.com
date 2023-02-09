interface StreamsResponse {
  readonly data: {
    readonly id: string;
    readonly user_id: string;
    readonly user_login: string;
    readonly user_name: string;
    readonly game_id: string;
    readonly game_name: string;
    readonly type: string;
    readonly title: string;
    readonly viewer_count: number;
    readonly started_at: string;
    readonly language: string;
    readonly thumbnail_url: string;
    readonly tag_ids: string[];
    readonly tags: string[];
    readonly is_mature: boolean;
  }[];
}

export default StreamsResponse;
