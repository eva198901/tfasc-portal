import { describe, it, expect } from 'vitest'

describe('Simple Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle basic math', () => {
    const result = 5 * 3
    expect(result).toBe(15)
  })

  it('should handle string operations', () => {
    const str = 'Hello World'
    expect(str.length).toBe(11)
    expect(str.toLowerCase()).toBe('hello world')
  })
}) 