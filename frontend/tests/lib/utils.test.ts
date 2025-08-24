import { describe, it, expect } from 'vitest'
import { cn } from '../../src/lib/utils'

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toBe('base conditional')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid')
      expect(result).toBe('base valid')
    })

    it('should handle empty strings', () => {
      const result = cn('base', '', 'valid')
      expect(result).toBe('base valid')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4') // px-4 should override px-2
      expect(result).toContain('px-4')
      expect(result).not.toContain('px-2')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true
      })
      expect(result).toBe('class1 class3')
    })

    it('should handle complex combinations', () => {
      const isActive = true
      const isDisabled = false

      const result = cn(
        'base-class',
        {
          active: isActive,
          disabled: isDisabled
        },
        isActive && 'active-modifier',
        'final-class'
      )

      expect(result).toBe('base-class active active-modifier final-class')
    })
  })
})
