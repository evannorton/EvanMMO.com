interface MyGamesResponse {
  readonly games: {
    readonly embed: {
      readonly width: number;
      readonly height: number;
      readonly fullscreen: boolean;
    };
    readonly purchases_count: number;
    readonly p_windows: boolean;
    readonly p_osx: boolean;
    readonly created_at: string;
    readonly url: string;
    readonly classification: string;
    readonly short_text: string;
    readonly views_count: number;
    readonly p_android: boolean;
    readonly title: string;
    readonly published_at: string;
    readonly p_linux: boolean;
    readonly cover_url: string;
    readonly published: boolean;
    readonly has_demo: boolean;
    readonly min_price: number;
    readonly id: number;
    readonly can_be_bought: boolean;
    readonly in_press_system: boolean;
    readonly type: string;
    readonly downloads_count: number;
  }[];
}

export default MyGamesResponse;
