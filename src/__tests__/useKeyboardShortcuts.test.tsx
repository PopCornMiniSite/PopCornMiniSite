import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function TestComponent({ onAction }: { onAction: (key: string) => void }) {
  useKeyboardShortcuts({
    ' ': () => onAction('space'),
    arrowleft: () => onAction('left'),
    arrowright: () => onAction('right'),
    arrowup: () => onAction('up'),
    arrowdown: () => onAction('down'),
    f: () => onAction('fullscreen'),
    m: () => onAction('mute'),
  })
  return <div data-testid="test-target" />
}

describe('useKeyboardShortcuts', () => {
  it('triggers action on space key', () => {
    const onAction = vi.fn()
    render(<TestComponent onAction={onAction} />)
    fireEvent.keyDown(screen.getByTestId('test-target'), { key: ' ' })
    expect(onAction).toHaveBeenCalledWith('space')
  })

  it('triggers action on arrow keys', () => {
    const onAction = vi.fn()
    render(<TestComponent onAction={onAction} />)
    fireEvent.keyDown(screen.getByTestId('test-target'), { key: 'ArrowLeft' })
    expect(onAction).toHaveBeenCalledWith('left')
    fireEvent.keyDown(screen.getByTestId('test-target'), { key: 'ArrowRight' })
    expect(onAction).toHaveBeenCalledWith('right')
    fireEvent.keyDown(screen.getByTestId('test-target'), { key: 'ArrowUp' })
    expect(onAction).toHaveBeenCalledWith('up')
    fireEvent.keyDown(screen.getByTestId('test-target'), { key: 'ArrowDown' })
    expect(onAction).toHaveBeenCalledWith('down')
  })

  it('triggers action on f key for fullscreen', () => {
    const onAction = vi.fn()
    render(<TestComponent onAction={onAction} />)
    fireEvent.keyDown(screen.getByTestId('test-target'), { key: 'f' })
    expect(onAction).toHaveBeenCalledWith('fullscreen')
  })

  it('triggers action on m key for mute', () => {
    const onAction = vi.fn()
    render(<TestComponent onAction={onAction} />)
    fireEvent.keyDown(screen.getByTestId('test-target'), { key: 'm' })
    expect(onAction).toHaveBeenCalledWith('mute')
  })

  it('does not trigger when typing in input', () => {
    const onAction = vi.fn()
    function InputTest() {
      useKeyboardShortcuts({
        ' ': () => onAction('space'),
      })
      return <input data-testid="input-field" />
    }
    render(<InputTest />)
    fireEvent.keyDown(screen.getByTestId('input-field'), { key: ' ' })
    expect(onAction).not.toHaveBeenCalled()
  })
})
