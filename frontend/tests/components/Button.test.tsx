import React from 'react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../../src/components/ui/Button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should apply default variant classes', () => {
    render(<Button>Default button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('should apply destructive variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })

  it('should apply outline variant classes', () => {
    render(<Button variant="outline">Outline button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-input', 'bg-background')
  })

  it('should apply secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  it('should apply ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass(
      'hover:bg-accent',
      'hover:text-accent-foreground'
    )
  })

  it('should apply link variant classes', () => {
    render(<Button variant="link">Link</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-primary', 'underline-offset-4')
  })

  it('should apply small size classes', () => {
    render(<Button size="sm">Small</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9', 'px-3')
  })

  it('should apply large size classes', () => {
    render(<Button size="lg">Large</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-11', 'px-8')
  })

  it('should apply icon size classes', () => {
    render(<Button size="icon">🔍</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'w-10')
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()

    render(<Button ref={ref}>Button with ref</Button>)

    expect(ref).toHaveBeenCalled()
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should pass through HTML button attributes', () => {
    render(
      <Button type="submit" data-testid="submit-button">
        Submit
      </Button>
    )

    const button = screen.getByTestId('submit-button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
