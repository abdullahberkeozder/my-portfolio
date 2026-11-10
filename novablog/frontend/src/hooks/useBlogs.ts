'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogDto, CommentResponseDto, CommentCreateRequestDto } from '@/types/api';
import { ApiClient } from '@/lib/api';

/**
 * TanStack Query v5 Hooks for NovaBlog Client & Server State Management.
 * Includes Optimistic UI for likes and comments with automatic cache rollback on failure.
 *
 * @author Abdullah Berke Özder
 */

// 1. All Blogs Query
export function useBlogsQuery() {
  return useQuery<BlogDto[]>({
    queryKey: ['blogs'],
    queryFn: () => ApiClient.getBlogs(),
    staleTime: 30 * 1000,
  });
}

// 2. Single Blog Detail Query
export function useBlogDetailQuery(blogId?: number | null) {
  return useQuery<BlogDto>({
    queryKey: ['blogs', blogId],
    queryFn: () => ApiClient.getBlogById(blogId!),
    enabled: Boolean(blogId),
    staleTime: 30 * 1000,
  });
}

// 3. Categories Query
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => ApiClient.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

// 4. Comments Query
export function useCommentsQuery(blogId?: number | null) {
  return useQuery<CommentResponseDto[]>({
    queryKey: ['comments', blogId],
    queryFn: () => ApiClient.getComments(blogId!),
    enabled: Boolean(blogId),
  });
}

// 5. Optimistic Like / Unlike Mutation
interface ToggleLikeVariables {
  blogId: number;
  currentlyLiked: boolean;
}

export function useToggleLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { blogId: number; likesCount: number },
    Error,
    ToggleLikeVariables,
    { previousBlogs?: BlogDto[]; previousDetail?: BlogDto; blogId: number }
  >({
    mutationFn: ({ blogId, currentlyLiked }) => {
      return currentlyLiked ? ApiClient.removeLike(blogId) : ApiClient.recordLike(blogId);
    },

    // OPTIMISTIC UPDATE: Sunucudan yanıt beklemeden anında UI güncellemesi
    onMutate: async ({ blogId, currentlyLiked }) => {
      // 1. Devam eden sorgu isteklerini iptal et (yarış durumunu önler)
      await queryClient.cancelQueries({ queryKey: ['blogs'] });
      await queryClient.cancelQueries({ queryKey: ['blogs', blogId] });

      // 2. Olası hata durumunda geri yüklemek için önceki önbellek anlık görüntüsünü (snapshot) al
      const previousBlogs = queryClient.getQueryData<BlogDto[]>(['blogs']);
      const previousDetail = queryClient.getQueryData<BlogDto>(['blogs', blogId]);

      // 3. 'blogs' listesindeki ilgili kaydı atomik olarak optimistik güncelle
      if (previousBlogs) {
        queryClient.setQueryData<BlogDto[]>(['blogs'], (old) => {
          if (!old) return [];
          return old.map((b) => {
            const targetId = b.id ?? b.blogId;
            if (targetId === blogId) {
              const delta = currentlyLiked ? -1 : 1;
              const currentLikes = b.likesCount ?? b.likes ?? 0;
              const newLikes = Math.max(0, currentLikes + delta);
              return {
                ...b,
                likes: newLikes,
                likesCount: newLikes,
                isLiked: !currentlyLiked,
              };
            }
            return b;
          });
        });
      }

      // 4. Eğer blog detay modalı açıksa onun da önbelleğini optimistik güncelle
      if (previousDetail) {
        queryClient.setQueryData<BlogDto>(['blogs', blogId], (old) => {
          if (!old) return old;
          const delta = currentlyLiked ? -1 : 1;
          const currentLikes = old.likesCount ?? old.likes ?? 0;
          const newLikes = Math.max(0, currentLikes + delta);
          return {
            ...old,
            likes: newLikes,
            likesCount: newLikes,
            isLiked: !currentlyLiked,
          };
        });
      }

      // Rollback için context döndür
      return { previousBlogs, previousDetail, blogId };
    },

    // ROLLBACK: Sunucu hata verirse önceki duruma geri dön
    onError: (_err, _vars, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(['blogs'], context.previousBlogs);
      }
      if (context?.previousDetail && context?.blogId) {
        queryClient.setQueryData(['blogs', context.blogId], context.previousDetail);
      }
    },

    // REFETCH: İşlem tamamlandığında Write-Behind Redis tamponundaki son durumu sunucuyla eşitle
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', vars.blogId] });
    },
  });
}

// 6. View Counter Mutation (Write-Behind Trigger)
export function useRecordViewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogId: number) => ApiClient.recordView(blogId),
    onSuccess: (res, blogId) => {
      // Önbellekteki görüntülenme sayısını sessizce güncelle
      queryClient.setQueryData<BlogDto[]>(['blogs'], (old) => {
        if (!old) return old;
        return old.map((b) => {
          const targetId = b.id ?? b.blogId;
          if (targetId === blogId) {
            return {
              ...b,
              views: res.viewsCount,
              viewsCount: res.viewsCount,
            };
          }
          return b;
        });
      });

      queryClient.setQueryData<BlogDto>(['blogs', blogId], (old) => {
        if (!old) return old;
        return {
          ...old,
          views: res.viewsCount,
          viewsCount: res.viewsCount,
        };
      });
    },
  });
}

// 7. Optimistic Add Comment Mutation
interface AddCommentVariables {
  blogId: number;
  dto: CommentCreateRequestDto;
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CommentResponseDto,
    Error,
    AddCommentVariables,
    { previousComments?: CommentResponseDto[]; blogId: number }
  >({
    mutationFn: ({ blogId, dto }) => ApiClient.addComment(blogId, dto),

    onMutate: async ({ blogId, dto }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', blogId] });

      const previousComments = queryClient.getQueryData<CommentResponseDto[]>(['comments', blogId]);

      // Optimistik geçici yorum oluştur
      const optimisticComment: CommentResponseDto = {
        id: Date.now(),
        blogId,
        content: dto.content,
        authorName: dto.authorName || 'Ziyaretçi Mühendis',
        createdAt: new Date().toISOString(),
        isApproved: true,
        sentiment: 'POSITIVE',
        isOptimistic: true, // UI'da "Kaydediliyor..." görseli göstermek için
      };

      queryClient.setQueryData<CommentResponseDto[]>(['comments', blogId], (old) => {
        return [optimisticComment, ...(old || [])];
      });

      return { previousComments, blogId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousComments && context?.blogId) {
        queryClient.setQueryData(['comments', context.blogId], context.previousComments);
      }
    },

    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: ['comments', vars.blogId] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

// 8. Admin Moderation State Machine: Optimistic Approve Comment Mutation
export function useApproveCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CommentResponseDto,
    Error,
    { commentId: number; blogId: number },
    { previousComments?: CommentResponseDto[]; blogId: number }
  >({
    mutationFn: ({ commentId }) => ApiClient.approveComment(commentId),
    onMutate: async ({ commentId, blogId }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', blogId] });
      const previousComments = queryClient.getQueryData<CommentResponseDto[]>(['comments', blogId]);

      queryClient.setQueryData<CommentResponseDto[]>(['comments', blogId], (old) => {
        if (!old) return old;
        return old.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              isApproved: true,
              moderationStatus: 'APPROVED' as const,
            };
          }
          return c;
        });
      });

      return { previousComments, blogId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousComments && context?.blogId) {
        queryClient.setQueryData(['comments', context.blogId], context.previousComments);
      }
    },
    onSettled: (_data, _error, { blogId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', blogId] });
    },
  });
}

// 9. Admin Moderation State Machine: Optimistic Quarantine / Flag Comment Mutation
export function useFlagCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CommentResponseDto,
    Error,
    { commentId: number; blogId: number; reason?: string },
    { previousComments?: CommentResponseDto[]; blogId: number }
  >({
    mutationFn: ({ commentId, reason }) => ApiClient.flagComment(commentId, reason),
    onMutate: async ({ commentId, blogId }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', blogId] });
      const previousComments = queryClient.getQueryData<CommentResponseDto[]>(['comments', blogId]);

      queryClient.setQueryData<CommentResponseDto[]>(['comments', blogId], (old) => {
        if (!old) return old;
        return old.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              isApproved: false,
              moderationStatus: 'FLAGGED_TOXIC' as const,
              sentiment: 'NEGATIVE' as const,
            };
          }
          return c;
        });
      });

      return { previousComments, blogId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousComments && context?.blogId) {
        queryClient.setQueryData(['comments', context.blogId], context.previousComments);
      }
    },
    onSettled: (_data, _error, { blogId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', blogId] });
    },
  });
}

// 10. Blog Lifecycle State Machine: Deleted Blogs Query
export function useDeletedBlogsQuery() {
  return useQuery<BlogDto[]>({
    queryKey: ['deletedBlogs'],
    queryFn: () => ApiClient.getDeletedBlogs(),
    staleTime: 10 * 1000,
  });
}

// 11. Blog Lifecycle State Machine: Optimistic Restore Blog Mutation
export function useRestoreBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    BlogDto,
    Error,
    number,
    { previousDeleted?: BlogDto[]; previousBlogs?: BlogDto[] }
  >({
    mutationFn: (blogId) => ApiClient.restoreBlog(blogId),
    onMutate: async (blogId) => {
      await queryClient.cancelQueries({ queryKey: ['blogs'] });
      await queryClient.cancelQueries({ queryKey: ['deletedBlogs'] });

      const previousDeleted = queryClient.getQueryData<BlogDto[]>(['deletedBlogs']);
      const previousBlogs = queryClient.getQueryData<BlogDto[]>(['blogs']);

      const restoredItem = previousDeleted?.find((b) => (b.id ?? b.blogId) === blogId);

      if (previousDeleted) {
        queryClient.setQueryData<BlogDto[]>(
          ['deletedBlogs'],
          previousDeleted.filter((b) => (b.id ?? b.blogId) !== blogId)
        );
      }
      if (previousBlogs && restoredItem) {
        queryClient.setQueryData<BlogDto[]>(['blogs'], [
          { ...restoredItem, lifecycleStatus: 'ACTIVE', isDeleted: false },
          ...previousBlogs,
        ]);
      }

      return { previousDeleted, previousBlogs };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDeleted) {
        queryClient.setQueryData(['deletedBlogs'], context.previousDeleted);
      }
      if (context?.previousBlogs) {
        queryClient.setQueryData(['blogs'], context.previousBlogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['deletedBlogs'] });
    },
  });
}

// 12. Blog Lifecycle State Machine: Optimistic Soft Delete Blog Mutation
export function useSoftDeleteBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    number,
    { previousBlogs?: BlogDto[]; previousDeleted?: BlogDto[] }
  >({
    mutationFn: (blogId) => ApiClient.softDeleteBlog(blogId),
    onMutate: async (blogId) => {
      await queryClient.cancelQueries({ queryKey: ['blogs'] });
      await queryClient.cancelQueries({ queryKey: ['deletedBlogs'] });

      const previousBlogs = queryClient.getQueryData<BlogDto[]>(['blogs']);
      const previousDeleted = queryClient.getQueryData<BlogDto[]>(['deletedBlogs']);

      const deletedItem = previousBlogs?.find((b) => (b.id ?? b.blogId) === blogId);

      if (previousBlogs) {
        queryClient.setQueryData<BlogDto[]>(
          ['blogs'],
          previousBlogs.filter((b) => (b.id ?? b.blogId) !== blogId)
        );
      }
      if (deletedItem) {
        queryClient.setQueryData<BlogDto[]>(['deletedBlogs'], [
          {
            ...deletedItem,
            lifecycleStatus: 'SOFT_DELETED',
            isDeleted: true,
            deletedAt: new Date().toISOString(),
          },
          ...(previousDeleted || []),
        ]);
      }

      return { previousBlogs, previousDeleted };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(['blogs'], context.previousBlogs);
      }
      if (context?.previousDeleted) {
        queryClient.setQueryData(['deletedBlogs'], context.previousDeleted);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['deletedBlogs'] });
    },
  });
}

// 13. Two-Factor Authentication (TOTP) State Machine Query
export function useTwoFactorStatusQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['twoFactorStatus'],
    queryFn: () => ApiClient.get2faStatus(),
    enabled,
    staleTime: 30 * 1000,
  });
}

