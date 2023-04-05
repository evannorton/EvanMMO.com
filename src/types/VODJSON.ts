interface VODJSON {
  readonly comments: {
    readonly _id: string;
    readonly content_offset_seconds: number;
    readonly message: {
      readonly body: string;
    };
  }[];
}

export default VODJSON;
