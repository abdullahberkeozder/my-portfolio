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
