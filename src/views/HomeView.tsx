import React, { useEffect } from "react";
import { Badge } from "react-bootstrap";
import "./HomeView.scss";
import { BlogPost } from "../assets";
import { Link } from "react-router-dom";
import { isBefore, isSameDay } from "date-fns";
import { websiteInfo } from "../Info";
import { formatDate } from "../Utils";

/**
 * The home view.
 * @param blogPosts - The blog posts.
 * @param updateTitle - The function to update the title.
 * @constructor
 */
export const HomeView = ({
  blogPosts,
  updateTitle,
}: {
  blogPosts: BlogPost[];
  updateTitle: (title: string | undefined) => void;
}): JSX.Element => {
  useEffect(() => {
    updateTitle(websiteInfo.title);
  }, []);

  return (
    <>
      {
        // Display all the possible blog posts.
        blogPosts.map((blogPost, index) => {
          return (
            <BlogPostHeader key={index} blogPost={blogPost} index={index} />
          );
        })
      }
    </>
  );
};

/**
 * The BlogPostHeader properties.
 */
interface BlogPostHeaderProps {
  blogPost: BlogPost;
  index: number;
}

/**
 * Render a blog post header.
 * @param props - The BlogPostHeader properties.
 * @constructor
 */
const BlogPostHeader = (props: BlogPostHeaderProps): JSX.Element => {
  const isNewPost = (postDate: Date) => {
    const current = new Date();
    return (
      isSameDay(current, postDate) ||
      isBefore(
        current,
        new Date(
          postDate.getFullYear(),
          postDate.getMonth(),
          postDate.getDate() + 7
        )
      )
    );
  };

  const postDate = new Date(props.blogPost.date);

  return (
    <div className={"blog-post-header"}>
      <p className={"blog-post-header-date"}>{formatDate(postDate)}</p>
      <Link
        className={"blog-post-header-link"}
        to={`/${props.blogPost.safeName ?? props.blogPost.name}`}
      >
        {`${props.index}. ${props.blogPost.name}`}
        {isNewPost(postDate) && (
          <Badge className={"blog-post-header-badge"}>new</Badge>
        )}
      </Link>
    </div>
  );
};

export default HomeView;
