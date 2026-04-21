import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
}

interface ApiError {
  message: string
  status?: number
  code?: string
}

class ApiClient {
  private axiosInstance: AxiosInstance

  constructor() {
    const config = useRuntimeConfig()
    
    this.axiosInstance = axios.create({
      // 在開發環境使用相對路徑（通過 Vite 代理），生產環境使用絕對路徑
      baseURL: process.env.NODE_ENV === 'development' 
        ? '/api/v1' 
        : (config.public?.apiBaseUrl as string) || 'http://localhost:8000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      // 自動處理重定向
      maxRedirects: 5,
      // 允許處理 HTTP 307 重定向
      validateStatus: (status) => status < 400,
    })

    // 請求攔截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // 可以在這裡添加認證 token
        // const token = useCookie('auth-token').value
        // if (token) {
        //   config.headers!.Authorization = `Bearer ${token}`
        // }
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 響應攔截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        // 詳細錯誤日誌
        console.error('API 請求錯誤:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })

        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || '發生未知錯誤',
          status: error.response?.status,
          code: error.response?.data?.code || error.code,
        }

        // 處理特定錯誤狀態
        if (error.response?.status === 401) {
          // 未授權，可以重定向到登入頁面
          console.warn('未授權訪問，請重新登入')
          // await navigateTo('/login')
        } else if (error.response?.status === 403) {
          // 禁止訪問
          console.warn('無權限訪問此資源')
        } else if (error.response?.status >= 500) {
          // 服務器錯誤
          console.error('服務器錯誤：', apiError.message)
        } else if (error.code === 'ECONNREFUSED') {
          // 連接被拒絕
          apiError.message = 'API 服務器無法連接，請檢查服務器狀態'
        } else if (error.code === 'NETWORK_ERROR') {
          // 網路錯誤
          apiError.message = '網路連接失敗，請檢查網路狀態'
        }

        return Promise.reject(apiError)
      }
    )
  }

  /**
   * GET 請求
   * @param url 請求路徑
   * @param config 額外配置
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get(url, config)
      return response.data as T
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * POST 請求
   * @param url 請求路徑
   * @param data 請求數據
   * @param config 額外配置
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.post(url, data, config)
      return response.data as T
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * PUT 請求
   * @param url 請求路徑
   * @param data 請求數據
   * @param config 額外配置
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.put(url, data, config)
      return response.data as T
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * DELETE 請求
   * @param url 請求路徑
   * @param config 額外配置
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete(url, config)
      return response.data as T
    } catch (error) {
      throw error as ApiError
    }
  }

  /**
   * 檔案上傳
   * @param url 請求路徑
   * @param formData FormData 物件
   * @param onUploadProgress 上傳進度回調
   */
  async upload<T = any>(
    url: string, 
    formData: FormData, 
    onUploadProgress?: (progress: number) => void
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onUploadProgress(progress)
          }
        },
      })
      return response.data as T
    } catch (error) {
      throw error as ApiError
    }
  }
}

// 創建單例實例
let apiClient: ApiClient | null = null

/**
 * useApi composable
 * 提供統一的 API 請求介面
 */
export const useApi = () => {
  if (!apiClient) {
    apiClient = new ApiClient()
  }

  return {
    get: apiClient.get.bind(apiClient),
    post: apiClient.post.bind(apiClient),
    put: apiClient.put.bind(apiClient),
    delete: apiClient.delete.bind(apiClient),
    upload: apiClient.upload.bind(apiClient),
  }
}

// 導出類型定義供其他檔案使用
export type { ApiResponse, ApiError } 