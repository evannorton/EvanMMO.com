interface VODJSON {
  readonly comments: {
    readonly _id: string;
    readonly commenter: {
      readonly display_name: string;
    };
    readonly content_offset_seconds: number;
    readonly message: {
      readonly body: string;
      readonly user_color: string | null;
    };
  }[];
}

export default VODJSON;
