const API_URL = 'http://localhost:5000/api';

export async function getPosts(search = '', page = 1) {
  try {
    const res = await fetch(`${API_URL}/posts?search=${search}&page=${page}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], pages: 0 };
  }
}

export async function getPost(id) {
  try {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function getRecommendedPosts() {
  try {
    const res = await fetch(`${API_URL}/posts?limit=5&sort=random&type=article`, {
        next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!res.ok) throw new Error('Failed to fetch recommended posts');
    return res.json();
  } catch (error) {
    console.error('Error fetching recommended posts:', error);
    return { posts: [] };
  }
}
