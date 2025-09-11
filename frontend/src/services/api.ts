// Service API pour Synkro
export interface DocCreateRequest {
  text: string
  name?: string
  password?: string
}

export interface DocCreateResponse {
  '@context': string
  '@id': string
  '@type': string
  success: boolean
  docId: number
  message: string
}

export interface DocListItem {
  '@id': string
  '@type': string
  id: number
  name: string
  adminId?: number
  password?: string
}

export interface DocListResponse {
  member: DocListItem[]
  totalItems: number
  view: {
    '@id': string
    type: string
    first?: string
    last?: string
    previous?: string
    next?: string
  }
  search?: {
    '@type': string
    template: string
    variableRepresentation: string
    mapping: Array<{
      '@type': string
      variable: string
      property: string
      required: boolean
    }>
  }
}

export interface ApiError {
  '@context': string
  '@id': string
  '@type': string
  title: string
  detail: string
  status: number
  instance: string
  type: string
  description: string
  violations?: Array<{
    propertyPath: string
    message: string
  }>
}

class ApiService {
  private baseUrl = 'http://localhost:8000/api'
  private authToken: string | null = null

  // Permettre d'injecter le token depuis useAuth
  setAuthToken(token: string | null) {
    this.authToken = token
    if (token) {
      console.log('?? ApiService: Token configur�:', token.substring(0, 50) + '...')
    } else {
      console.log('?? ApiService: Token supprim�')
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json',
        ...options.headers,
      },
      ...options,
    }

    // Utiliser le token inject� ou celui du localStorage (fallback)
    const token = this.authToken || localStorage.getItem('auth_token')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      }
      console.log(`?? Token utilis� pour ${endpoint}:`, token.substring(0, 50) + '...')
    } else {
      console.warn(`?? Aucun token disponible pour ${endpoint}`)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch {
          errorData = { detail: `Erreur HTTP ${response.status}` }
        }
        
        throw new Error(errorData.detail || errorData.title || errorData.message || 'Erreur API')
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur API:', error)
      throw error
    }
  }

  // Cr�er une nouvelle room/doc
  async createRoom(data: DocCreateRequest): Promise<DocCreateResponse> {
    return this.request<DocCreateResponse>('/doc_creates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // R�cup�rer la liste des rooms publiques
  async getRooms(page: number = 1): Promise<DocListResponse> {
    try {
      return await this.request<DocListResponse>(`/doc_lists?page=${page}`)
    } catch (error) {
      // Fallback : retourner des donn�es de test si l'API n'est pas accessible
      console.warn('API non accessible, utilisation de donn�es de test')
      return this.getMockRooms(page)
    }
  }

  // R�cup�rer la liste des rooms (admin)
  async getRoomsAdmin(page: number = 1): Promise<DocListResponse> {
    return this.request<DocListResponse>(`/doc_list_admins?page=${page}`)
  }

  // Donn�es de test pour le d�veloppement
  private getMockRooms(page: number = 1): DocListResponse {
    return {
      member: [
        {
          '@id': '/api/docs/1',
          '@type': 'Doc',
          id: 1,
          name: 'Room de d�monstration',
          password: ''
        },
        {
          '@id': '/api/docs/2',
          '@type': 'Doc',
          id: 2,
          name: 'R�union priv�e',
          password: 'secret123'
        },
        {
          '@id': '/api/docs/3',
          '@type': 'Doc',
          id: 3,
          name: 'Brainstorming �quipe',
          password: ''
        }
      ],
      totalItems: 3,
      view: {
        '@id': `/api/doc_lists?page=${page}`,
        type: 'PartialCollectionView',
        first: '/api/doc_lists?page=1',
        last: '/api/doc_lists?page=1'
      }
    }
  }

  // Authentification simple avec email/mot de passe
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    try {
      // Temporairement d�sactiver l'auth pour cette requ�te
      const currentToken = this.authToken
      this.authToken = null
      
      const response = await this.request<any>('/user_logins', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      this.authToken = currentToken // Restaurer

      if (response.token) {
        this.setAuthToken(response.token)
        return response
      }
      
      throw new Error('Token non re�u du serveur')
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }

  // Inscription simple
  async register(email: string, password: string, name: string): Promise<{ token: string; user: any }> {
    try {
      // Temporairement d�sactiver l'auth pour cette requ�te
      const currentToken = this.authToken
      this.authToken = null
      
      const response = await this.request<any>('/user_registers', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      })

      this.authToken = currentToken // Restaurer

      if (response.token) {
        this.setAuthToken(response.token)
        return response
      }
      
      throw new Error('Token non re�u du serveur')
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      throw error
    }
  }

  // D�connexion
  logout(): void {
    this.authToken = null
  }

  // V�rifier si l'utilisateur est connect�
  isAuthenticated(): boolean {
    return !!(this.authToken || localStorage.getItem('auth_token'))
  }

  // R�cup�rer le token JWT
  getToken(): string | null {
    return this.authToken || localStorage.getItem('auth_token')
  }
}

export const apiService = new ApiService()
export default apiService
