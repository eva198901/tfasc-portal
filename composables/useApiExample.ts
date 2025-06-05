import { useApi } from './useApi'

/**
 * useApi 使用範例
 * 示範如何使用 Axios wrapper 進行 API 請求
 */

// 標案資料介面
interface Tender {
  id: string
  title: string
  description: string
  budget: number
  status: 'active' | 'closed' | 'draft'
  createdAt: string
  updatedAt: string
}

// 使用者資料介面
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

// API 回應介面
interface TendersResponse {
  tenders: Tender[]
  total: number
  page: number
  pageSize: number
}

/**
 * 標案相關 API
 */
export const useTenderApi = () => {
  const { get, post, put, delete: deleteMethod } = useApi()

  return {
    // 取得所有標案
    async getTenders(page = 1, pageSize = 10): Promise<TendersResponse> {
      return await get<TendersResponse>(`/tenders?page=${page}&pageSize=${pageSize}`)
    },

    // 取得單一標案
    async getTender(id: string): Promise<Tender> {
      return await get<Tender>(`/tenders/${id}`)
    },

    // 建立新標案
    async createTender(tender: Omit<Tender, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tender> {
      return await post<Tender>('/tenders', tender)
    },

    // 更新標案
    async updateTender(id: string, tender: Partial<Tender>): Promise<Tender> {
      return await put<Tender>(`/tenders/${id}`, tender)
    },

    // 刪除標案
    async deleteTender(id: string): Promise<void> {
      return await deleteMethod<void>(`/tenders/${id}`)
    },

    // 搜尋標案
    async searchTenders(query: string): Promise<Tender[]> {
      return await get<Tender[]>(`/tenders/search?q=${encodeURIComponent(query)}`)
    }
  }
}

/**
 * 使用者相關 API
 */
export const useUserApi = () => {
  const { get, post, put } = useApi()

  return {
    // 取得使用者資料
    async getUser(id: string): Promise<User> {
      return await get<User>(`/users/${id}`)
    },

    // 取得目前使用者
    async getCurrentUser(): Promise<User> {
      return await get<User>('/users/me')
    },

    // 更新使用者資料
    async updateUser(id: string, user: Partial<User>): Promise<User> {
      return await put<User>(`/users/${id}`, user)
    },

    // 使用者登入
    async login(email: string, password: string): Promise<{ token: string; user: User }> {
      return await post<{ token: string; user: User }>('/auth/login', { email, password })
    },

    // 使用者登出
    async logout(): Promise<void> {
      return await post<void>('/auth/logout')
    }
  }
}

/**
 * 檔案上傳 API
 */
export const useFileApi = () => {
  const { upload } = useApi()

  return {
    // 上傳標案文件
    async uploadTenderDocument(
      tenderId: string, 
      file: File, 
      onProgress?: (progress: number) => void
    ): Promise<{ url: string; filename: string }> {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tenderId', tenderId)

      return await upload<{ url: string; filename: string }>(
        '/tenders/upload-document',
        formData,
        onProgress
      )
    },

    // 上傳使用者頭像
    async uploadUserAvatar(
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<{ url: string }> {
      const formData = new FormData()
      formData.append('avatar', file)

      return await upload<{ url: string }>(
        '/users/avatar',
        formData,
        onProgress
      )
    }
  }
}

/**
 * 在 Vue 組件中的使用範例
 * 
 * <script setup>
 * const tenderApi = useTenderApi()
 * const userApi = useUserApi()
 * const fileApi = useFileApi()
 * 
 * // 取得標案列表
 * const { data: tenders, pending, error } = await useLazyAsyncData(
 *   'tenders',
 *   () => tenderApi.getTenders()
 * )
 * 
 * // 建立新標案
 * const createTender = async () => {
 *   try {
 *     const newTender = await tenderApi.createTender({
 *       title: '新標案',
 *       description: '標案描述',
 *       budget: 100000,
 *       status: 'draft'
 *     })
 *     console.log('標案建立成功:', newTender)
 *   } catch (error) {
 *     console.error('建立標案失敗:', error)
 *   }
 * }
 * 
 * // 檔案上傳
 * const uploadFile = async (file: File) => {
 *   try {
 *     const result = await fileApi.uploadTenderDocument(
 *       'tender-id',
 *       file,
 *       (progress) => console.log(`上傳進度: ${progress}%`)
 *     )
 *     console.log('檔案上傳成功:', result)
 *   } catch (error) {
 *     console.error('檔案上傳失敗:', error)
 *   }
 * }
 * </script>
 */ 