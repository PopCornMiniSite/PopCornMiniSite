import { lazy, type ComponentType } from 'react'

export function lazyLoad<T extends ComponentType>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(factory)
}
