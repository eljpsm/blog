import React, { useState } from "react";
import { formatDate } from "../Utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./BlogPostView.scss";
import Loading from "../shared/Loading";
import Fuse from "fuse.js";
import { Link } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import { solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { BlogPost } from "../assets";
import remarkGemoji from "remark-gemoji";
import { useCurrentEffect } from "use-current-effect";

/**
 * Render a blog post.
 * @param blogPosts - The blog posts.
 * @param postTextMap - The post text.
 * @param isLoadingPosts - Whether the posts are loading.
 * @param updateTitle - The function to update the title.
 * @constructor
 */
export const BlogPostView = ({
  blogPosts,
  postTextMap,
  isLoadingPosts,
  updateTitle,
}: {
  blogPosts: BlogPost[];
  postTextMap: Record<string, string> | undefined;
  isLoadingPosts: boolean;
  updateTitle: (title: string | undefined) => void;
}): JSX.Element => {
  const unknownBlogPostTitle = "Could not find blog post :(";

  // The expected post identity via the window location.
  const [expectedPostIdentity, setExpectedPostIdentity] = useState<
    string | undefined
  >();
  // The current blog post.
  const [currentBlogPost, setCurrentBlogPost] = useState<
    BlogPost | undefined
  >();
  // Similar blog posts by name.
  const [similarBlogPosts, setSimilarBlogPosts] = useState<BlogPost[]>();
  // Whether the blog post view is loading.
  const [isLoadingView, setIsLoadingView] = useState<boolean>(true);

  useCurrentEffect(
    (isCurrent) => {
      const postIdentity = window.location.pathname.slice(1);

      // Get the current blog post.
      const current = blogPosts.find(
        (blogPost) =>
          blogPost.safeName === postIdentity || blogPost.name === postIdentity
      );

      if (isCurrent()) {
        if (current) {
          // If a blog post is found, update the title accordingly.
          updateTitle(current.name ?? current.safeName);
        } else {
          updateTitle(unknownBlogPostTitle);
        }
        setCurrentBlogPost(current);
        setExpectedPostIdentity(postIdentity);
        setSimilarBlogPosts(findSimilarBlogPosts(postIdentity));
        setIsLoadingView(false);
      }
    },
    [window.location.pathname]
  );

  /**
   * Find similar blog posts from a given name.
   * @param text - The text to search.
   */
  const findSimilarBlogPosts = (text: string | undefined): BlogPost[] => {
    const blogPostNames = blogPosts.map((blogPost) => blogPost.name);

    if (postTextMap && text) {
      const fuse = new Fuse(blogPostNames, { includeScore: true });
      const results = fuse.search(text);

      const matchingBlogPosts: BlogPost[] = [];
      results.forEach((result) => {
        const match = blogPosts.find(
          (blogPost) => blogPost.name === result.item
        );
        if (match) {
          matchingBlogPosts.push(match);
        }
      });

      return matchingBlogPosts;
    }

    return [];
  };

  return (
    <div className={"blog-post"}>
      {postTextMap === undefined ||
      !expectedPostIdentity ||
      isLoadingPosts ||
      isLoadingView ? (
        <Loading />
      ) : expectedPostIdentity in postTextMap && currentBlogPost ? (
        <>
          <p className={"blog-info-date"}>
            {formatDate(currentBlogPost?.date)}
          </p>
          <ReactMarkdown
            children={postTextMap[expectedPostIdentity]}
            remarkPlugins={[remarkGfm, remarkGemoji]}
            components={{
              // Fix image scaling on small devices and really large images.
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              img: ({ node, ...props }) => (
                <img className={"markdown-image"} {...props} alt={props.alt} />
              ),

              // Format code using SyntaxHighlighter.
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, "")}
                    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
                    // @ts-ignore
                    style={solarizedlight}
                    language={match[1]}
                    PreTag="div"
                    showLineNumbers={true}
                    showInlineLineNumbers={true}
                    wrapLines={true}
                    wrapLongLines={true}
                    {...props}
                  />
                ) : (
                  <code {...props}>{children}</code>
                );
              },
            }}
          />
        </>
      ) : (
        <div>
          <h1>{unknownBlogPostTitle}</h1>
          {similarBlogPosts && similarBlogPosts.length > 0 && (
            <span>
              Similar post names:{" "}
              {similarBlogPosts.map((result, index) => {
                return (
                  <Link
                    key={index}
                    className={"similar-post-name"}
                    to={`/${result.safeName ?? result.name}`}
                  >
                    {result.name}
                  </Link>
                );
              })}
            </span>
          )}
        </div>
      )}
      <Link className={"return-link"} to={"/"}>
        {"<- return to home"}
      </Link>
    </div>
  );
};

export default BlogPostView;
