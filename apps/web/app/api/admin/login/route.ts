import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10)

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate simple session token
    const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64')
    
    const response = NextResponse.json({ success: true, token })
    
    // Set HTTP-only cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
