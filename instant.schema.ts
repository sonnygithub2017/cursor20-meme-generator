import { i } from "@instantdb/core";

const graph = i.graph(
  {
    memes: i.entity({
      imageUrl: i.string(),
      createdAt: i.number(),
      userId: i.string(),
      upvoteCount: i.number(),
    }),
    upvotes: i.entity({
      memeId: i.string(),
      userId: i.string(),
    }),
  },
  {}
);

export default graph;

