import Link from "next/link";
import { type Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative flex flex-col space-y-3">
      {post.image && (
        <Link href={`/blog/${post._meta.path}`}>
          <img
            src={post.image}
            alt={post.title}
            className="bg-muted mb-2 aspect-video rounded-md border object-cover transition-colors"
            loading="lazy"
          />
        </Link>
      )}
      <h2 className="text-xl font-semibold tracking-tight">
        <Link href={`/blog/${post._meta.path}`}>{post.title}</Link>
      </h2>
      {post.description && (
        <p className="text-muted-foreground">{post.description}</p>
      )}
      <time dateTime={post.date} className="text-muted-foreground text-sm">
        {formatDate(post.date)}
      </time>
    </article>
  );
}
