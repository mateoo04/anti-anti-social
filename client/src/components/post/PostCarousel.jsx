import { Link, useLoaderData, useLocation } from 'react-router-dom';
import Post from './Post';
import { useInfiniteQuery } from '@tanstack/react-query';
import useInfiniteScroll from '../../hooks/infiniteScrollHook';

export default function PostCarousel() {
  const loaderData = useLoaderData();
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
      getNextPageParam: (lastPage) => {
        if (lastPage?.nextCursor) return lastPage.nextCursor;
        return undefined;
      },
      initialData: {
        pageParams: [null],
        pages: [loaderData],
      },
      suspense: false,
      enabled: !!loaderData,
    });

  const loaderRef = useInfiniteScroll(() => {
    if (hasNextPage) fetchNextPage();
  });

  const posts = data.pages.flatMap((page) => page.posts);
  const isEmpty = posts.length === 0 && !hasNextPage;

  return (
    <>
      <main className='container d-flex flex-column'>
        <div className='posts d-flex flex-column gap-3'>
          {!isEmpty ? (
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
                {hasNextPage && isFetchingNextPage && (
                  <div className='d-flex justify-content-center align-items-center loader-container-small'>
                    Loading...<span className='loader loader-small'></span>
                  </div>
                )}
              </div>
            </>
          ) : hasNextPage ? (
            <div className='loader-container'>
              <span className='loader loader-normal'></span>
            </div>
          ) : (
            <p className='text-center'>
              Nothing to see here.{' '}
              {!isExplorePage && (
                <Link
                  className='text-primary text-decoration-none link link-hover-decoration'
                  to={'/users'}
                >
                  Click here to find accounts to follow!
                </Link>
              )}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
