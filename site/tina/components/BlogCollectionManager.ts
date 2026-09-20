import React, { useState, useEffect } from 'react';
import { useCMS } from 'tinacms';

export const BlogCollectionManager = (props: any) => {
  if (typeof window === 'undefined') {
    return null;
  }

  const cms = useCMS();
  (window as any).__compProps = Object.keys(props || {});
  (window as any).__cmsApi = cms?.api;

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (e: any) => {
    const val = e.target.value;
    setNewTitle(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setNewSlug(slug);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res: any = await (cms.api as any).tina.request(
        `query {
          postConnection(sort: "date") {
            totalCount
            edges {
              node {
                id
                _sys { filename }
                title
                date
                description
              }
            }
          }
        }`,
        { variables: {} }
      );
      (window as any).__lastResult = res;
      const connection = res?.postConnection || res?.data?.postConnection;
      const edges = connection?.edges || [];
      const items = edges
        .map((e: any) => e.node)
        .sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      setPosts(items);
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      (window as any).__lastError = String(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: any) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError('Please enter a post title.');
      return;
    }
    const slug = newSlug.trim() || newTitle.toLowerCase().replace(/\s+/g, '-');
    if (!slug) {
      setError('Please enter a valid slug.');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const res: any = await (cms.api as any).tina.request(
        `mutation CreatePost($relativePath: String!, $params: PostMutation!) {
          createPost(relativePath: $relativePath, params: $params) {
            id
            _sys { filename }
            title
          }
        }`,
        {
          variables: {
            relativePath: `${slug}.md`,
            params: {
              title: newTitle.trim(),
              description: newDesc.trim() || 'New blog article for Evergreen Consulting.',
              date: new Date(newDate).toISOString(),
              body: {
                type: 'root',
                children: [
                  {
                    type: 'p',
                    children: [{ type: 'text', text: 'Start writing your post content here...' }],
                  },
                ],
              },
            },
          },
        }
      );

      const created = res?.createPost || res?.data?.createPost;
      if (created) {
        setShowAddForm(false);
        setNewTitle('');
        setNewSlug('');
        setNewDesc('');
        // Immediately navigate into the newly created post in live visual preview
        window.location.hash = `#/~/blog/${slug}/`;
      } else {
        setError('Failed to create post. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating post.');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return React.createElement(
    'div',
    {
      style: {
        marginBottom: '1.75rem',
        paddingBottom: '1.5rem',
        borderBottom: '2px dashed #e2e8f0',
      },
    },
    // Section Header with Add Post button
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          gap: '0.5rem',
        },
      },
      React.createElement(
        'div',
        null,
        React.createElement(
          'span',
          {
            style: {
              fontWeight: 700,
              fontSize: '0.925rem',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            },
          },
          '📚 Blog Posts',
          React.createElement(
            'span',
            {
              style: {
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                background: '#f1f5f9',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
              },
            },
            posts.length
          )
        ),
        React.createElement(
          'div',
          { style: { fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' } },
          'Manage all articles in this collection'
        )
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () => {
            setShowAddForm(!showAddForm);
            setError(null);
          },
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: showAddForm ? '#f1f5f9' : '#046A38',
            color: showAddForm ? '#475569' : '#ffffff',
            border: showAddForm ? '1px solid #cbd5e1' : 'none',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: showAddForm ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease',
          },
        },
        showAddForm ? 'Cancel' : '➕ Add New Blog'
      )
    ),

    // Add Post Form (Expandable)
    showAddForm &&
      React.createElement(
        'form',
        {
          onSubmit: handleCreatePost,
          style: {
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          },
        },
        React.createElement(
          'div',
          { style: { fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' } },
          'New Blog Article'
        ),
        error &&
          React.createElement(
            'div',
            {
              style: {
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.4rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
              },
            },
            error
          ),
        // Title Input
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            {
              style: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' },
            },
            'Post Title *'
          ),
          React.createElement('input', {
            type: 'text',
            required: true,
            placeholder: 'e.g. 10 Common Mistakes on College Essays',
            value: newTitle,
            onChange: handleTitleChange,
            style: {
              width: '100%',
              padding: '0.45rem 0.6rem',
              border: '1px solid #cbd5e1',
              borderRadius: '5px',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
            },
          })
        ),
        // Slug Input
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            {
              style: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' },
            },
            'URL Slug / Filename'
          ),
          React.createElement('input', {
            type: 'text',
            required: true,
            placeholder: '10-common-mistakes',
            value: newSlug,
            onChange: (e: any) => setNewSlug(e.target.value),
            style: {
              width: '100%',
              padding: '0.45rem 0.6rem',
              border: '1px solid #cbd5e1',
              borderRadius: '5px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              background: '#ffffff',
              boxSizing: 'border-box',
            },
          }),
          React.createElement(
            'span',
            { style: { fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem', display: 'block' } },
            `Preview URL: /blog/${newSlug || '...'}/`
          )
        ),
        // Description Input
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            {
              style: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' },
            },
            'Short Description'
          ),
          React.createElement('textarea', {
            rows: 2,
            placeholder: 'One or two sentences summarizing the article.',
            value: newDesc,
            onChange: (e: any) => setNewDesc(e.target.value),
            style: {
              width: '100%',
              padding: '0.45rem 0.6rem',
              border: '1px solid #cbd5e1',
              borderRadius: '5px',
              fontSize: '0.85rem',
              boxSizing: 'border-box',
              resize: 'vertical',
            },
          })
        ),
        // Date Input
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            {
              style: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' },
            },
            'Publish Date'
          ),
          React.createElement('input', {
            type: 'date',
            value: newDate,
            onChange: (e: any) => setNewDate(e.target.value),
            style: {
              width: '100%',
              padding: '0.4rem 0.6rem',
              border: '1px solid #cbd5e1',
              borderRadius: '5px',
              fontSize: '0.85rem',
              boxSizing: 'border-box',
            },
          })
        ),
        // Submit button
        React.createElement(
          'button',
          {
            type: 'submit',
            disabled: creating,
            style: {
              marginTop: '0.35rem',
              background: creating ? '#94a3b8' : '#EA580C',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: creating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            },
          },
          creating ? 'Creating Post...' : 'Create & Open in Live Editor →'
        )
      ),

    // Existing Posts List
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        },
      },
      loading &&
        React.createElement(
          'div',
          { style: { fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' } },
          'Loading published articles...'
        ),
      !loading &&
        posts.map((p) => {
          const filename = p?._sys?.filename;
          return React.createElement(
            'div',
            {
              key: p.id || filename,
              style: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                transition: 'border-color 0.15s ease',
              },
            },
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                },
              },
              React.createElement(
                'span',
                {
                  style: {
                    fontWeight: 600,
                    fontSize: '0.825rem',
                    color: '#1e293b',
                    lineHeight: 1.3,
                  },
                },
                p.title || filename
              ),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: () => {
                    window.location.hash = `#/~/blog/${filename}/`;
                  },
                  style: {
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    color: '#046A38',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  },
                },
                'Edit →'
              )
            ),
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.725rem',
                  color: '#64748b',
                },
              },
              React.createElement('span', null, formatDate(p.date)),
              React.createElement('span', null, '•'),
              React.createElement(
                'span',
                { style: { fontFamily: 'monospace', color: '#94a3b8' } },
                `/blog/${filename}/`
              )
            )
          );
        })
    )
  );
};
