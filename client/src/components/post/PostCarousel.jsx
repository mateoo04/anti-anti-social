import { Link, useLoaderData, useLocation } from 'react-router-dom';
import Header from '../layout/Header';
import Post from './Post';
import { useAuth } from '../../context/authContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import useInfiniteScroll from '../../hooks/infiniteScrollHook';
import { useEffect, useState } from 'react';

export default function PostCarousel() {
  const loaderData = useLoaderData();
  const { authenticatedUser } = useAuth();
  const location = useLocation();
  const isExplorePage = location.pathname === '/explore';

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [isExplorePage ? 'explore' : 'feed'],
      queryFn: async ({ pageParam }) => {
        const response = await fetch(
          `/api/posts${isExplorePage ? '/explore' : ''}?limit=6&cursor=${
            pageParam ?? ''
          }`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        return response.json();
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? false,
      initialData: {
        pageParams: [null],
        pages: [loaderData],
      },
    });

  const loaderRef = useInfiniteScroll(() => {
    if (hasNextPage) fetchNextPage();
  });

  const posts = data.pages.flatMap((page) => page.posts);

  return (
    <>
      <main className='container d-flex flex-column'>
        <Link
          to={'/posts/new'}
          className='align-self-center text-decoration-none btn rounded-5 bg-secondary text-white'
        >
          <b>+</b> NEW POST
        </Link>
        <div className='posts mt-5 d-flex flex-column gap-2'>
          {posts.length ? (
            <>
              {posts?.map((post) => {
                return (
                  <Post
                    key={`post-${post.id}`}
                    authorId={post.author.id}
                    firstName={post.author.firstName}
                    lastName={post.author.lastName}
                    username={post.author.username}
                    profileImageUrl={post.author.profileImageUrl}
                    dateTime={post.dateTime}
                    postId={post.id}
                    content={post.content}
                    photoUrl={post.photoUrl}
                    initialLikeCount={post._count.likedBy}
                    initialIsLikedByAuthUser={post.likedByAuthUser}
                  ></Post>
                );
              })}

              <div
                className='loader-ref-div'
                key={'loader-ref'}
                ref={loaderRef}
              >
                {isFetchingNextPage && (
                  <div className='d-flex justify-content-center align-items-center loader-container-small'>
                    <span className='loader loader-small'></span>
                  </div>
                )}
              </div>
            </>
          ) : authenticatedUser.following.length ? (
            <div className='loader-container'>
              <span className='loader loader-normal'></span>
            </div>
          ) : (
            <p className='text-center'>
              Follow other users to see posts.{' '}
              <Link
                className='text-secondary text-decoration-none link link-hover-decoration'
                to={'/users'}
              >
                Click here to find accounts to follow!
              </Link>
            </p>
          )}
        </div>
      </main>
    </>
  );
}
