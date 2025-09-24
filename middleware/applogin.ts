import type { IncomingMessage, ServerResponse } from 'http'
import type { NextFunction } from 'connect'

interface RequestData {
  strUserID?: string
  [key: string]: string | undefined
}

interface SuccessResponse {
  success: boolean
  message: string
  userID: string
  timestamp: string
}

interface ErrorResponse {
  error: string
}

export default function (req: IncomingMessage, res: ServerResponse, next: NextFunction): void {
  // /dit/AppLogin/ReLogIn2 요청 처리 (GET, POST 모두 지원)
  if (req.url === '/dit/AppLogin/ReLogIn2' && (req.method === 'POST' || req.method === 'GET')) {
    console.log('🔥 ReLogIn2 요청 처리 - 메서드:', req.method)
    
    if (req.method === 'GET') {
      // GET 요청은 즉시 성공 응답
      const successResponse: SuccessResponse = {
        success: true,
        message: 'ReLogIn2 GET 요청 성공',
        userID: 'unknown',
        timestamp: new Date().toISOString()
      }
      
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      })
      
      res.end(JSON.stringify(successResponse))
      return
    }
    
    // POST 요청의 body를 파싱
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    
    req.on('end', () => {
      try {
        // 간단한 파싱 (실제로는 더 안전한 파싱 라이브러리 사용 권장)
        const data: RequestData = {}
        if (body) {
          body.split('&').forEach(pair => {
            const [key, value] = pair.split('=')
            if (key && value) {
              data[decodeURIComponent(key)] = decodeURIComponent(value)
            }
          })
        }
        
        console.log('🔥 ReLogIn2 POST 요청 처리:', data)
        
        // 성공 응답 반환
        const successResponse: SuccessResponse = {
          success: true,
          message: 'ReLogIn2 POST 요청 성공',
          userID: data.strUserID || 'unknown',
          timestamp: new Date().toISOString()
        }
        
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        })
        
        res.end(JSON.stringify(successResponse))
        
        return
      } catch (error) {
        console.error('🔥 ReLogIn2 파싱 에러:', error)
        const errorResponse: ErrorResponse = { error: '파싱 실패' }
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(errorResponse))
        return
      }
    })
    
    return
  }
  
  // /AppLogin/ReLogIn 요청 처리 (GET, POST 모두 지원)
  if (req.url === '/AppLogin/ReLogIn' && (req.method === 'POST' || req.method === 'GET')) {
    console.log('🔥 ReLogIn 요청 처리 - 메서드:', req.method)
    
    if (req.method === 'GET') {
      // GET 요청은 즉시 성공 응답
      const successResponse: SuccessResponse = {
        success: true,
        message: 'ReLogIn GET 요청 성공',
        userID: 'unknown',
        timestamp: new Date().toISOString()
      }
      
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      })
      
      res.end(JSON.stringify(successResponse))
      return
    }
    
    // POST 요청의 body를 파싱
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    
    req.on('end', () => {
      try {
        const data: RequestData = {}
        if (body) {
          body.split('&').forEach(pair => {
            const [key, value] = pair.split('=')
            if (key && value) {
              data[decodeURIComponent(key)] = decodeURIComponent(value)
            }
          })
        }
        
        console.log('🔥 ReLogIn POST 요청 처리:', data)
        
        const successResponse: SuccessResponse = {
          success: true,
          message: 'ReLogIn POST 요청 성공',
          userID: data.strUserID || 'unknown',
          timestamp: new Date().toISOString()
        }
        
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        })
        
        res.end(JSON.stringify(successResponse))
        
        return
      } catch (error) {
        console.error('🔥 ReLogIn 파싱 에러:', error)
        const errorResponse: ErrorResponse = { error: '파싱 실패' }
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(errorResponse))
        return
      }
    })
    
    return
  }
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    res.end()
    return
  }
  
  // 다른 요청은 다음 미들웨어로 전달
  next()
}
